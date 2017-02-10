import { GraphQLOptions } from 'graphql-server-core';
import { ExecutionResult, GraphQLSchema, DocumentNode } from 'graphql';
import { IObservable } from './Observable';

export type RGQLExecuteFunction = (
  schema: GraphQLSchema,
  document: DocumentNode,
  rootValue?: any,
  contextValue?: any,
  variableValues?: {[key: string]: any},
  operationName?: string,
) => IObservable<ExecutionResult>;

export interface RGQLExecutor {
  executeReactive: RGQLExecuteFunction;
}

export interface ReactiveGraphQLOptions extends GraphQLOptions {
  executor: RGQLExecutor;
}
