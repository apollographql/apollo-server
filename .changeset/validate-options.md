---
'@apollo/server': minor
---

Expose `graphql` validation options.

```
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validateOptions: { maxErrors: 10 },
});
