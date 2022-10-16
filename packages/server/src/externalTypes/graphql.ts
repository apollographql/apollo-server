/**
 * This file exports types related specifically to GraphQL execution, most
 * notably `GraphQLRequest` and `GraphQLResponse`, used most heavily by
 * `executeHTTPGraphQLRequest` and `executeOperation`. The
 * `responseForOperation` plugin hook also returns a `GraphQLResponse`.
 */
import type { FormattedExecutionResult } from 'graphql';
import type { BaseContext } from './context.js';
import type { HTTPGraphQLHead, HTTPGraphQLRequest } from './http.js';
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
export interface ExecuteOperationOptions<TContext extends BaseContext> {
  contextValue?: TContext;
}
