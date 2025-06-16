---
'@apollo/server': minor
---

Allow configuration of graphql execution options (maxCoercionErrors)

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  executionOptions: {
    maxCoercionErrors: 50,
  },
});
```
