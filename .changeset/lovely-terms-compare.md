---
'@apollo/server-integration-testsuite': patch
'@apollo/server': patch
---

Errors resulting from an attempt to use introspection when it is not enabled now have an additional `validationErrorCode: 'INTROSPECTION_DISABLED'` extension; this value is part of a new enum `ApolloServerValidationErrorCode` exported from `@apollo/server/errors`.
