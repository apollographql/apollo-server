---
'@apollo/server-gateway-interface': minor
---

Allow `@apollo/server-gateway-interface` to work with older major versions of `@apollo/utils.fetcher`, `@apollo/utils.logger` and `@apollo/utils.keyvaluecache`. This is a technical change that will allow this version of `@apollo/server-gateway-interface` to be used with `@apollo/gateway` 2.x under every Node version it supports, even EOL Node versions like Node 18. Even though Node 18 is EOL, putting out a new version of `@apollo/gateway` which requires newer Node would require a major version bump for `@apollo/gateway` which we currently do not want to do.
