---
title: Monitoring and metrics
description: How to monitor Apollo Server's performance
---

Understanding the behavior of GraphQL execution inside of Apollo Server is critical to developing and running a production GraphQL layer. Apollo Server enables GraphQL monitoring in Apollo Engine and provides more primitive native mechanisms to log each phase of a GraphQL request.

## Apollo Engine

Apollo Engine provides an integrated hub for all GraphQL performance data that is free for one million queries per month. With an API key from the [Engine UI](https://engine.apollographql.com/), Apollo Server reports performance and error data out-of-band. Apollo Engine then aggregates and displays information for [queries](https://www.apollographql.com/docs/engine/query-tracking.html), [requests](https://www.apollographql.com/docs/engine/performance.html), the [schema](https://www.apollographql.com/docs/engine/schema-analytics.html), and [errors](https://www.apollographql.com/docs/engine/error-tracking.html). In addition to aggregating data, Apollo Server provides [proactive alerts](https://www.apollographql.com/docs/engine/alerts.html), [daily slack reports](https://www.apollographql.com/docs/engine/reports.html), and [Datadog integration](https://www.apollographql.com/docs/engine/datadog.html).

To set up Apollo Server with Engine, [click here](https://engine.apollographql.com/) to get an Engine API key. This API key can be passed directly to the Apollo Server constructor.

```js line=6-8
const { ApolloServer } = require("apollo-server");

const server = new ApolloSever({
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
#Replace YOUR_API_KEY with the api key for you service in the Engine UI
ENGINE_API_KEY=YOUR_API_KEY node start-server.js
```

## Logging

Apollo Server provides two ways to log a server: per input, response, and errors or periodically throughout a request's lifecycle. Treating the GraphQL execution as a black box by logging the inputs and outputs of the system allows developers to diagnose issues quickly without being mired by lower level logs. Once a problem has been found at a high level, the lower level logs enable accurate tracing of how a request was handled.

### High Level Logging

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

### Granular Logs

Additionally for more advanced cases, Apollo Server accepts an array of `graphql-extensions` to the `extensions` field. These extensions receive a variety of lifecycle calls for each phase of a GraphQL request and can keep state, such as the request headers.

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

For example the `logFunction` from Apollo Server 1 can be implemented as an [extension](https://github.com/apollographql/apollo-server/blob/8914b135df9840051fe81cc9224b444cfc5b61ab/packages/apollo-server-core/src/logging.ts) and could be modified to add additional state or functionality. The example uses a beta of `graphql-extensions`, which can be added to a project with `npm install graphql-extensions@beta`.

