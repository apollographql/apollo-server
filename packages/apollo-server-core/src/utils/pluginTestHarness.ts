import {
  WithRequired,
  GraphQLRequest,
  GraphQLRequestContextExecutionDidStart,
  GraphQLResponse,
  ValueOrPromise,
  GraphQLRequestContextWillSendResponse,
  GraphQLRequestContext,
  Logger,
} from 'apollo-server-types';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql/type';
import { CacheHint } from 'apollo-cache-control';
import {
  enablePluginsForSchemaResolvers,
  symbolExecutionDispatcherWillResolveField,
} from './schemaInstrumentation';
import {
  ApolloServerPlugin,
  GraphQLRequestExecutionListener,
} from 'apollo-server-plugin-base';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { Dispatcher } from './dispatcher';
import { generateSchemaHash } from "./schemaHash";

// This test harness guarantees the presence of `query`.
type IPluginTestHarnessGraphqlRequest = WithRequired<GraphQLRequest, 'query'>;
type IPluginTestHarnessExecutionDidStart<TContext> =
  GraphQLRequestContextExecutionDidStart<TContext> & {
    request: IPluginTestHarnessGraphqlRequest,
  };

export default async function pluginTestHarness<TContext>({
  pluginInstance,
  schema,
  logger,
  graphqlRequest,
  overallCachePolicy,
  executor,
  context = Object.create(null)
}: {
  /**
   * An instance of the plugin to test.
   */
  pluginInstance: ApolloServerPlugin<TContext>,

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
  ) => ValueOrPromise<GraphQLResponse>;

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
            }
          }
        }
      })
    });
  }

  const schemaHash = generateSchemaHash(schema);
  if (typeof pluginInstance.serverWillStart === 'function') {
    pluginInstance.serverWillStart({
      logger: logger || console,
      schema,
      schemaHash,
      engine: {},
    });
  }


  const requestContext: GraphQLRequestContext<TContext> = {
    logger: logger || console,
    schema,
    schemaHash: generateSchemaHash(schema),
    request: graphqlRequest,
    metrics: Object.create(null),
    source: graphqlRequest.query,
    cache: new InMemoryLRUCache(),
    context,
  };

  requestContext.overallCachePolicy = overallCachePolicy;

  if (typeof pluginInstance.requestDidStart !== "function") {
    throw new Error("This test harness expects this to be defined.");
  }

  const listener = pluginInstance.requestDidStart(requestContext);

  const dispatcher = new Dispatcher(listener ? [listener] : []);

  const executionListeners: GraphQLRequestExecutionListener<TContext>[] = [];

  // This execution dispatcher logic is duplicated in the request pipeline
  // right now.
  dispatcher.invokeHookSync(
    'executionDidStart',
    requestContext as GraphQLRequestContextExecutionDidStart<TContext>,
  ).forEach(executionListener => {
    if (typeof executionListener === 'function') {
      executionListeners.push({
        executionDidEnd: executionListener,
      });
    } else if (typeof executionListener === 'object') {
      executionListeners.push(executionListener);
    }
  });

  const executionDispatcher = new Dispatcher(executionListeners);

  // Create a callback that will trigger the execution dispatcher's
  // `willResolveField` hook.  We will attach this to the context on a
  // symbol so it can be invoked by our `wrapField` method during execution.
  const invokeWillResolveField: GraphQLRequestExecutionListener<
    TContext
  >['willResolveField'] = (...args) =>
      executionDispatcher.invokeDidStartHook('willResolveField', ...args);

  Object.defineProperty(
    requestContext.context,
    symbolExecutionDispatcherWillResolveField,
    { value: invokeWillResolveField }
  );

  // If the schema is already enabled, this is a no-op.  Otherwise, the
  // schema will be augmented so it is able to invoke willResolveField.
  enablePluginsForSchemaResolvers(schema);

  try {
    // `response` is readonly, so we'll cast to `any` to assign to it.
    (requestContext.response as any) = await executor(
      requestContext as IPluginTestHarnessExecutionDidStart<TContext>,
    );
    executionDispatcher.reverseInvokeHookSync("executionDidEnd");

  } catch (executionErr) {
    executionDispatcher.reverseInvokeHookSync("executionDidEnd", executionErr);
  }

  await dispatcher.invokeHookAsync(
    "willSendResponse",
    requestContext as GraphQLRequestContextWillSendResponse<TContext>,
  );

  return requestContext as GraphQLRequestContextWillSendResponse<TContext>;
}
