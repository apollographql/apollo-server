import { ApolloServerBase } from 'apollo-server-core';
import { print, DocumentNode } from 'graphql';
import { GraphQLResponse } from 'graphql-extensions';

type StringOrAst = string | DocumentNode;
type Variables = { [name: string]: any };

type QueryOptions = {
  query: StringOrAst;
  variables?: Variables;
};

type MutationOptions = {
  mutation: StringOrAst;
  variables?: Variables;
};

type QueryXorMutationOptions = (
  | { query: StringOrAst; mutation?: never }
  | { mutation: StringOrAst; query?: never }) & { variables?: Variables };

export default (server: ApolloServerBase) => {
  function test(options: QueryOptions): Promise<GraphQLResponse>;
  function test(options: MutationOptions): Promise<GraphQLResponse>;
  function test({
    query,
    mutation,
    variables,
  }: QueryXorMutationOptions): Promise<GraphQLResponse> {
    const executeOperation = server.executeOperation.bind(server);
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
      variables,
    });
  }

  return { query: test, mutate: test };
};
