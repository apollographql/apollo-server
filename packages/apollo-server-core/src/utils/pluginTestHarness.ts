import {
  CacheHint,
  WithRequired,
  GraphQLRequest,
  GraphQLRequestContextExecutionDidStart,
  GraphQLResponse,
  GraphQLRequestContextWillSendResponse,
  GraphQLRequestContext,
  Logger,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextDidResolveSource,
  GraphQLRequestContextParsingDidStart,
  GraphQLRequestContextValidationDidStart,
} from 'apollo-server-types';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql/type';
import {
  enablePluginsForSchemaResolvers,
  symbolExecutionDispatcherWillResolveField,
} from './schemaInstrumentation';
import {
  ApolloServerPlugin,
  GraphQLRequestExecutionListener,
  GraphQLServerListener,
} from 'apollo-server-plugin-base';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { Dispatcher } from './dispatcher';
import { generateSchemaHash } from './schemaHash';
import { getOperationAST, parse, validate as graphqlValidate } from 'graphql';
import { newCachePolicy } from '../cachePolicy';

// This test harness guarantees the presence of `query`.
type IPluginTestHarnessGraphqlRequest = WithRequired<GraphQLRequest, 'query'>;
type IPluginTestHarnessExecutionDidStart<TContext> =
  GraphQLRequestContextExecutionDidStart<TContext> & {
    request: IPluginTestHarnessGraphqlRequest;
  };

export default async function pluginTestHarness<TContext>({
  pluginInstance,
  schema,
  logger,
  graphqlRequest,
  overallCachePolicy,
  executor,
  context = Object.create(null),
}: {
  /**
   * An instance of the plugin to test.
   */
  pluginInstance: ApolloServerPlugin<TContext>;

  /**
   * The optional schema that will be received by the executor.  If not
   * specified, a simple default schema will be created.  In either case,
   * the schema will be mutated by wrapping the resolvers with the
   * `willResolveField` instrumentation that will allow it to respond to
   * that lifecycle hook's implementations plugins.
   */
  schema?: GraphQLSchema;

  /**
   * An optional logger (Defaults to `console`)
   */
  logger?: Logger;

  /**
   * The `GraphQLRequest` which will be received by the `executor`.  The
   * `query` is required, and this doesn't support anything more exotic,
   * like automated persisted queries (APQ).
   */
  graphqlRequest: IPluginTestHarnessGraphqlRequest;

  /**
   * Overall cache control policy.
   */
  overallCachePolicy?: Required<CacheHint>;

  /**
   * This method will be executed to retrieve the response.
   */
  executor: (
    requestContext: IPluginTestHarnessExecutionDidStart<TContext>,
  ) => Promise<GraphQLResponse>;

  /**
   * (optional) To provide a user context, if necessary.
   */
  context?: TContext;
}): Promise<GraphQLRequestContextWillSendResponse<TContext>> {
  if (!schema) {
    schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'RootQueryType',
        fields: {
          hello: {
            type: GraphQLString,
            resolve() {
              return 'hello world';
            },
          },
        },
      }),
    });
  }

  const schemaHash = generateSchemaHash(schema);
  let serverListener: GraphQLServerListener | undefined;
  if (typeof pluginInstance.serverWillStart === 'function') {
    const maybeServerListener = await pluginInstance.serverWillStart({
      logger: logger || console,
      schema,
      schemaHash,
      serverlessFramework: false,
      apollo: {
        key: 'some-key',
        graphRef: 'graph@current',
      },
    });
    if (maybeServerListener && maybeServerListener.serverWillStop) {
      serverListener = maybeServerListener;
    }
  }

  type Mutable<T> = { -readonly [P in keyof T]: T[P] };

  const requestContext: Mutable<GraphQLRequestContext<TContext>> = {
    logger: logger || console,
    schema,
    schemaHash: generateSchemaHash(schema),
    request: graphqlRequest,
    metrics: Object.create(null),
    source: graphqlRequest.query,
    cache: new InMemoryLRUCache(),
    context,
    overallCachePolicy: newCachePolicy(),
  };

  if (requestContext.source === undefined) {
    throw new Error('No source provided for test');
  }

  if (overallCachePolicy) {
    requestContext.overallCachePolicy.replace(overallCachePolicy);
  }

  if (typeof pluginInstance.requestDidStart !== 'function') {
    throw new Error('This test harness expects this to be defined.');
  }

  const listener = await pluginInstance.requestDidStart(requestContext);

  const dispatcher = new Dispatcher(listener ? [listener] : []);

  const executionListeners: GraphQLRequestExecutionListener<TContext>[] = [];

  // Let the plugins know that we now have a STRING of what we hope will
  // parse and validate into a document we can execute on.  Unless we have
  // retrieved this from our APQ cache, there's no guarantee that it is
  // syntactically correct, so this string should not be trusted as a valid
  // document until after it's parsed and validated.
  await dispatcher.invokeHook(
    'didResolveSource',
    requestContext as GraphQLRequestContextDidResolveSource<TContext>,
  );

  if (!requestContext.document) {
    await dispatcher.invokeDidStartHook(
      'parsingDidStart',
      requestContext as GraphQLRequestContextParsingDidStart<TContext>,
    );

    try {
      requestContext.document = parse(requestContext.source, undefined);
    } catch (syntaxError) {
      const errorOrErrors = syntaxError;
      requestContext.errors = Array.isArray(errorOrErrors)
        ? errorOrErrors
        : [errorOrErrors];
      await dispatcher.invokeHook(
        'didEncounterErrors',
        requestContext as GraphQLRequestContextDidEncounterErrors<TContext>,
      );
      await dispatcher.invokeHook(
        'willSendResponse',
        requestContext as GraphQLRequestContextWillSendResponse<TContext>,
      );

      return requestContext as GraphQLRequestContextWillSendResponse<TContext>;
    }

    const validationDidEnd = await dispatcher.invokeDidStartHook(
      'validationDidStart',
      requestContext as GraphQLRequestContextValidationDidStart<TContext>,
    );

    /**
     * We are validating only with the default rules.
     */
    const validationErrors = graphqlValidate(
      requestContext.schema,
      requestContext.document,
    );

    if (validationErrors.length !== 0) {
      requestContext.errors = validationErrors;
      validationDidEnd(validationErrors);
      await dispatcher.invokeHook(
        'didEncounterErrors',
        requestContext as GraphQLRequestContextDidEncounterErrors<TContext>,
      );
      await dispatcher.invokeHook(
        'willSendResponse',
        requestContext as GraphQLRequestContextWillSendResponse<TContext>,
      );
      return requestContext as GraphQLRequestContextWillSendResponse<TContext>;
    } else {
      validationDidEnd();
    }
  }

  const operation = getOperationAST(
    requestContext.document,
    requestContext.request.operationName,
  );

  requestContext.operation = operation || undefined;
  // We'll set `operationName` to `null` for anonymous operations.  Note that
  // usage reporting relies on the fact that the requestContext passed
  // to requestDidStart is mutated to add this field before requestDidEnd is
  // called
  requestContext.operationName =
    (operation && operation.name && operation.name.value) || null;

  await dispatcher.invokeHook(
    'didResolveOperation',
    requestContext as GraphQLRequestContextExecutionDidStart<TContext>,
  );

  // This execution dispatcher logic is duplicated in the request pipeline
  // right now.
  (
    await dispatcher.invokeHook(
      'executionDidStart',
      requestContext as GraphQLRequestContextExecutionDidStart<TContext>,
    )
  ).forEach((executionListener) => {
    if (executionListener) {
      executionListeners.push(executionListener);
    }
  });
  executionListeners.reverse();

  const executionDispatcher = new Dispatcher(executionListeners);

  // Create a callback that will trigger the execution dispatcher's
  // `willResolveField` hook.  We will attach this to the context on a
  // symbol so it can be invoked by our `wrapField` method during execution.
  const invokeWillResolveField: GraphQLRequestExecutionListener<TContext>['willResolveField'] =
    (...args) =>
      executionDispatcher.invokeSyncDidStartHook('willResolveField', ...args);

  Object.defineProperty(
    requestContext.context,
    symbolExecutionDispatcherWillResolveField,
    { value: invokeWillResolveField },
  );

  // If the schema is already enabled, this is a no-op.  Otherwise, the
  // schema will be augmented so it is able to invoke willResolveField.
  enablePluginsForSchemaResolvers(schema);

  try {
    // `response` is readonly, so we'll cast to `any` to assign to it.
    (requestContext.response as any) = await executor(
      requestContext as IPluginTestHarnessExecutionDidStart<TContext>,
    );
    await executionDispatcher.invokeHook('executionDidEnd');
  } catch (executionErr) {
    await executionDispatcher.invokeHook('executionDidEnd', executionErr);
  }

  await dispatcher.invokeHook(
    'willSendResponse',
    requestContext as GraphQLRequestContextWillSendResponse<TContext>,
  );

  await serverListener?.serverWillStop?.();

  return requestContext as GraphQLRequestContextWillSendResponse<TContext>;
}
