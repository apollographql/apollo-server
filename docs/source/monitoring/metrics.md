---
title: Metrics and logging
description: How to monitor Apollo Server's performance
---

Apollo Server integrates seamlessly with Apollo Graph Manager to help you monitor the execution of your GraphQL operations. It also provides configurable mechanisms for logging each phase of a GraphQL operation.

> Using Federation? Check out the documentation for [federated tracing](/federation/metrics/).

## Sending metrics to Apollo Graph Manager

[Apollo Graph Manager](https://www.apollographql.com/docs/platform/graph-manager-overview/) provides an integrated hub for all of your GraphQL performance data. It [aggregates and displays information](https://www.apollographql.com/docs/platform/performance/) for your schema, queries, requests, and errors. You can also configure alerts that support [Slack and Datadog integrations](https://www.apollographql.com/docs/platform/integrations/).

### Connecting to Graph Manager

To connect Apollo Server to Graph Manager, first [visit the Graph Manager UI](https://engine.apollographql.com/) to get a Graph Manager API key. You can provide this API key to Apollo Server in one of the following ways:

* Include the API key in the constructor options for `ApolloServer`.
* Assign the API key to the `ENGINE_API_KEY` environment variable.

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

You can set environment variable values on the command line as seen below, or with the [`dotenv` npm package](https://www.npmjs.com/package/dotenv) (or similar).

```bash
# Replace the example values below with values specific to your use case.
ENGINE_API_KEY=YOUR_API_KEY ENGINE_SCHEMA_TAG=development node start-server.js
```

### Debugging Graph Manager reporting

You can set the [`debugPrintReports` option](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/agent.ts#L429-L433) in the `engine` section of the `ApolloServer` constructor to automatically log debugging information for all reporting requests sent to Graph Manager.  For example:

```js{8}
const { ApolloServer } = require("apollo-server");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    debugPrintReports: true,
  }
});
```

### Identifying distinct clients

Graph Manager's [client awareness feature](https://www.apollographql.com/docs/platform/client-awareness) enables you to view metrics for distinct versions
of your clients. To enable this, your clients need to include some or all of the following identifying information in the headers of GraphQL requests they
send to Apollo Server:

| Identifier | Header Name (default) | Example Value |
|----|----|----|
| Client name | `apollographql-client-name` | `iOS Native` |
| Client version | `apollographql-client-version` | `1.0.1` |

Each of these fields can have any string value that's useful for your application.
To simplify the browsing and sorting of your client data in Graph Manager,
a three-part version number (such as `1.0.1`) is recommended for client versions.

> Client version is **not** tied to your current version of Apollo
> Client (or any other client library). You define this value and are responsible
> for updating it whenever meaningful changes are made to your client.

#### Setting client awareness headers in Apollo Client

If you're using Apollo Client, you can set default values for client name and
version in the [`ApolloClient` constructor](https://www.apollographql.com/docs/react/api/apollo-client/#the-apolloclient-constructor). All requests to Apollo Server will automatically include these values in the appropriate headers.

#### Using custom headers

For more advanced cases, or to use headers other than the default headers, pass a `generateClientInfo` function into the `ApolloServer` constructor:

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

Specifying this function overrides the [`defaultGenerateClientInfo` function](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-engine-reporting/src/extension.ts#L205-L228) that Apollo Server calls otherwise.

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

For more advanced cases, Apollo Server provides an experimental API that accepts an array of plugins to its `plugins` field. Plugins receive a variety of lifecycle calls for each phase of a GraphQL request, include transport specific properties (e.g. headers), and can keep state, making them great for more specific logging needs.

For more details, see the [article on integrating with plugins](https://deploy-preview-2008--apollo-server-docs.netlify.com/docs/apollo-server/integrations/plugins/#responding-to-events) and check the full API from [the `apollo-server-plugin-base` package](https://github.com/apollographql/apollo-server/blob/7cca442ee39536182b4415fd5eba879d210fa5f9/packages/apollo-server-plugin-base/src/index.ts#L18-L73).
