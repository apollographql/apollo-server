import { ApolloServerBase } from 'apollo-server-core';
import { print, DocumentNode } from 'graphql';

type StringOrAst = string | DocumentNode;
interface QueryOrMutation {
  query?: StringOrAst;
  mutation?: StringOrAst;
}

export default (server: ApolloServerBase) => {
  const executeOperation = server.executeOperation.bind(server);
  const test = ({ query, mutation, ...args }: QueryOrMutation) => {
    const operation = query || mutation;

    if ((!query && !mutation) || (query && mutation)) {
      throw new Error('Either `query` or `mutation` must be passed');
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
