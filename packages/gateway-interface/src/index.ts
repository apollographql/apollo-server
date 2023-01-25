import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import type {
  DocumentNode,
  ExecutionResult,
  GraphQLError,
  GraphQLFormattedError,
  GraphQLSchema,
  OperationDefinitionNode,
} from 'graphql';
import type { Logger } from '@apollo/utils.logger';
import type { Trace } from '@apollo/usage-reporting-protobuf';
import type { FetcherHeaders } from '@apollo/utils.fetcher';

export interface GatewayInterface {
  onSchemaLoadOrUpdate(
    callback: GatewaySchemaLoadOrUpdateCallback,
  ): GatewayUnsubscriber;
  load(options: { apollo: GatewayApolloConfig }): Promise<GatewayLoadResult>;
  stop(): Promise<void>;
}

export type GatewaySchemaLoadOrUpdateCallback = (schemaContext: {
  apiSchema: GraphQLSchema;
  coreSupergraphSdl: string;
}) => void;

export type GatewayUnsubscriber = () => void;

export interface GatewayApolloConfig {
  key?: string;
  keyHash?: string;
  graphRef?: string;
}

export interface GatewayLoadResult {
  executor: GatewayExecutor | null;
}

export type GatewayExecutor = (
  requestContext: GatewayGraphQLRequestContext,
) => Promise<GatewayExecutionResult>;

export type GatewayExecutionResult = ExecutionResult<
  Record<string, any>,
  Record<string, any>
>;

// Note that the default value for TContext is the same as in AS3, not
// BaseContext.
export interface GatewayGraphQLRequestContext<TContext = Record<string, any>> {
  readonly request: GatewayGraphQLRequest;
  readonly response?: GatewayGraphQLResponse;
  logger: Logger;
  readonly schema: GraphQLSchema;
  readonly schemaHash: GatewaySchemaHash;
  readonly context: TContext;
  readonly cache: KeyValueCache;
  readonly queryHash: string;
  readonly document: DocumentNode;
  readonly source: string;
  readonly operationName: string | null;
  readonly operation: OperationDefinitionNode;
  readonly errors?: ReadonlyArray<GraphQLError>;
  readonly metrics: GatewayGraphQLRequestMetrics;
  debug?: boolean;
  // In AS3 and AS4, this field is always set and is a GatewayCachePolicy, but
  // in AS2 it is not always set and is only a GatewayCacheHint. We can't just
  // declare this as `readonly overallCachePolicy?: GatewayCachePolicy |
  // GatewayCacheHint` because then older versions of Gateway built against AS3
  // types will fail to build. Gateway's own code always probes this field at
  // runtime before using it anyway, so let's just make everything build by
  // declaring this as `any`.
  readonly overallCachePolicy: any;
  // This was only added in v3.11/v4.1, so we don't want to declare that it's
  // required. (In fact, we made it optional in v3.11.1 for this very reason.)
  readonly requestIsBatched?: boolean;
}

export interface GatewayGraphQLRequest {
  query?: string;
  operationName?: string;
  variables?: Record<string, any>;
  extensions?: Record<string, any>;
  http?: GatewayHTTPRequest;
}

export interface GatewayHTTPRequest {
  readonly method: string;
  readonly url: string;
  readonly headers: FetcherHeaders;
}

export interface GatewayGraphQLResponse {
  data?: Record<string, any> | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
  extensions?: Record<string, any>;
  http?: GatewayHTTPResponse;
}

export interface GatewayHTTPResponse {
  readonly headers: FetcherHeaders;
  status?: number;
}

export type GatewaySchemaHash = string & { __fauxpaque: 'SchemaHash' };

export interface NonFtv1ErrorPath {
  subgraph: string;
  path: GraphQLError['path'];
}

export interface GatewayGraphQLRequestMetrics {
  captureTraces?: boolean;
  persistedQueryHit?: boolean;
  persistedQueryRegister?: boolean;
  responseCacheHit?: boolean;
  forbiddenOperation?: boolean;
  registeredOperation?: boolean;
  startHrTime?: [number, number];
  queryPlanTrace?: Trace.QueryPlanNode;
  nonFtv1ErrorPaths?: NonFtv1ErrorPath[];
}

export interface GatewayCachePolicy extends GatewayCacheHint {
  replace(hint: GatewayCacheHint): void;
  restrict(hint: GatewayCacheHint): void;
  policyIfCacheable(): Required<GatewayCacheHint> | null;
}

export interface GatewayCacheHint {
  maxAge?: number;
  // In AS3, this field is an enum. In TypeScript, enums are not structurally
  // typed: you need to actually refer directly to the enum's definition to
  // produce a value of its type in a typesafe way. Doing that would prevent us
  // from severing the dependency on apollo-server-types (AS3), so instead we
  // just use 'any'. The legal runtime values of this fields are the strings
  // `PUBLIC` and `PRIVATE`.
  scope?: any;
}
