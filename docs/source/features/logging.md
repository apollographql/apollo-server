---
title: Logging
description: Ensuring Actions can be Recreated
---

Apollo Server provides two ways to log a server: by input,response, and errors or periodically throughout a request's lifecycle. Treating the GraphQL execution as a black box by logging the inputs and outputs of the system allows developers to diagnose issues quickly without being mired by lower level logs. Once a problem has been found at a high level, the lower level logs enable accurate tracing of how a request was handled.

## High Level Logging

To log the inputs, response, and request, Apollo Server provides three methods: `formatParams`, `formatError`, and `formatResponse`. This example uses `console.log` to record the information, servers can use other more sophisticated tools.

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatParams: params => {
    console.log(params);
    return params;
  },
  formatError: error => {
    console.log(error);
    return error;
  },
  formatResponse: response => {
    console.log(response);
    return response;
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

## Granular Logs

Apollo Server provides a `logFunction` option that receives the start and completion information for each major phase of GraphQL execution: parse, validate, and execute. Additionally, `logFunction` receives the information that initiates the request and response data. This example uses `console.log`:

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  logFunction: information => {
    console.log(information)
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```
