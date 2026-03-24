---
'@apollo/server-integration-testsuite': minor
'@apollo/server': minor
---

⚠️ SECURITY `@apollo/server/standalone`:

Apollo Server now rejects GraphQL `GET` requests which contain a `Content-Type` header other than `application/json` (with optional parameters such as `; charset=utf-8`). Any other value is now rejected with a 415 status code.

(GraphQL `GET` requests without a `Content-Type` header are still allowed, though they do still need to contain a non-empty `X-Apollo-Operation-Name` or `Apollo-Require-Preflight` header to be processed if the default CSRF prevention feature is enabled.)

This improvement makes Apollo Server's CSRF more resistant to browsers which implement CORS in non-spec-compliant ways. Apollo is aware of one browser which as of March 2026 has a bug which allows an attacker to circumvent Apollo Server's CSRF prevention feature to carry out read-only XS-Search-style CSRF attacks. The browser vendor is in the process of patching this vulnerability; upgrading Apollo Server to v5.5.0 mitigates this vulnerability.

**If your server uses cookies (or HTTP Basic Auth) for authentication, Apollo encourages you to upgrade to v5.5.0.**

This is technically a backwards-incompatible change. Apollo is not aware of any GraphQL clients which provide non-empty `Content-Type` headers with `GET` requests with types other than `application/json`. If your use case requires such requests, please [file an issue](https://github.com/apollographql/apollo-server/issues) and we may add more configurability in a follow-up release.

See [advisory GHSA-9q82-xgwf-vj6h](https://github.com/apollographql/apollo-server/security/advisories/GHSA-9q82-xgwf-vj6h) for more details.
