---
"@apollo/server": minor
---

Allow plugin methods to return synchronously.

Previously, `ApolloServerPlugin` methods strictly required a `Promise` return type, forcing the use of `async`/`await` even for fully synchronous hooks. This update introduces the `PromiseOrValue` type to strictly widen the plugin types to allow returning either a `Promise` or a synchronous value, improving developer experience.
