---
title: Using Engine with v2.0 RC
description: How to use Engine with Apollo Server 2.0 RC
---

Apollo Server provides reporting and persisted queries in native javascript by default, so often times moving to Apollo Server 2 without the Engine proxy is possible. For services that require the Engine proxy, Apollo Server continues to support with first class functionality. With Apollo Server 2, the engine proxy can be started by the same node process. If Engine is running in a dedicated machine, Apollo Server 2 supports the cache-control and tracing extensions, used to communicate with the proxy.

## Stand-alone Apollo Server

Apollo Server 2 is able to completely replace the Engine Proxy. To enable metrics reporting, add `ENGINE_API_KEY` as an environment variable. Apollo Server will then create a reporting agent that sends execution traces to the Engine UI. In addition by default, Apollo Server supports [persisted queries](./features/apq.html) without needing the proxy's cache. Apollo Server also provides cache-control headers for consumption by a [CDN](./features/cdn.html). Integration with a CDN provides a replacement for the full response caching in Engine Proxy.

```js
const { ApolloServer } = require('apollo-server');

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

## Starting Engine Proxy as a Sidecar

Some applications require the Engine Proxy for full response caching, so it is necessary to run the proxy as a process alongside Apollo Server. The `apollo-engine` package provides integrations with many [node frameworks](/docs/engine/setup-node.html#not-express), including [express](/docs/engine/setup-node.html#setup-guide), and starts the Engine Proxy alongside Apollo Server. The following code demonstrates how to start the proxy with Apollo Server 2. It assumes that the `ENGINE_API_KEY` environment variable is set to the api key of the service.

```js
const { ApolloEngine } = require('apollo-engine');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  tracing: true,
  cacheControl: true
});

server.applyMiddlware({ app });

const engine = new ApolloEngine({
  apiKey: process.env.ENGINE_API_KEY,
});

engine.listen({
  port: 4000,
  graphqlPaths: ['/api/graphql'],
  expressApp: app,
  launcherOptions: {
    startupTimeout: 3000,
  },
}, () => {
  console.log('Listening!');
});
```

To set the default max age inside of cacheControl, some additional options must be specified:

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  tracing: true,
  cacheControl: {
    defaultMaxAge: 5,
    stripFormattedExtensions: false,
    calculateCacheControlHeaders: false,
  },
});
```

## With a Running Engine Proxy

If the engine proxy is already running in a container in front of Apollo Server, then set `tracing` and `cacheControl` to true. These options will provide the extensions information to the proxy to create traces and ensure caching.

```js
const { ApolloServer } = require('apollo-server');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  tracing: true,
  cacheControl: true
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```
