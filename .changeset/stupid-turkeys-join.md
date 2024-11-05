---
'@apollo/cache-control-types': minor
'@apollo/server': minor
---

# Add `staticOnly` option for cache control

The cache control plugin, by default, instruments the schema to allow dynamic cache hints, which can significantly impact performance, especially for larger response sizes.

We recommend that you opt out of this functionality if you do not need it by configuring the plugin to use `staticOnly` mode which will skip instrumenting the schema for dynamic cache control hints.

```ts
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';

const server = new ApolloServer<BaseContext>({
  // ...other options...
  plugins: [
    ApolloServerPluginCacheControl({ staticOnly: true }),
  ],
});
```
