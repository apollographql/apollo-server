---
"@apollo/server-integration-testsuite": patch
"@apollo/server": patch
---

Errors thrown in resolvers and context functions can use `extensions.http` to affect the response status code and headers. The default behavior when a context function throws is now to always use status code 500 rather than comparing `extensions.code` to `INTERNAL_SERVER_ERROR`.
