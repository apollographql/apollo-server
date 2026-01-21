---
'@apollo/server': minor
---

Expose `graphql` validation options.

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationOptions: {
    maxErrors: 10
  },
});
```
