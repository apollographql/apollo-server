---
'@apollo/server-integration-testsuite': major
'@apollo/server-plugin-response-cache': major
'@apollo/server': major
---

Support `graphql` v17 instead of v16. The `graphql` peer dependency is now `^17.0.0`.

Incremental delivery (`@defer` and `@stream`) now works with released versions of `graphql` v17 instead of only `17.0.0-alpha.9`. The legacy incremental format is produced by `legacyExecuteIncrementally` from `graphql` unless the `legacyExperimentalExecuteIncrementally` option is set, so `@yaacovcr/transform` is no longer needed.
