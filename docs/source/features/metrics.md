---
title: Monitoring and metrics
description: How to monitor Apollo Server's performance
---

Understanding the behavior of GraphQL execution inside of Apollo Server is critical to developing and running a production GraphQL layer. Apollo Server enables GraphQL monitoring in Apollo Engine and provides more primitive native mechanisms to log each phase of a GraphQL request.

> Using Federation? Check out the documentation for [federated tracing](/federation/metrics/)

## Apollo Engine

Apollo Engine provides an integrated hub for all GraphQL performance data that is free for one million queries per month. With an API key from the [Engine UI](https://engine.apollographql.com/), Apollo Server reports performance and error data out-of-band. Apollo Engine then aggregates and displays information for [queries](https://www.apollographql.com/docs/engine/features/query-tracking.html), [requests](https://www.apollographql.com/docs/engine/performance.html), the [schema](https://www.apollographql.com/docs/engine/features/performance.html), and [errors](https://www.apollographql.com/docs/engine/features/error-tracking.html). By leveraging this data, Apollo Engine offers [alerts](https://www.apollographql.com/docs/engine/features/alerts.html) via [Slack](https://www.apollographql.com/docs/engine/integrations/slack.html) and [Datadog](https://www.apollographql.com/docs/engine/integrations/datadog.html) integrations.

To set up Apollo Server with Engine, [click here](https://engine.apollographql.com/) to get an Engine API key.

The API key can be specified in two ways:

1. Within the `ApolloServer` constructor options.
2. Using environment variables.

### Configuring within the `ApolloServer` constructor options

```js{6-15}
const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    // The Apollo Engine API key.
    //
    // This may also be set via the `ENGINE_API_KEY` environment variable.
    apiKey: "YOUR API KEY HERE",

    // A tag for this specific environment (e.g. `development` or `production`).
    //
    // This may also be set via the `ENGINE_SCHEMA_TAG` environment variable.
    // For more information on schema tags/variants, see the documentation in
    // our Platform documentation on associating metrics with variants:
    // https://www.apollographql.com/docs/platform/schema-registry/#associating-metrics-with-a-variant
    schemaTag: 'development',
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

### Configuration via environment variables

The API key can also be set with the `ENGINE_API_KEY` environment variable and the schema tag can be set similarly with `ENGINE_SCHEMA_TAG`.

Setting an environment variable can be done on the command line as seen below or using the [`dotenv` npm package](https://www.npmjs.com/package/dotenv) (or similar).

```bash
# Replace the example values below with values specific to your use case.
ENGINE_API_KEY=YOUR_API_KEY ENGINE_SCHEMA_TAG=development node start-server.js
```

### Client awareness

> For additional information on client awareness, please see the section in our Apollo Platform documentation on [client awareness](https://www.apollographql.com/docs/platform/client-awareness).

Setting up client awareness enables client-based filtering of metrics and usage patterns within Apollo Engine.  A client's identity has three configurable dimensions:

* Name (e.g. "Android App")
* Version (e.g. `1.0.1`)
* Reference ID (e.g. A Git reference or other supporting identifier)

There are two ways to configure client awareness:

1. By setting specific headers on the client which are automatically picked up by Apollo Server.
2. Defining a custom `generateClientInfo` implementation within Apollo Server, allowing the use of different headers or other information from the request context.

#### Default client identification headers

By default, Apollo Server will automatically recognize the following headers on incoming requests and associate them with a client's identity on a trace automatically:

* `apollographql-client-name`
* `apollographql-client-version`
* `apollographql-client-reference-id`

#### Custom client identification

For more advanced cases, or to use custom headers, pass a `generateClientInfo` function into the `ApolloServer` constructor:

```js{9-24}
const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    /* Other, existing `engine` configuration should remain the same. */

    generateClientInfo: ({
      request
    }) => {
      const headers = request.http && request.http.headers;
      if(headers) {
        return {
          clientName: headers['apollographql-client-name'],
          clientVersion: headers['apollographql-client-version'],
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
