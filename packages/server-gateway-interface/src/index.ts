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
  readonly overallCachePolicy: GatewayCachePolicy;
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
  readonly headers: GatewayHTTPHeaders;
}

export interface GatewayGraphQLResponse {
  data?: Record<string, any> | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
  extensions?: Record<string, any>;
  http?: GatewayHTTPResponse;
}

export interface GatewayHTTPResponse {
  readonly headers: GatewayHTTPHeaders;
  status?: number;
}

export interface GatewayHTTPHeaders {
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  has(name: string): boolean;
  set(name: string, value: string): void;

  entries(): Iterator<[string, string]>;
  keys(): Iterator<string>;
  values(): Iterator<string>;
  [Symbol.iterator](): Iterator<[string, string]>;
}

export type GatewaySchemaHash = string & { __fauxpaque: 'SchemaHash' };

export interface GatewayGraphQLRequestMetrics {
  captureTraces?: boolean;
  persistedQueryHit?: boolean;
  persistedQueryRegister?: boolean;
  responseCacheHit?: boolean;
  forbiddenOperation?: boolean;
  registeredOperation?: boolean;
  startHrTime?: [number, number];
  queryPlanTrace?: Trace.QueryPlanNode;
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
