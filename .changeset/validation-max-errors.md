---
'@apollo/server': minor
---

Allowing to configure the maximum number of errors when validating a request.
Validation will be aborted if the limit is exceeded.

```
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationMaxErrors: 10,
});
