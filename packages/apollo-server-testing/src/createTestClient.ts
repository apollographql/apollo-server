import { ApolloServerBase } from 'apollo-server-core';
import { print, DocumentNode } from 'graphql';

type StringOrAst = string | DocumentNode;

type Context<T = any> = T;
type ContextFunction<T = any> = (context: Context<T>) => Promise<Context<T>>;

type Options = { context?: Context | ContextFunction };
// A query must not come with a mutation (and vice versa).
type Query = {
  query: StringOrAst;
  mutation?: undefined;
  context?: Context | ContextFunction;
};
type Mutation = {
  mutation: StringOrAst;
  query?: undefined;
  context?: Context | ContextFunction;
};

export default (
  server: ApolloServerBase,
  options: Options = { context: server.requestOptions.context },
) => {
  const executeOperation = server.executeOperation.bind(server);
  const test = ({
    query,
    mutation,
    context = options.context,
    ...args
  }: Query | Mutation) => {
    const operation = query || mutation;
    // Override mutation / query specific context.
    if (context) server.requestOptions.context = context;
    // Reapply default context or context provided in the options.
    else if (options.context) server.requestOptions.context = options.context;
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
