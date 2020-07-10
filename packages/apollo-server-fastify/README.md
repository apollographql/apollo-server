[![npm version](https://badge.fury.io/js/apollo-server-fastify.svg)](https://badge.fury.io/js/apollo-server-fastify) [![Build Status](https://circleci.com/gh/apollographql/apollo-server.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server) [![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/apollo)


This is the Fastify integration of GraphQL Server. Apollo Server is a community-maintained open-source GraphQL server that works with many Node.js HTTP server frameworks. [Read the docs](https://www.apollographql.com/docs/apollo-server/). [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md)

```shell
npm install apollo-server-fastify
```

## Fastify

```js
const { ApolloServer, gql } = require('apollo-server-fastify');
const { typeDefs, resolvers } = require('./module');

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = require('fastify')();

(async function () {
  app.register(server.createHandler());
  await app.listen(3000);
})();
```

## V3 Migration Guide

From Fastify v3, deprecated request.req and reply.res for request.raw and reply.raw [fastify #2008](https://github.com/fastify/fastify/pull/2008)
For this reason, a modification of the existing guide is required to distinguish the context between websocket and general connection. [#context-with-subscriptions](https://www.apollographql.com/docs/apollo-server/data/subscriptions/#context-with-subscriptions)

Here is a simple example.
```js
const server = new ApolloServer({
  schema,
  context: ({ raw, connection }) => {
    if (!raw) return connection.context;
  },
});
```

## Principles

GraphQL Server is built with the following principles in mind:

* **By the community, for the community**: GraphQL Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, GraphQL Server is easier to use, easier to contribute to, and more secure
* **Performance**: GraphQL Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to GraphQL Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/main/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/main/ROADMAP.md) and make your first PR!
