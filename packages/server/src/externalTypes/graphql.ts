import type { Trace } from '@apollo/usage-reporting-protobuf';
import type {
  DocumentNode,
  FormattedExecutionResult,
  GraphQLError,
  GraphQLSchema,
  OperationDefinitionNode,
} from 'graphql';
import type { CachePolicy } from '@apollo/cache-control-types';
import type { BaseContext } from './context';
import type { HTTPGraphQLHead, HTTPGraphQLRequest } from './http';
import type { Logger } from '@apollo/utils.logger';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';

export interface GraphQLRequest {
  query?: string;
  operationName?: string;
  variables?: VariableValues;
  extensions?: Record<string, any>;
  http?: HTTPGraphQLRequest;
}

export type VariableValues = { [name: string]: any };

export interface GraphQLResponse {
  // TODO(AS4): for incremental delivery, maybe we'll have an iterator here
  // instead of a single result?
  result: FormattedExecutionResult;
  http: HTTPGraphQLHead;
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

export interface GraphQLRequestContext<TContext extends BaseContext> {
  readonly logger: Logger;
  readonly cache: KeyValueCache<string>;

  readonly request: GraphQLRequest;
  readonly response: GraphQLResponse;

  readonly schema: GraphQLSchema;

  readonly contextValue: TContext;

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
   * transformation function over specific errors; these can eventually be found
   * in `response.result.errors`.
   */
  readonly errors?: ReadonlyArray<GraphQLError>;

  readonly metrics: GraphQLRequestMetrics;

  readonly overallCachePolicy: CachePolicy;
}
