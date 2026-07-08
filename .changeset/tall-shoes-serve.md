---
'@apollo/server': minor
---

Allow formatError to be an `async` function.

```
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: async () => {
    return Promise.resolve({
      code: 'MY_ERROR',
      message: 'This is an error that was updated by formatError',
    });
  },
});
```
