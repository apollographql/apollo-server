---
title: Health Checks
description: Determining the health status of the Apollo Server 
---

The default Apollo Server provides a health check endpoint at `/.well-known/apollo/server-health` that returns a 200 status code by default. If `onHealthCheck` is defined, the promise returned from the callback determines the status code. A successful resolution causes a 200 and rejection causes a 503. Health checks are often used by load balancers to determine if a server is available.

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql``;
const resolvers = {};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  //optional parameter
  onHealthCheck: () =>
    new Promise((resolve, reject) => {
      //database check or other asynchronous action
    }),
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(
    `Try your health check at: ${url}.well-known/apollo/server-health`,
  );
});
```
