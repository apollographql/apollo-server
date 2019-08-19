---
title: Monitoring and metrics
description: How to monitor Apollo Server's performance
---

Understanding GraphQL execution inside of Apollo Server is critical to developing and running a production GraphQL layer. Apollo Server provides sophisticated GraphQL monitoring via integration with Apollo Graph Manager, along with native mechanisms for logging each phase of a GraphQL request.

> Using Federation? Check out the documentation for [federated tracing](/federation/metrics/)

## Apollo Graph Manager

[Apollo Graph Manager](https://www.apollographql.com/docs/platform/graph-manager-overview/) provides an integrated hub for all of your GraphQL performance data. Obtain an API key from the [Graph Manager UI](https://engine.apollographql.com/) and provide it to Apollo Server to enable automatic reporting of performance and error data. Graph Manager aggregates and displays information for your [schema](https://www.apollographql.com/docs/engine/features/performance.html), [queries](https://www.apollographql.com/docs/engine/features/query-tracking.html), [requests](https://www.apollographql.com/docs/engine/performance.html), and [errors](https://www.apollographql.com/docs/engine/features/error-tracking.html). You can also configure [alerts](https://www.apollographql.com/docs/engine/features/alerts.html) that support [Slack](https://www.apollographql.com/docs/engine/integrations/slack.html) and [Datadog](https://www.apollographql.com/docs/engine/integrations/datadog.html) integrations.

To connect Apollo Server to Graph Manager, first [visit the Graph Manager UI](https://engine.apollographql.com/) to get a Graph Manager API key.

You can provide the API key to Apollo Server in any of the following ways:

* Include the API key in the constructor options for `ApolloServer`
* Assign the API key to the `ENGINE_API_KEY` environment variable

### Providing an API key via the `ApolloServer` constructor

You can provide your Graph Manager API key as an option to the `ApolloServer`
constructor like so:

```js{6-14}
const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    // The Graph Manager API key
    apiKey: "YOUR_API_KEY_HERE",

    // A tag for this specific environment (e.g. `development` or `production`).
    // For more information on schema tags/variants, see
    // https://www.apollographql.com/docs/platform/schema-registry/#associating-metrics-with-a-variant
    schemaTag: 'development',
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

### Providing an API key via environment variables

You can provide your Graph Manager API key to Apollo Server via the `ENGINE_API_KEY` environment variable. Similarly, you can assign a particular [variant](https://www.apollographql.com/docs/platform/schema-registry/#managing-environments)
to an Apollo Server instance via the `ENGINE_SCHEMA_TAG` environment variable.

You can set environment variable values on the command line as seen below, or by using the [`dotenv` npm package](https://www.npmjs.com/package/dotenv) (or similar).

```bash
# Replace the example values below with values specific to your use case.
ENGINE_API_KEY=YOUR_API_KEY ENGINE_SCHEMA_TAG=development node start-server.js
```

### Client awareness

> For additional information on client awareness, please see the section in our Apollo Platform documentation on [client awareness](https://www.apollographql.com/docs/platform/client-awareness).

Setting up client awareness enables client-based filtering of metrics and usage patterns within Apollo Graph Manager.  A client's identity has three configurable dimensions:

* Name (e.g. "Android App")
* Version (e.g. `1.0.1`)
* Reference ID (e.g. A Git reference or other supporting identifier)

There are two ways to configure client awareness:

1. By setting specific headers on the client which are automatically picked up by Apollo Server.
2. Defining a custom `generateClientInfo` implementation within Apollo Server, allowing the use of different headers or other information from the request context.

#### Default client identification headers

By default, Apollo Server automatically recognizes the following headers on incoming requests and associates them with a client's identity on a trace automatically:

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

For more advanced cases, Apollo Server provides an experimental API that accepts an array of `graphql-extensions` to the `extensions` field. These extensions receive a variety of lifecycle calls for each phase of a GraphQL request and can keep state, such as the request headers.

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

For example, the `logFunction` from Apollo Server 1 can be implemented as an [extension](https://github.com/apollographql/apollo-server/blob/8914b135df9840051fe81cc9224b444cfc5b61ab/packages/apollo-server-core/src/logging.ts) and could be modified to add additional state or functionality.
