// This file is compiled as a separate TypeScript project to avoid
// circular dependency issues from the `apollo-server-plugin-base` package
// depending on the types in it.

import { Request, Headers } from 'apollo-server-env';
import {
  GraphQLSchema,
  ValidationContext,
  ASTVisitor,
  GraphQLError,
  OperationDefinitionNode,
} from 'graphql';
import { KeyValueCache } from 'apollo-server-caching';

export interface GraphQLServiceContext {
  schema: GraphQLSchema;
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
  // FIXME: This should be optional to support other transports,
  // but that currently breaks Engine reporting.
  http: Pick<Request, 'url' | 'method' | 'headers'>;
}

export interface GraphQLResponse {
  data?: object;
  errors?: GraphQLError[];
  extensions?: Record<string, any>;
  http?: {
    headers: Headers;
  };
}

export interface GraphQLRequestContext<TContext> {
  request: GraphQLRequest;
  response?: GraphQLResponse;

  context: TContext;
  cache: KeyValueCache;

  operation?: OperationDefinitionNode;

  debug?: boolean;
}

export type ValidationRule = (context: ValidationContext) => ASTVisitor;

export class InvalidGraphQLRequestError extends Error {}
