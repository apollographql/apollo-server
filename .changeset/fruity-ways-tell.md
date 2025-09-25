---
'@apollo/server': minor
---

Add support for the `graphql@17.0.0-alpha.9` `@defer` and `@stream` incremental delivery protocol. When `graphql@17.0.0-alpha.9` is installed, clients must send the `Accept` header with a value of `multipart/mixed; incrementalDeliverySpec=3283f8a` to specify the new format. If the `Accept` header is not compatible with the installed version of `graphql`, an error is returned to the client.
