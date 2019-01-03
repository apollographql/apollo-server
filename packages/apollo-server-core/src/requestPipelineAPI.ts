// This file is compiled as a separate TypeScript project to avoid
// circular dependency issues from the `apollo-server-plugin-base` package
// depending on the types in it.

import { Request, Response } from 'apollo-server-env';
import {
  GraphQLSchema,
  ValidationContext,
  ASTVisitor,
  GraphQLError,
  OperationDefinitionNode,
  DocumentNode,
} from 'graphql';
import { KeyValueCache } from 'apollo-server-caching';


// TODO: Get FieldValue and ExecutionPatchResult from execute
// Copying these types over from ./execute for now, because this compiles as a separate TypeScript
// project it can't import these types from a relative file path or through /dist? There is
// probably some config magic that needs to be done here to get this to work...

// Valid types a GraphQL field can take
type FieldValue =
| Record<string, {}>
| Array<any>
| string
| number
| boolean
| null;

export interface ExecutionPatchResult {
  data?: FieldValue;
  errors?: ReadonlyArray<GraphQLError>;
  path: ReadonlyArray<string | number>;
}

export interface GraphQLServiceContext {
  schema: GraphQLSchema;
  schemaHash: string;
  engine: {
    serviceID?: string;
  };
  persistedQueries?: {
    cache: KeyValueCache;
  };
}

export interface GraphQLRequest {
  query?: string;
  operationName?: string;
  variables?: { [name: string]: any };
  extensions?: Record<string, any>;
  http?: Pick<Request, 'url' | 'method' | 'headers'>;
}

export interface GraphQLResponse {
  data?: Record<string, any>;
  errors?: GraphQLError[];
  extensions?: Record<string, any>;
  http?: Pick<Response, 'headers'>;
}

export interface DeferredGraphQLResponse {
  initialResponse: GraphQLResponse;
  deferredPatches: AsyncIterable<ExecutionPatchResult>;
  requestDidEnd: () => void;
}

export interface GraphQLRequestContext<TContext = Record<string, any>> {
  readonly request: GraphQLRequest;
  readonly response?: GraphQLResponse | DeferredGraphQLResponse;

  readonly context: TContext;
  readonly cache: KeyValueCache;

  // This will be replaced with the `operationID`.
  readonly queryHash?: string;

  readonly document?: DocumentNode;

  // `operationName` is set based on the operation AST, so it is defined
  // even if no `request.operationName` was passed in.
  // It will be set to `null` for an anonymous operation.
  readonly operationName?: string | null;
  readonly operation?: OperationDefinitionNode;

  debug?: boolean;
}

export type ValidationRule = (context: ValidationContext) => ASTVisitor;

export class InvalidGraphQLRequestError extends Error {}
