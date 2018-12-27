import { ApolloServerBase } from 'apollo-server-core';
import { print, DocumentNode } from 'graphql';

type StringOrAst = string | DocumentNode;

type Context<T = any> = T;
type ContextFunction<T = any> = (context: Context<T>) => Promise<Context<T>>;

type Options = { context?: Context | ContextFunction };
// A query must not come with a mutation (and vice versa).
type Query = { query: StringOrAst; mutation?: undefined };
type Mutation = { mutation: StringOrAst; query?: undefined };

export default (server: ApolloServerBase, options: Options) => {
  const executeOperation = server.executeOperation.bind(server);
  // Override default context behaviour if context option is provided.
  if (options.context) server.requestOptions.context = options.context;
  const test = ({ query, mutation, ...args }: Query | Mutation) => {
    const operation = query || mutation;

    if ((!query && !mutation) || (query && mutation)) {
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
