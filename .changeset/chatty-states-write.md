---
'@apollo/server': patch
---

Fix an issue where some bundlers would fail to build because of the dynamic import for the optional peer dependency on `@yaacovcr/transform` introduced in `@apollo/server` 5.1.0. To provide support for the legacy incremental format, you must now provide the `legacyExperimentalExecuteIncrementally` option to the `ApolloServer` constructor.

```ts
import { legacyExecuteIncrementally } from '@yaacovcr/transform';

const server = new ApolloServer({
  // ...
  legacyExperimentalExecuteIncrementally: legacyExecuteIncrementally
})
```

If the `legacyExperimentalExecuteIncrementally` option is not provided and the client sends an `Accept` header with a value of `multipart/mixed; deferSpec=20220824`, an error is returned by the server.
