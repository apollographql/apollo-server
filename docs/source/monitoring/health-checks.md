---
title: Health checks
description: Determining the health status of the Apollo Server
---

Health checks are often used by load balancers to determine if a server is available and ready to start serving traffic. By default, Apollo Server provides a health check endpoint at `/.well-known/apollo/server-health` which returns a 200 status code if the server has started.

This basic health check may not be comprehensive enough for some applications and depending on individual circumstances, it may be beneficial to provide a more thorough implementation by defining an `onHealthCheck` function to the `ApolloServer` constructor options. If defined, this `onHealthCheck` async function should return if the server is deemed _ready_ or `throw` if there is an error. Returning (resolving the `Promise`) will result in an HTTP status code of 200, which is generally desired by most health-check tooling (e.g. Kubernetes, AWS, etc.), while `throw`ing (rejecting the `Promise`) will result in an HTTP status code of 503.

```js{10-17}
import { ApolloServer, gql } from 'apollo-server';

// Undefined for brevity.
const typeDefs = gql``;
const resolvers = {};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async onHealthCheck() {
    // Replace the `true` in this conditional with more specific checks!
    if (true) {
      return;
    } else {
      throw new Error('...');
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(
    `Try your health check at: ${url}.well-known/apollo/server-health`,
  );
});
```
