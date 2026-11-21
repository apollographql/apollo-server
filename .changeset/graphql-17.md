---
'@apollo/server': major
'@apollo/server-integration-testsuite': major
'@apollo/server-plugin-response-cache': major
---

Require GraphQL.js v17. The `graphql` peer dependency is now `^17.1.0`; Apollo Server 6 does not support GraphQL.js v16 (nor does it support pre-release versions of GraphQL.js v17, as Apollo Server 5 did experimentally). Before upgrading, read the [GraphQL.js v16 to v17 upgrade guide](https://www.graphql-js.org/upgrade-guides/v16-v17/) for changes to GraphQL.js itself.

Incremental delivery (`@defer` and `@stream`) now works natively without needing to install an alpha version of GraphQL.js. Clients must request incremental delivery with the `accept: multipart/mixed; incrementalSpec=v0.2` HTTP header.

Other packages that peer-depend on `graphql` must also accept v17; in particular, use `@apollo/gateway` v2.14.5 or later and `@apollo/subgraph` v2.16.0 or later.
