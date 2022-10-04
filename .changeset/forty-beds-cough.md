---
'@apollo/server-integration-testsuite': patch
'@apollo/server': patch
---

The cache control plugin sets `cache-control: no-store` for uncacheable responses. Pass `calculateHttpHeaders: 'if-cacheable'` to the cache control plugin to restore AS3 behavior.
