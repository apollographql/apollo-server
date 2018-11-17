---
title: Fastify
description: Setting up Apollo Server with Fastify
---

[![npm version](https://badge.fury.io/js/apollo-server-fastify.svg)](https://badge.fury.io/js/apollo-server-fastify) [![Build Status](https://circleci.com/gh/apollographql/apollo-server.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://www.apollographql.com/#slack)

This is the Fastify integration of GraphQL Server. Apollo Server is a community-maintained open-source GraphQL server that works with many Node.js HTTP server frameworks. [Read the docs](https://www.apollographql.com/docs/apollo-server/). [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md)

```sh
npm install apollo-server-fastify
```

## Fastify

```js
const { ApolloServer, gql } = require('apollo-server-fastify');
const fastify = require('fastify');

async function StartServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const app = fastify();

  await server.createHandler({
    app,
  });

  await server.installSubscriptionHandlers(app.server);

  await app.listen(3000);
}

StartServer().catch(error => console.log(error));
```

## Principles

GraphQL Server is built with the following principles in mind:

* **By the community, for the community**: GraphQL Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, GraphQL Server is easier to use, easier to contribute to, and more secure
* **Performance**: GraphQL Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to GraphQL Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/master/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/master/ROADMAP.md) and make your first PR!
