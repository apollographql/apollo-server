---
'@apollo/server': patch
---

Provide a new configuration option for landing page plugins `precomputedNonce` which allows users to provide a nonce and avoid calling into `uuid` functions on startup. This is useful for Cloudflare Workers where random number generation is not available on startup (only during requests). Unless you are using Cloudflare Workers, you can ignore this change.

The example below assumes you've provided a `PRECOMPUTED_NONCE` variable in your `wrangler.toml` file.

Example usage:
```ts
const server = new ApolloServer({
  // ...
  plugins: [
    ApolloServerPluginLandingPageLocalDefault({
      precomputedNonce: PRECOMPUTED_NONCE
    })
  ],
});
```
