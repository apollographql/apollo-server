import { ApolloServerBase } from 'apollo-server-core';
import { GraphQLResponse } from 'apollo-server-types';
import { print, DocumentNode, subscribe, GraphQLSchema, GraphQLError, ExecutionResult } from 'graphql';

type StringOrAst = string | DocumentNode;

interface Query<T = any> {
  query: StringOrAst;
  variables?: T;
}

interface Mutation<T = any> {
  mutation: StringOrAst;
  variables?: T;
}

interface Subscription<T = any> {
  subscription: StringOrAst;
  variables?: T;
}

export interface ApolloServerTestClient {
  query: <T = any>(query: Query<T>) => Promise<GraphQLResponse>;
  mutate: <T = any>(mutation: Mutation<T>) => Promise<GraphQLResponse>;
  subscription: <T = any>(subscription: Subscription<T>) => Promise<any>;
}

const isAsyncIterable = (iterator: any): iterator is AsyncIterableIterator<any> => {
  return typeof iterator[Symbol.asyncIterator] === 'function';
};

const sleep = (ms: number) => {
  if (ms <= 0) return false;
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export const waitForSubscription = async (
  server: ApolloServerBase,
  subscription: DocumentNode,
  variables?: any
): Promise<any | ReadonlyArray<GraphQLError>> => {
  // @ts-ignore
  const schema: GraphQLSchema = server.schema;
  // @ts-ignore
  const context = server.context();
  const iterator = await subscribe(schema, subscription, {}, context, variables);
  await sleep(5); // Else subscription doesn't apply
  return () =>
    new Promise<any | ReadonlyArray<GraphQLError>>(async (resolve, reject) => {
      if ('errors' in iterator) {
        reject(iterator.errors);
      }
      if (isAsyncIterable(iterator)) {
        for await (const next of iterator) {
          const val: ExecutionResult<any> = next;
          if (val.errors) reject(val.errors);
          const result = val.data;
          if (result) resolve(result);
        }
      }
    });
};

export default (server: ApolloServerBase): ApolloServerTestClient => {
  const executeOperation = server.executeOperation.bind(server);
  const test = ({ query, mutation, subscription, ...args }: Query & Mutation & Subscription) => {
    if (subscription) return waitForSubscription(server, subscription as DocumentNode, args.variables);
    const operation = query || mutation;
    if (!operation) throw new Error('Either `query` or `mutation` or `subscription` must be passed.');
    return executeOperation({
      // Convert ASTs, which are produced by `graphql-tag` but not currently
      // used by `executeOperation`, to a String using `graphql/language/print`.
      query: typeof operation === 'string' ? operation : print(operation),
      ...args,
    });
  };

  return { query: test, mutate: test, subscription: test };
};
