import type {
  GraphQLSchema,
  ValidationContext,
  ASTVisitor,
  GraphQLFormattedError,
  OperationDefinitionNode,
  DocumentNode,
  GraphQLError,
  GraphQLResolveInfo,
  GraphQLCompositeType,
} from 'graphql';

// TODO(AS4): Audit entire package for appropriateness of exports
// TODO(AS4): Consider merging back in to `@apollo/server`. The motivation
//   for a separate package is so that packages implementing plugins (and
//   @apollo/gateway) don't need to have a dep on `@apollo/server` but maybe
//   a peer dep would be appropriate for these.

// This seems like it could live in this package too.
import type { KeyValueCache } from 'apollo-server-caching';
import type { Trace } from '@apollo/usage-reporting-protobuf';
import type { Logger } from '@apollo/utils.logger';

// TODO(AS4): Document this interface.
export interface HTTPGraphQLRequest {
  // capitalized (GET, POST, etc)
  method: string;
  // lowercase header name, multiple headers joined with ', ' like Headers.get
  // does
  headers: Map<string, string>;
  // no name normalization. can theoretically have deeply nested stuff if you
  // use a search parameter parser like `qs` (used by `express` by default) that does
  // that and you want to look for that in your own plugin. AS itself will only
  // look for a handful of keys and will validate their value types.
  searchParams: any;
  // read by your body-parser or whatever. we poke at it to make it into
  // the right real type.
  body: any;
}

export interface HTTPGraphQLResponseChunk {
  // TODO(AS4): is it reasonable to make users have to lowercase keys? should
  // we write our own Headers class? would prefer to not use a specific node-fetch
  // implementation in AS4.
  headers: Map<string, string>;
  body: string;
}

export type HTTPGraphQLResponse = {
  statusCode?: number;
  // need to figure out what headers this includes (eg JSON???)
  headers: Map<string, string>;
} & (
  | {
      // TODO(AS4): document why we chose strings as output. (tl;dr: consistent
      // rather than flexible JSON output. Can represent landing page. We can
      // always add another entry point that returns un-serialized responses
      // later.)
      completeBody: string;
      bodyChunks: null;
    }
  | {
      completeBody: null;
      bodyChunks: AsyncIterableIterator<HTTPGraphQLResponseChunk>;
    }
);

export type BaseContext = {};

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * It is not recommended to use this `AnyFunction` type further.
 *
 * This is a legacy type which aims to do what its name suggests (be the type
 * for _any_ function) but it should be replaced with something from the
 * TypeScript standard lib.  It doesn't truly cover "any" function right now,
 * and in particular doesn't consider `this`.  For now, it has been brought
 * here from the Apollo Server `Dispatcher`, where it was first utilized.
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * A map of `AnyFunction`s which are the interface for our plugin API's
 * request listeners. (e.g. `GraphQLRequestListener`s).
 */
export type AnyFunctionMap = { [key: string]: AnyFunction | undefined };

// Configuration for how Apollo Server talks to the Apollo registry, as passed
// to the ApolloServer constructor. Each field can also be provided as an
// environment variable.
export interface ApolloConfigInput {
  // Your Apollo API key. Environment variable: APOLLO_KEY.
  key?: string;
  // The graph ref for your graph, eg `my-graph@my-variant` or `my-graph` to use
  // your graph's default variant. Environment variable: APOLLO_GRAPH_REF. For
  // backwards compatibility, may alternatively specify the ref as graphId and
  // graphVariant separately.
  graphRef?: string;
  // TODO(AS4): Consider dropping support for specifying ID and variant separately.
  //
  // The graph ID of your graph, eg `my-graph`. Environment variable:
  // APOLLO_GRAPH_ID.
  graphId?: string;
  // Your graph's variant name, eg `my-variant`. Environment variable:
  // APOLLO_GRAPH_VARIANT.
  graphVariant?: string;
}

// Configuration for how Apollo Server talks to the Apollo registry, with
// some defaults filled in from the ApolloConfigInput passed to the constructor.
export interface ApolloConfig {
  key?: string;
  keyHash?: string;
  graphRef?: string;
}

// TODO(AS4): Rename this type to Server rather than Service or something.
export interface GraphQLServiceContext {
  logger: Logger;
  schema: GraphQLSchema;
  apollo: ApolloConfig;
  // TODO(AS4): Make sure we document that we removed `persistedQueries`.
  serverlessFramework: boolean;
}

export interface GraphQLSchemaContext {
  apiSchema: GraphQLSchema;
  coreSupergraphSdl?: string;
}

export interface GraphQLRequest {
  query?: string;
  operationName?: string;
  variables?: VariableValues;
  extensions?: Record<string, any>;
  http?: HTTPGraphQLRequest;
}

export type VariableValues = { [name: string]: any };

// TODO(AS4): does this differ in an interesting way from GraphQLExecutionResult
// and graphql-js ExecutionResult? It does have `http` but perhaps this can be an
// "extends". Ah, the difference is about formatted vs throwable errors? Let's
// make sure we at least understand it.
export interface GraphQLResponse {
  data?: Record<string, any> | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
  extensions?: Record<string, any>;
  // TODO(AS4): Seriously consider whether this type makes sense at all or whether
  // http response should just be its own top level thing on HTTPRequestContext?
  http?: Pick<HTTPGraphQLResponse, 'headers' | 'statusCode'>;
}

export interface GraphQLRequestMetrics {
  // It would be more accurate to call this fieldLevelInstrumentation (it is
  // true if the hook of that name returns truthy) but for backwards
  // compatibility we keep this name (this field is read by `@apollo/gateway` to
  // decide whether or not to send the apollo-federation-include-trace header).
  captureTraces?: boolean;
  persistedQueryHit?: boolean;
  persistedQueryRegister?: boolean;
  responseCacheHit?: boolean;
  forbiddenOperation?: boolean;
  registeredOperation?: boolean;
  startHrTime?: [number, number];
  queryPlanTrace?: Trace.QueryPlanNode;
}

export interface GraphQLRequestContext<TContext = Record<string, any>> {
  readonly request: GraphQLRequest;
  readonly response?: GraphQLResponse;

  logger: Logger;

  readonly schema: GraphQLSchema;

  readonly contextValue: TContext;
  readonly cache: KeyValueCache;

  readonly queryHash?: string;

  readonly document?: DocumentNode;
  readonly source?: string;

  // `operationName` is set based on the operation AST, so it is defined even if
  // no `request.operationName` was passed in.  It will be set to `null` for an
  // anonymous operation, or if `requestName.operationName` was passed in but
  // doesn't resolve to an operation in the document.
  readonly operationName?: string | null;
  readonly operation?: OperationDefinitionNode;

  /**
   * Unformatted errors which have occurred during the request. Note that these
   * are present earlier in the request pipeline and differ from **formatted**
   * errors which are the result of running the user-configurable `formatError`
   * transformation function over specific errors.
   */
  readonly errors?: ReadonlyArray<GraphQLError>;

  readonly metrics: GraphQLRequestMetrics;

  readonly overallCachePolicy: CachePolicy;
}

export type ValidationRule = (context: ValidationContext) => ASTVisitor;

export type GraphQLExecutor<TContext = Record<string, any>> = (
  requestContext: GraphQLRequestContextExecutionDidStart<TContext>,
) => Promise<GraphQLExecutionResult>;

// TODO(AS4): Can we just use graphql-js ExecutionResult? The main difference
// seems to be any vs unknown, although we could at least use
// `ExecutionResult<Record<string, any>, Record<string, any>>`.
export type GraphQLExecutionResult = {
  data?: Record<string, any> | null;
  errors?: ReadonlyArray<GraphQLError>;
  extensions?: Record<string, any>;
};

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

export type GraphQLRequestContextDidResolveSource<TContext> = WithRequired<
  GraphQLRequestContext<TContext>,
  'metrics' | 'source' | 'queryHash'
>;
export type GraphQLRequestContextParsingDidStart<TContext> =
  GraphQLRequestContextDidResolveSource<TContext>;
export type GraphQLRequestContextValidationDidStart<TContext> =
  GraphQLRequestContextParsingDidStart<TContext> &
    WithRequired<GraphQLRequestContext<TContext>, 'document'>;
export type GraphQLRequestContextDidResolveOperation<TContext> =
  GraphQLRequestContextValidationDidStart<TContext> &
    WithRequired<
      GraphQLRequestContext<TContext>,
      'operation' | 'operationName'
    >;
export type GraphQLRequestContextDidEncounterErrors<TContext> = WithRequired<
  GraphQLRequestContext<TContext>,
  'metrics' | 'errors'
>;
export type GraphQLRequestContextResponseForOperation<TContext> = WithRequired<
  GraphQLRequestContext<TContext>,
  'metrics' | 'source' | 'document' | 'operation' | 'operationName'
>;
export type GraphQLRequestContextExecutionDidStart<TContext> =
  GraphQLRequestContextParsingDidStart<TContext> &
    WithRequired<
      GraphQLRequestContext<TContext>,
      'document' | 'operation' | 'operationName'
    >;
export type GraphQLRequestContextWillSendResponse<TContext> =
  GraphQLRequestContextDidResolveSource<TContext> &
    WithRequired<GraphQLRequestContext<TContext>, 'metrics' | 'response'>;

/**
 * CacheHint represents a contribution to an overall cache policy. It can
 * specify a maxAge and/or a scope.
 */
export interface CacheHint {
  maxAge?: number;
  scope?: CacheScope;
}

/**
 * CacheAnnotation represents the contents of a `@cacheControl` directive.
 * (`inheritMaxAge` is part of this interface and not CacheHint, because
 * `inheritMaxAge` isn't a contributing piece of a cache policy: it just means
 * to not apply default values in some contexts.)
 */
export interface CacheAnnotation extends CacheHint {
  inheritMaxAge?: true;
}

export type CacheScope = 'PUBLIC' | 'PRIVATE';

/**
 * CachePolicy is a mutable CacheHint with helpful methods for updating its
 * fields.
 */
export interface CachePolicy extends CacheHint {
  /**
   * Mutate this CachePolicy by replacing each field defined in `hint`. This can
   * make the policy more restrictive or less restrictive.
   */
  replace(hint: CacheHint): void;

  /**
   * Mutate this CachePolicy by restricting each field defined in `hint`. This
   * can only make the policy more restrictive: a previously defined `maxAge`
   * can only be reduced, and a previously Private scope cannot be made Public.
   */
  restrict(hint: CacheHint): void;

  /**
   * If this policy has a positive `maxAge`, then return a copy of itself as a
   * `CacheHint` with both fields defined. Otherwise return null.
   */
  policyIfCacheable(): Required<CacheHint> | null;
}

/**
 * When using Apollo Server with the cache control plugin (on by default), an
 * object of this kind is available to resolvers on `info.cacheControl`.
 */
export interface ResolveInfoCacheControl {
  cacheHint: CachePolicy;
  // Shorthand for `cacheHint.replace(hint)`; also for compatibility with
  // the Apollo Server 2.x API.
  setCacheHint(hint: CacheHint): void;

  cacheHintFromType(t: GraphQLCompositeType): CacheHint | undefined;
}

declare module 'graphql/type/definition' {
  interface GraphQLResolveInfo {
    cacheControl: ResolveInfoCacheControl;
  }
}
