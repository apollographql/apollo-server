---
'@apollo/server': major
'@apollo/server-integration-testsuite': major
---

Remove support for the legacy incremental delivery format (`accept: multipart/mixed; deferSpec=20220824`), along with the `legacyExperimentalExecuteIncrementally` constructor option. Operations that use `@defer` or `@stream` from clients that only accept that format now receive a `406 Not Acceptable` error; clients should send `accept: multipart/mixed; incrementalSpec=v0.2` instead.

The `GraphQLExperimental*Alpha2` and `GraphQLExperimental*Alpha9` types are no longer exported from `@apollo/server`. `GraphQLResponseBody` and the `willSendSubsequentPayload` plugin hook now use the `FormattedInitialIncrementalExecutionResult` and `FormattedSubsequentIncrementalExecutionResult` types exported from `graphql` (which have the same shape as the removed `Alpha9` types).
