---
"@apollo/server": patch
---

`parseOptions` is now only used for parsing operations, not for schemas too. Its TS type now only includes options recognized by `graphql-js` itself.
