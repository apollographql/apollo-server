import type { GraphQLError } from 'graphql';
import type { WithRequired } from '../types';
import type { GraphQLRequestContext } from './graphql';

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
