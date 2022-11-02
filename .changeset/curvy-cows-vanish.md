---
'@apollo/server-integration-testsuite': minor
'@apollo/server': minor
---

The `cache-control` HTTP response header set by the cache control plugin now properly reflects the cache policy of all operations in a batched HTTP request. (If you write the `cache-control` response header via a different mechanism to a format that the plugin would not produce, the plugin no longer writes the header.) For more information, see [advisory GHSA-8r69-3cvp-wxc3](https://github.com/apollographql/apollo-server/security/advisories/GHSA-8r69-3cvp-wxc3).
