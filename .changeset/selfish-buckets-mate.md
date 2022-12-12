---
'@apollo/server': minor
---

If the cache you provide to the `persistedQueries.cache` option is created with `PrefixingKeyValueCache.cacheDangerouslyDoesNotNeedPrefixesForIsolation` (new in `@apollo/utils.keyvaluecache@2.1.0`), the `apq:` prefix will not be added to cache keys. Providing such a cache to `new ApolloServer()` throws an error.
