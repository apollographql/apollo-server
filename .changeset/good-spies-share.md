---
'@apollo/server': minor
---

# Added ability to use a custom executor such as graphql-jit

Apollo Server uses graphql-js behind the scenes when executing graphql queries.
If you would like to use a custom executor, such as
[graphql-jit](https://github.com/zalando-incubator/graphql-jit/tree/main),
you can swap in a `customExecutor`. This can result in  This can result in improved performance.

Note that this cannot be used when using the `gateway` option.

```ts
import { compileQuery, isCompiledQuery } from 'graphql-jit';
import { lru } from 'tiny-lru';

const executor = (cacheSize = 2014, compilerOpts = {}) => {
  const cache = lru(cacheSize);
  return async ({ contextValue, document, operationName, request, queryHash, schema }) => {
    const prefix = operationName || 'NotParametrized';
    const cacheKey = `${prefix}-${queryHash}`;
    let compiledQuery = cache.get(cacheKey);
    if (!compiledQuery) {
      const compilationResult = compileQuery(schema, document, operationName || undefined, compilerOpts);
      if (isCompiledQuery(compilationResult)) {
        compiledQuery = compilationResult;
        cache.set(cacheKey, compiledQuery);
      } else {
        // ...is ExecutionResult
        return compilationResult;
      }
    }

    return compiledQuery.query(undefined, contextValue, request.variables || {});
  };
};

const schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

const server = new ApolloServer<BaseContext>({
  schema,
  customExecutor: executor(),
});
```
