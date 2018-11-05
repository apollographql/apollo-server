import { ApolloServerBase } from 'apollo-server-core';
import { print } from 'graphql';

export default (server: ApolloServerBase) => {
  const executeOperation = server.executeOperation.bind(server);
  const test = ({ query, mutation, ...rest }) => {
    const operation = query || mutation;
    return executeOperation({
      // Convert ASTs, which are produced by `graphql-tag` but not currently
      // used by `executeOperation`, to a String using `graphql/language/print`.
      query: typeof operation === 'string' ? operation : print(operation),
      ...rest,
    });
  };

  return { query: test, mutate: test };
};
