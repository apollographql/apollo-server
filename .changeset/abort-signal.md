---
'@apollo/server': minor
'@apollo/server-integration-testsuite': minor
---

Add an optional `signal: AbortSignal` to `HTTPGraphQLRequest`. Apollo Server forwards it to GraphQL.js execution, so resolvers can observe it via `info.getAbortSignal()` and execution stops early when it fires; such requests end with a `REQUEST_ABORTED` error (a new `ApolloServerErrorCode`). `startStandaloneServer` aborts the signal when the client disconnects before the response is finished. The integration testsuite gains a `supportsRequestAbortSignal` option that enables a test for integrations that wire up the signal.
