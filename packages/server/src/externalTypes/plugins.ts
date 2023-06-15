/**
 * The types defined in this file are useful to plugin authors. In particular,
 * defining a plugin as an `ApolloServerPlugin` will provide typings for all of
 * the hooks that are available to a plugin.
 */
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import type { Logger } from '@apollo/utils.logger';
import type { GraphQLError, GraphQLResolveInfo, GraphQLSchema } from 'graphql';
import type { ApolloConfig } from './constructor.js';
import type { BaseContext } from './context.js';
import type { GraphQLResponse } from './graphql.js';
import type { GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult } from './incrementalDeliveryPolyfill.js';
import type {
  GraphQLRequestContext,
  GraphQLRequestContextDidEncounterErrors,
  GraphQLRequestContextDidEncounterSubsequentErrors,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestContextDidResolveSource,
  GraphQLRequestContextExecutionDidStart,
  GraphQLRequestContextParsingDidStart,
  GraphQLRequestContextResponseForOperation,
  GraphQLRequestContextValidationDidStart,
  GraphQLRequestContextWillSendResponse,
  GraphQLRequestContextWillSendSubsequentPayload,
} from './requestPipeline.js';

export interface GraphQLServerContext {
  readonly logger: Logger;
  readonly cache: KeyValueCache<string>;

  schema: GraphQLSchema;
  apollo: ApolloConfig;
  startedInBackground: boolean;
}

export interface GraphQLSchemaContext {
  apiSchema: GraphQLSchema;
  coreSupergraphSdl?: string;
}

export interface ApolloServerPlugin<
  in TContext extends BaseContext = BaseContext,
> {
  // Called once on server startup, after the schema has been loaded.
  serverWillStart?(
    service: GraphQLServerContext,
  ): Promise<GraphQLServerListener | void>;

  // Called once per request, before parsing or validation of the request has
  // occurred. This hook can return an object of more fine-grained hooks (see
  // `GraphQLRequestListener`) which pertain to the lifecycle of the request.
  requestDidStart?(
    requestContext: GraphQLRequestContext<TContext>,
  ): Promise<GraphQLRequestListener<TContext> | void>;

  /**
   * "Unexpected" errors do not include more common errors like validation,
   * parsing, or graphql execution errors. Rather, an unexpected error might
   * occur when a plugin hook throws unexpectedly or a bug in Apollo Server is
   * encountered. Notably, when errors like this occur, the error is masked to
   * the client.
   */
  unexpectedErrorProcessingRequest?({
    requestContext,
    error,
  }: {
    requestContext: GraphQLRequestContext<TContext>;
    error: Error;
  }): Promise<void>;
  // Called specifically when the user-provided `context` function throws an
  // error.
  contextCreationDidFail?({ error }: { error: Error }): Promise<void>;
  /**
   * This hook is called any time a "Bad Request" error is thrown during request
   * execution. This includes CSRF prevention and malformed requests (e.g.
   * incorrect headers, invalid JSON body, or invalid search params for GET),
   * but does not include malformed GraphQL.
   */
  invalidRequestWasReceived?({ error }: { error: Error }): Promise<void>;
  // Called on startup fail. This can occur if the schema fails to load or if a
  // `serverWillStart` or `renderLandingPage` hook throws.
  startupDidFail?({ error }: { error: Error }): Promise<void>;
}

export interface GraphQLServerListener {
  // Called on server startup after a successful schema load and on successful
  // schema updates when running in `gateway` mode.
  schemaDidLoadOrUpdate?(schemaContext: GraphQLSchemaContext): void;

  // When your server is stopped (by calling `stop()` or via the
  // `SIGINT`/`SIGTERM` handlers), Apollo Server first awaits all `drainServer`
  // hooks in parallel. GraphQL operations can still execute while `drainServer`
  // is in progress. A typical use is to stop listening for new connections and
  // wait until all current connections are idle. The built-in
  // ApolloServerPluginDrainHttpServer implements this method.
  drainServer?(): Promise<void>;

  // When your server is stopped (by calling `stop()` or via the
  // `SIGINT`/`SIGTERM` handlers) then (after the `drainServer` phase finishes)
  // Apollo Server transitions into a state where no new operations will run and
  // then awaits all `drainServer` hooks in parallel. A typical use is to flush
  // outstanding observability data.
  serverWillStop?(): Promise<void>;

  // At most one plugin's serverWillStart may return a GraphQLServerListener
  // with this method. If one does, it is called once on server startup and the
  // page it returns is served to clients with `accept: text/html` headers. This
  // is an intentionally simple API; if you want to do something fancy to serve
  // a landing page, you probably should just define a handler in your web
  // framework.
  renderLandingPage?(): Promise<LandingPage>;
}

// The page served to clients with `accept: text/html` headers.
export interface LandingPage {
  html: string | (() => Promise<string>);
}

export type GraphQLRequestListenerParsingDidEnd = (
  err?: Error,
) => Promise<void>;
export type GraphQLRequestListenerValidationDidEnd = (
  err?: ReadonlyArray<Error>,
) => Promise<void>;
export type GraphQLRequestListenerExecutionDidEnd = (
  err?: Error,
) => Promise<void>;
export type GraphQLRequestListenerDidResolveField = (
  error: Error | null,
  result?: any,
) => void;

export interface GraphQLRequestListener<TContext extends BaseContext> {
  didResolveSource?(
    requestContext: GraphQLRequestContextDidResolveSource<TContext>,
  ): Promise<void>;

  parsingDidStart?(
    requestContext: GraphQLRequestContextParsingDidStart<TContext>,
  ): Promise<GraphQLRequestListenerParsingDidEnd | void>;

  validationDidStart?(
    requestContext: GraphQLRequestContextValidationDidStart<TContext>,
  ): Promise<GraphQLRequestListenerValidationDidEnd | void>;

  didResolveOperation?(
    requestContext: GraphQLRequestContextDidResolveOperation<TContext>,
  ): Promise<void>;

  didEncounterErrors?(
    requestContext: GraphQLRequestContextDidEncounterErrors<TContext>,
  ): Promise<void>;

  // If this hook is defined, it is invoked immediately before GraphQL execution
  // would take place. If its return value resolves to a non-null
  // GraphQLResponse, that result is used instead of executing the query.
  // Hooks from different plugins are invoked in series and the first non-null
  // response is used.
  responseForOperation?(
    requestContext: GraphQLRequestContextResponseForOperation<TContext>,
  ): Promise<GraphQLResponse | null>;

  // Note that in the case of incremental delivery, the end hook gets called
  // when the initial response is ready to go: further execution can still occur.
  executionDidStart?(
    requestContext: GraphQLRequestContextExecutionDidStart<TContext>,
  ): Promise<GraphQLRequestExecutionListener<TContext> | void>;

  // Note that in the case of incremental delivery, this is called when the
  // initial response is ready to go.
  willSendResponse?(
    requestContext: GraphQLRequestContextWillSendResponse<TContext>,
  ): Promise<void>;

  didEncounterSubsequentErrors?(
    requestContext: GraphQLRequestContextDidEncounterSubsequentErrors<TContext>,
    errors: ReadonlyArray<GraphQLError>,
  ): Promise<void>;

  // You can use hasNext to tell if this is the end or not.
  willSendSubsequentPayload?(
    requestContext: GraphQLRequestContextWillSendSubsequentPayload<TContext>,
    payload: GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult,
  ): Promise<void>;
}

/**
 * This is an object form of the parameters received by typical
 * `graphql-js` resolvers.  The function type is `GraphQLFieldResolver`
 * and normally uses positional parameters.  In order to facilitate better
 * ergonomics in the Apollo Server plugin API, these have been converted to
 * named properties on the object using their names from the upstream
 * `GraphQLFieldResolver` type signature.  Ergonomic wins, in this case,
 * include not needing to have three unused variables in scope just because
 * there was a need to access the `info` property in a wrapped plugin.
 */
export type GraphQLFieldResolverParams<
  TSource,
  TContext,
  TArgs = { [argName: string]: any },
> = {
  source: TSource;
  args: TArgs;
  contextValue: TContext;
  info: GraphQLResolveInfo;
};

export interface GraphQLRequestExecutionListener<TContext extends BaseContext> {
  executionDidEnd?: GraphQLRequestListenerExecutionDidEnd;
  // willResolveField is not async because we've observed that it already has
  // quite a performance impact on execution even without involving the Promise
  // queue. If we can come up with ways to alleviate the burden (eg having an
  // uninstrumented schema and an instrumented schema and only using the
  // instrumented schema for a subset of operations that need detailed
  // performance traces) we could be happier supporting async willResolveField.
  willResolveField?(
    fieldResolverParams: GraphQLFieldResolverParams<any, TContext>,
  ): GraphQLRequestListenerDidResolveField | void;
}
