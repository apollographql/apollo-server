# Response Cache plugin

This Apollo Server response cache plugin implements a full GraphQL query response cache.

- Add the plugin to your ApolloServer's plugins list
- Set `@cacheControl` hints on your schema or call `info.cacheControl.setCacheHint` in your resolvers
- If the entire GraphQL response is covered by cache hints with non-zero maxAge,
  the whole response will be cached.

This cache is a full query cache: cached responses are only used for identical requests.


See [the docs](https://www.apollographql.com/docs/apollo-server/performance/caching/) for details.
