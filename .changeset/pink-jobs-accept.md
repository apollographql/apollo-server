---
'@apollo/server-integration-testsuite': minor
'@apollo/server': minor
---

Updating the ApolloServer constructor to take in a stringifyResult function that will allow a consumer to pass in a function that formats the result of an http query.

Usage:
```ts
const server = new ApolloServer({
  typeDefs,
  resolvers,
  stringifyResult: (value: FormattedExecutionResult) => {
    return JSON.stringify(value, null, 2);
  },
});
```

