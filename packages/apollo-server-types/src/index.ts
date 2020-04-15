import { Request, Response } from 'apollo-server-env';
import {
  GraphQLSchema,
  ValidationContext,
  ASTVisitor,
  GraphQLFormattedError,
  OperationDefinitionNode,
  DocumentNode,
  GraphQLError,
} from 'graphql';

// This seems like it could live in this package too.
import { KeyValueCache } from 'apollo-server-caching';
import { Trace } from 'apollo-engine-reporting-protobuf';

export type ValueOrPromise<T> = T | Promise<T>;
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export interface GraphQLServiceContext {
  logger: Logger;
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
  data?: Record<string, any> | null;
  errors?: ReadonlyArray<GraphQLFormattedError>;
  extensions?: Record<string, any>;
  http?: Pick<Response, 'headers'> & Partial<Pick<Mutable<Response>, 'status'>>;
}

export interface GraphQLRequestMetrics {
  captureTraces?: boolean;
  persistedQueryHit?: boolean;
  persistedQueryRegister?: boolean;
  responseCacheHit?: boolean;
  forbiddenOperation?: boolean;
  registeredOperation?: boolean;
  startHrTime?: [number, number];
  queryPlanTrace?: Trace.QueryPlanNode;
}

export interface GraphQLRequestContext<TContext = Record<string, any>> {
  readonly request: GraphQLRequest;
  readonly response?: GraphQLResponse;

  logger: Logger;

  readonly context: TContext;
  readonly cache: KeyValueCache;

  // This will be replaced with the `operationID`.
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
   * transformation function over specific errors.
   */
  readonly errors?: ReadonlyArray<GraphQLError>;

  readonly metrics?: GraphQLRequestMetrics;

  debug?: boolean;
}

export type ValidationRule = (context: ValidationContext) => ASTVisitor;

export class InvalidGraphQLRequestError extends GraphQLError {}

export type GraphQLExecutor<TContext = Record<string, any>> = (
  requestContext: GraphQLRequestContextExecutionDidStart<TContext>,
) => ValueOrPromise<GraphQLExecutionResult>;

export type GraphQLExecutionResult = {
  data?: Record<string, any> | null;
  errors?: ReadonlyArray<GraphQLError>;
  extensions?: Record<string, any>;
};

export type Logger = {
  // Ordered from least-severe to most-severe.
  debug(message?: any): void;
  info(message?: any): void;
  warn(message?: any): void;
  error(message?: any): void;
}

export type GraphQLRequestContextParsingDidStart<TContext> =
  WithRequired<GraphQLRequestContext<TContext>,
    | 'metrics'
    | 'source'
    | 'queryHash'
  >;
export type GraphQLRequestContextValidationDidStart<TContext> =
  GraphQLRequestContextParsingDidStart<TContext> &
  WithRequired<GraphQLRequestContext<TContext>,
    | 'document'
  >;
export type GraphQLRequestContextDidResolveOperation<TContext> =
  GraphQLRequestContextValidationDidStart<TContext> &
  WithRequired<GraphQLRequestContext<TContext>,
    | 'operation'
    | 'operationName'
  >;
export type GraphQLRequestContextDidEncounterErrors<TContext> =
  WithRequired<GraphQLRequestContext<TContext>,
    | 'metrics'
    | 'errors'
  >;
export type GraphQLRequestContextResponseForOperation<TContext> =
  WithRequired<GraphQLRequestContext<TContext>,
    | 'metrics'
    | 'source'
    | 'document'
    | 'operation'
    | 'operationName'
  >;
export type GraphQLRequestContextExecutionDidStart<TContext> =
  GraphQLRequestContextParsingDidStart<TContext> &
  WithRequired<GraphQLRequestContext<TContext>,
    | 'document'
    | 'operation'
    | 'operationName'
  >;
export type GraphQLRequestContextWillSendResponse<TContext> =
  WithRequired<GraphQLRequestContext<TContext>,
    | 'metrics'
    | 'response'
  >;
