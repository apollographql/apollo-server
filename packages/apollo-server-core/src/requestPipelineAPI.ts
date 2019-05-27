// This file is compiled as a separate TypeScript project to avoid
// circular dependency issues from the `apollo-server-plugin-base` package
// depending on the types in it.

import {
  Request,
  Response,
  ValueOrPromise,
  WithRequired,
} from 'apollo-server-env';
import {
  GraphQLSchema,
  ValidationContext,
  ASTVisitor,
  GraphQLFormattedError,
  OperationDefinitionNode,
  DocumentNode,
  GraphQLError,
} from 'graphql';
import { KeyValueCache } from 'apollo-server-caching';

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export interface GraphQLServiceContext {
  schema: GraphQLSchema;
  schemaHash: string;
  engine: {
    serviceID?: string;
    apiKeyHash?: string;
  };
  persistedQueries?: {
    cache: KeyValueCache;
  };
}

export interface GraphQLRequest {
  query?: string;
  operationName?: string;
  variables?: VariableValues;
  extensions?: Record<string, any>;
  http?: Pick<Request, 'url' | 'method' | 'headers'>;
}

export type VariableValues = { [name: string]: any };

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: ReadonlyArray<GraphQLFormattedError>;
  extensions?: Record<string, any>;
  http?: Pick<Response, 'headers'> & Partial<Pick<Mutable<Response>, 'status'>>;
}

export interface GraphQLRequestMetrics {
  persistedQueryHit?: boolean;
  persistedQueryRegister?: boolean;
  responseCacheHit?: boolean;
}

export interface GraphQLRequestContext<TContext = Record<string, any>> {
  readonly request: GraphQLRequest;
  readonly response?: GraphQLResponse;

  readonly context: TContext;
  readonly cache: KeyValueCache;

  // This will be replaced with the `operationID`.
  readonly queryHash?: string;

  readonly document?: DocumentNode;
  readonly source?: string;

  // `operationName` is set based on the operation AST, so it is defined
  // even if no `request.operationName` was passed in.
  // It will be set to `null` for an anonymous operation.
  readonly operationName?: string | null;
  readonly operation?: OperationDefinitionNode;

  /**
   * Unformatted errors which have occurred during the request. Note that these
   * are present earlier in the request pipeline and differ from **formatted**
   * errors which are the result of running the user-configurable `formatError`
   * transformation function over specific errors.
   */
  readonly errors?: ReadonlyArray<GraphQLError>;

  readonly metrics?: GraphQLRequestMetrics;

  debug?: boolean;
}

export type ValidationRule = (context: ValidationContext) => ASTVisitor;

export class InvalidGraphQLRequestError extends Error {}

export type GraphQLExecutor<TContext = Record<string, any>> = (
  requestContext: WithRequired<
    GraphQLRequestContext<TContext>,
    'document' | 'operationName' | 'operation'
  >,
) => ValueOrPromise<GraphQLExecutionResult>;

export type GraphQLExecutionResult = {
  data?: Record<string, any>;
  errors?: ReadonlyArray<GraphQLError>;
  extensions?: Record<string, any>;
};
