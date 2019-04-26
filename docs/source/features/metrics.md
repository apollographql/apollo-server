---
title: Monitoring and metrics
description: How to monitor Apollo Server's performance
---

Understanding the behavior of GraphQL execution inside of Apollo Server is critical to developing and running a production GraphQL layer. Apollo Server enables GraphQL monitoring in Apollo Engine and provides more primitive native mechanisms to log each phase of a GraphQL request.

## Apollo Engine

Apollo Engine provides an integrated hub for all GraphQL performance data that is free for one million queries per month. With an API key from the [Engine UI](https://engine.apollographql.com/), Apollo Server reports performance and error data out-of-band. Apollo Engine then aggregates and displays information for [queries](https://www.apollographql.com/docs/engine/features/query-tracking.html), [requests](https://www.apollographql.com/docs/engine/performance.html), the [schema](https://www.apollographql.com/docs/engine/features/performance.html), and [errors](https://www.apollographql.com/docs/engine/features/error-tracking.html). By leveraging this data, Apollo Engine offers [alerts](https://www.apollographql.com/docs/engine/features/alerts.html) via [Slack](https://www.apollographql.com/docs/engine/integrations/slack.html) and [Datadog](https://www.apollographql.com/docs/engine/integrations/datadog.html) integrations.

To set up Apollo Server with Engine, [click here](https://engine.apollographql.com/) to get an Engine API key. This API key can be passed directly to the Apollo Server constructor.

```js line=6-8
const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: "YOUR API KEY HERE"
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

The API key can also be set with the `ENGINE_API_KEY` environment variable. Setting an environment variable can be done in commandline as seen below or with the [dotenv npm package](https://www.npmjs.com/package/dotenv).

```bash
# Replace YOUR_API_KEY with the API key provided within Apollo Engine.
ENGINE_API_KEY=YOUR_API_KEY node start-server.js
```

### Client awareness

Apollo Engine accepts metrics annotated with client information. The Engine UI
is then able to filter metrics and usage patterns by these names and versions. To provide metrics to the Engine, pass a `generateClientInfo` function into the `ApolloServer` constructor, like so:

```js line=8-23
const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: "YOUR API KEY HERE",
    generateClientInfo: ({
      request
    }) => {
      const headers = request.http && request.http.headers;
      if(headers) {
        return {
          clientName: headers['apollo-client-name'],
          clientVersion: headers['apollo-client-version'],
        };
      } else {
        return {
          clientName: "Unknown Client",
          clientVersion: "Unversioned",
        };
      }
    },
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

> Note: the default implementation looks at `clientInfo` field in the
> `extensions` of the GraphQL request

## Logging

Apollo Server provides two ways to log a server: per input, response, and errors or periodically throughout a request's lifecycle. Treating the GraphQL execution as a black box by logging the inputs and outputs of the system allows developers to diagnose issues quickly without being mired by lower level logs. Once a problem has been found at a high level, the lower level logs enable accurate tracing of how a request was handled.

### High-level logging

Apollo Server allows `formatError` and `formatResponse` configuration options which can be defined as callback-functions which receive `error` or `response` arguments respectively.

For the sake of simplicity, these examples use `console.log` to output error and debugging information though a more complete example might utilize existing logging or error-reporting facilities.

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
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

### Granular logs

For more advanced cases, Apollo Server provides an experimental api that accepts an array of `graphql-extensions` to the `extensions` field. These extensions receive a variety of lifecycle calls for each phase of a GraphQL request and can keep state, such as the request headers.

```js
const { ApolloServer }  = require('apollo-server');
const LoggingExtension = require('./logging');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  extensions: [() => new LoggingExtension()]
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

For example the `logFunction` from Apollo Server 1 can be implemented as an [extension](https://github.com/apollographql/apollo-server/blob/8914b135df9840051fe81cc9224b444cfc5b61ab/packages/apollo-server-core/src/logging.ts) and could be modified to add additional state or functionality.
