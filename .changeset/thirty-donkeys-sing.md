---
'@apollo/server-integration-testsuite': patch
'@apollo/server-plugin-response-cache': patch
'@apollo/server': patch
---

Support application/graphql-response+json content-type if requested via Accept header, as per graphql-over-http spec.
Include `charset=utf-8` in content-type headers.
