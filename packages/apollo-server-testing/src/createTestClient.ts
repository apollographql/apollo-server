import { ApolloServerBase, gql } from 'apollo-server-core';
import { print } from 'graphql';

const createTestClient = (server: ApolloServerBase, ctxFn: (...args: any[]) => any) => {
  // if a context fn is required, overwrite the old one
  // allows easy mocking of the context
  if (ctxFn) server.context = ctxFn;

  const executeOperation = server.executeOperation.bind(server);
  return {
    query: ({ query, ...rest }) =>
      executeOperation({
        // Convert ASTs, which are produced by `graphql-tag` to
        // a string using `graphql/language/print`.
        query: typeof query === 'string' ? query : print(query),
        ...rest,
      }),
    mutate: ({ mutation, ...rest }) =>
      executeOperation({
        // print the query document if it isn't a string
        query: typeof mutation === 'string' ? mutation : print(mutation),
        ...rest,
      }),
  };
};

module.exports = createTestClient;
