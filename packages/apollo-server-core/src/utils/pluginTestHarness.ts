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
  symbolRequestListenerDispatcher,
} from '../requestPipelineAPI';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
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

  enablePluginsForSchemaResolvers(schema);

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
    throw new Error("Should be impossible as the plugin is defined.");
  }

  const listener = pluginInstance.requestDidStart(requestContext);

  if (!listener) {
    throw new Error("Should be impossible to not have a listener.");
  }

  if (typeof listener.willResolveField !== 'function') {
    throw new Error("Should be impossible to not have 'willResolveField'.");
  }

  const dispatcher = new Dispatcher([listener]);

  // Put the dispatcher on the context so `willResolveField` can access it.
  Object.defineProperty(requestContext.context, symbolRequestListenerDispatcher, {
    value: dispatcher,
  });

  const executionDidEnd = dispatcher.invokeDidStartHook(
    "executionDidStart",
    requestContext as IPluginTestHarnessExecutionDidStart<TContext>,
  );

  try {
    // `response` is readonly, so we'll cast to `any` to assign to it.
    (requestContext.response as any) = await executor(
      requestContext as IPluginTestHarnessExecutionDidStart<TContext>,
    );
    executionDidEnd();
  } catch (executionError) {
    executionDidEnd(executionError);
  }

  await dispatcher.invokeHookAsync(
    "willSendResponse",
    requestContext as GraphQLRequestContextWillSendResponse<TContext>,
  );

  return requestContext as GraphQLRequestContextWillSendResponse<TContext>;
}
