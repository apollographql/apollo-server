// This file defines the GraphQLRequestContext type which is an argument to most
// plugin hooks, as well as a variety of variants on it which assert that
// particular sub-fields are set by a particular point in the request pipeline.

import type { WithRequired } from '@apollo/utils.withrequired';
import type { Trace } from '@apollo/usage-reporting-protobuf';
import type { BaseContext } from './context.js';
import type {
  GraphQLInProgressResponse,
  GraphQLRequest,
  GraphQLResponse,
} from './graphql.js';
import type { Logger } from '@apollo/utils.logger';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import type {
  DocumentNode,
  GraphQLError,
  GraphQLSchema,
  OperationDefinitionNode,
} from 'graphql';
import type { CachePolicy } from '@apollo/cache-control-types';
import type { NonFtv1ErrorPath } from '@apollo/server-gateway-interface';

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
  nonFtv1ErrorPaths?: NonFtv1ErrorPath[];
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

  /**
   * True if this request is part of a potentially multi-operation batch. Note
   * that if this is true, `response.http` will be shared with the other
   * operations in the batch.
   */
  readonly requestIsBatched: boolean;
}

export type GraphQLRequestContextDidResolveSource<
  TContext extends BaseContext,
> = WithRequired<GraphQLRequestContext<TContext>, 'source' | 'queryHash'>;
export type GraphQLRequestContextParsingDidStart<TContext extends BaseContext> =
  GraphQLRequestContextDidResolveSource<TContext>;
export type GraphQLRequestContextValidationDidStart<
  TContext extends BaseContext,
> = GraphQLRequestContextParsingDidStart<TContext> &
  WithRequired<GraphQLRequestContext<TContext>, 'document'>;
export type GraphQLRequestContextDidResolveOperation<
  TContext extends BaseContext,
> = GraphQLRequestContextValidationDidStart<TContext> &
  WithRequired<GraphQLRequestContext<TContext>, 'operationName'>;
export type GraphQLRequestContextDidEncounterErrors<
  TContext extends BaseContext,
> = WithRequired<GraphQLRequestContext<TContext>, 'errors'>;
export type GraphQLRequestContextResponseForOperation<
  TContext extends BaseContext,
> = WithRequired<
  GraphQLRequestContext<TContext>,
  'source' | 'document' | 'operation' | 'operationName'
>;
export type GraphQLRequestContextExecutionDidStart<
  TContext extends BaseContext,
> = GraphQLRequestContextParsingDidStart<TContext> &
  WithRequired<
    GraphQLRequestContext<TContext>,
    'document' | 'operation' | 'operationName'
  >;
export type GraphQLRequestContextWillSendResponse<
  TContext extends BaseContext,
> = GraphQLRequestContextDidResolveSource<TContext> & {
  readonly response: GraphQLResponse;
};
export type GraphQLRequestContextDidEncounterSubsequentErrors<
  TContext extends BaseContext,
> = GraphQLRequestContextWillSendResponse<TContext>;
export type GraphQLRequestContextWillSendSubsequentPayload<
  TContext extends BaseContext,
> = GraphQLRequestContextWillSendResponse<TContext>;
