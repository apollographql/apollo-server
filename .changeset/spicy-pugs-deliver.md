---
"@apollo/server": patch
---

Update internal use of `@graphql-tools/schema` from v8 to v9. This should be a no-op; we have already removed the feature that would have been affected by the API change in this upgrade (passing `parseOptions` to `makeExecutableSchema`).
