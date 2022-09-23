import type { WithRequired } from '@apollo/utils.withrequired';
import type { BaseContext } from './context.js';
import type { GraphQLRequestContext, GraphQLResponse } from './graphql.js';

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
