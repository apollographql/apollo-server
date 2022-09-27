/**
 * This file exports types related specifically to GraphQL execution, most
 * notably `GraphQLRequest` and `GraphQLResponse`, used most heavily by
 * `executeHTTPGraphQLRequest` and `executeOperation`. The
 * `responseForOperation` plugin hook also returns a `GraphQLResponse`.
 */
import type { Trace } from '@apollo/usage-reporting-protobuf';
import type {
  DocumentNode,
  FormattedExecutionResult,
  GraphQLError,
  GraphQLSchema,
  OperationDefinitionNode,
} from 'graphql';
import type { CachePolicy } from '@apollo/cache-control-types';
import type { BaseContext } from './context.js';
import type { HTTPGraphQLHead, HTTPGraphQLRequest } from './http.js';
import type { Logger } from '@apollo/utils.logger';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import type { WithRequired } from '@apollo/utils.withrequired';
import type {
  GraphQLExperimentalFormattedInitialIncrementalExecutionResult,
  GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult,
} from './incrementalDeliveryPolyfill.js';

export interface GraphQLRequest<
  TVariables extends VariableValues = VariableValues,
> {
  query?: string;
  operationName?: string;
  variables?: TVariables;
  extensions?: Record<string, any>;
  http?: HTTPGraphQLRequest;
}

export type VariableValues = { [name: string]: any };

// A GraphQL response can either be a single result, or an initial result
// followed by a stream of subsequent results. The latter occurs when the
// GraphQL operation uses incremental delivery directives such as `@defer` or
// `@stream`. Note that incremental delivery currently requires using a
// pre-release of graphql-js v17.
export type GraphQLResponseBody<TData = Record<string, unknown>> =
  | {
      kind: 'single';
      singleResult: FormattedExecutionResult<TData>;
    }
  | {
      kind: 'incremental';
      initialResult: GraphQLExperimentalFormattedInitialIncrementalExecutionResult;
      subsequentResults: AsyncIterable<GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult>;
    };

export type GraphQLInProgressResponse<TData = Record<string, unknown>> = {
  http: HTTPGraphQLHead;
  body?: GraphQLResponseBody<TData>;
};

export type GraphQLResponse<TData = Record<string, unknown>> = WithRequired<
  GraphQLInProgressResponse<TData>,
  'body'
>;

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
  readonly response: GraphQLInProgressResponse;

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

export interface ExecuteOperationOptions<TContext extends BaseContext> {
  contextValue?: TContext;
}
