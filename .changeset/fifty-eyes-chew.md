---
'@apollo/server-plugin-response-cache': minor
---

If the cache you provide to the `cache` option is created with `PrefixingKeyValueCache.cacheDangerouslyDoesNotNeedPrefixesForIsolation` (new in `@apollo/utils.keyvaluecache@2.1.0`), the `fqc:` prefix will not be added to cache keys.
