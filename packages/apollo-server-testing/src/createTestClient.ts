import { ApolloServerBase } from 'apollo-server-core';
import { GraphQLResponse } from 'apollo-server-types';
import { print, DocumentNode } from 'graphql';

type StringOrAst = string | DocumentNode;

// A query must not come with a mutation (and vice versa).
type Query = {
  query: StringOrAst;
  mutation?: undefined;
  variables?: {
    [name: string]: any;
  };
  operationName?: string;
};
type Mutation = {
  mutation: StringOrAst;
  query?: undefined;
  variables?: {
    [name: string]: any;
  };
  operationName?: string;
};

export interface ApolloServerTestClient {
  query: (query: Query) => Promise<GraphQLResponse>;
  mutate: (mutation: Mutation) => Promise<GraphQLResponse>;
}

export default (server: ApolloServerBase): ApolloServerTestClient => {
  const executeOperation = server.executeOperation.bind(server);
  const test = ({ query, mutation, ...args }: Query | Mutation) => {
    const operation = query || mutation;

    if (!operation || (query && mutation)) {
      throw new Error(
        'Either `query` or `mutation` must be passed, but not both.',
      );
    }

    return executeOperation({
      // Convert ASTs, which are produced by `graphql-tag` but not currently
      // used by `executeOperation`, to a String using `graphql/language/print`.
      query: typeof operation === 'string' ? operation : print(operation),
      ...args,
    });
  };

  return { query: test, mutate: test };
};
