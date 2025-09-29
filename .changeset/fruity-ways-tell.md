---
'@apollo/server': minor
---

Add support for the modern modern incremental delivery protocol (`@defer` and `@stream`) that ships with `graphql@17.0.0-alpha.9`. To use the modern protocol, clients must send the `Accept` header with a value of `multipart/mixed; incrementalDeliverySpec=3283f8a`.

Support for the legacy incremental delivery protocol is still possible by installing the [`@yaacovcr/transform`](https://github.com/yaacovCR/transform) package. Apollo Server will attempt to load this module when the client specifies an `Accept` header with a value of `multipart/mixed; deferSpec=20220824`. If this package is not installed, an error is returned by the server.
