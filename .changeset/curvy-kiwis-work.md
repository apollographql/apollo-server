---
'@apollo/server-integration-testsuite': minor
'@apollo/server': minor
---

Plugins processing multiple operations in a batched HTTP request now have a shared `requestContext.request.http` object. Changes to HTTP response headers and HTTP status code made by plugins operating on one operation can be immediately seen by plugins operating on other operations in the same HTTP request.
