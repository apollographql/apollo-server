/**
 * This file exports types related specifically to GraphQL execution, most
 * notably `GraphQLRequest` and `GraphQLResponse`, used most heavily by
 * `executeHTTPGraphQLRequest` and `executeOperation`. The
 * `responseForOperation` plugin hook also returns a `GraphQLResponse`.
 */
import type {
  ExecutionArgs,
  ExecutionResult,
  FormattedExecutionResult,
} from 'graphql';
import type { BaseContext } from './context.js';
import type { HTTPGraphQLHead, HTTPGraphQLRequest } from './http.js';
import type { WithRequired } from '@apollo/utils.withrequired';
import type {
  GraphQLExperimentalFormattedInitialIncrementalExecutionResultAlpha2,
  GraphQLExperimentalFormattedSubsequentIncrementalExecutionResultAlpha2,
} from './incrementalDeliveryPolyfillAlpha2.js';
import type {
  GraphQLExperimentalFormattedInitialIncrementalExecutionResultAlpha9,
  GraphQLExperimentalFormattedSubsequentIncrementalExecutionResultAlpha9,
} from './incrementalDeliveryPolyfillAlpha9.js';
import { type GraphQLExperimentalIncrementalExecutionResultsAlpha2 } from '../incrementalDeliveryPolyfill.js';

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
      initialResult: GraphQLExperimentalFormattedInitialIncrementalExecutionResultAlpha2;
      subsequentResults: AsyncIterable<GraphQLExperimentalFormattedSubsequentIncrementalExecutionResultAlpha2>;
    }
  | {
      kind: 'incremental';
      initialResult: GraphQLExperimentalFormattedInitialIncrementalExecutionResultAlpha9;
      subsequentResults: AsyncIterable<GraphQLExperimentalFormattedSubsequentIncrementalExecutionResultAlpha9>;
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

type PromiseOrValue<T> = Promise<T> | T;

export type LegacyExperimentalExecuteIncrementally<
  TData = Record<string, unknown>,
  TExtensions = Record<string, unknown>,
> = (
  args: ExecutionArgs,
) => PromiseOrValue<
  | ExecutionResult<TData, TExtensions>
  | GraphQLExperimentalIncrementalExecutionResultsAlpha2<TData, TExtensions>
>;
