---
'@apollo/server': patch
---

For ease of upgrade from the recommended configuration of Apollo Server v3.9+, you can now pass `new ApolloServer({ cache: 'bounded' })`, which is equivalent to not providing the `cache` option (as a bounded cache is now the default in AS4).
