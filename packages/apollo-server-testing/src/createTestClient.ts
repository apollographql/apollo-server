import { ApolloServerBase } from 'apollo-server-core';
import { print, DocumentNode } from 'graphql';

export default (server: ApolloServerBase) => {
  const executeOperation = server.executeOperation.bind(server);
  const test = ({
    query,
    mutation,
    ...rest
  }: {
    query: string | DocumentNode;
    mutation: string | DocumentNode;
  }) => {
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
