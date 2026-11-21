---
'@apollo/server': major
---

The cache control plugin now checks on startup that a schema's `@cacheControl` directive definition matches the documented one, and the documented definition declares `scope` as non-null (`scope: CacheControlScope!`), so every `@cacheControl` usage must specify `scope: PUBLIC` or `scope: PRIVATE`. A schema with the previous nullable `scope` fails to start with an error that prints the expected definition. Pass `validateDirectiveDefinition: false` to `ApolloServerPluginCacheControl` to keep a different definition.
