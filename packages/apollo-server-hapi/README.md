---
title: Hapi
description: Setting up Apollo Server with Hapi
---

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core) [![Build Status](https://circleci.com/gh/apollographql/apollo-cache-control-js.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-cache-control-js) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://www.apollographql.com/#slack)

This is the Hapi integration of Apollo Server. Apollo Server is a community-maintained open-source Apollo Server that works with all Node.js HTTP server frameworks: Express, Connect, Hapi, Koa and Restify. [Read the docs](https://www.apollographql.com/docs/apollo-server/). [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md)

```sh
npm install apollo-server-hapi@beta
```

## Usage

After constructing Apollo server, a hapi server can be enabled with a call to `registerServer`. Ensure that `autoListen` is set to false in the `Hapi.server` constructor.

The code below requires Hapi 17 or higher.

```js
const { registerServer, ApolloServer, gql } = require('apollo-server-hapi');

const HOST = 'localhost';

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'hello',
  },
}

async function StartServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  await registerServer({
    server,
    //Hapi Server constructor options
    options: {
      host: HOST,
    },
  });

  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}

StartServer().catch(error => console.log(error));
```

For more advanced use cases or migrating from 1.x, a Hapi server can be constructed and passed into `registerServer`.

```js
const { ApolloServer, gql, registerServer } = require('apollo-server-hapi');
const Hapi = require('hapi');

async function StartServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const app = new Hapi.server({
    //autoListen must be set to false, since Apollo Server will setup the listener
    autoListen: false,
    host: HOST,
  });

  await registerServer({
    server,
    app,
  });

  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}

StartServer().catch(error => console.log(error));
```

### Context

The context is created for each request. The following code snippet shows the creation of a context. The arguments are the `request`, the request, and `h`, the response toolkit.

```js
new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ request, h }) => {
    return { ... };
  },
})
```

## Principles

Apollo Server is built with the following principles in mind:

* **By the community, for the community**: Apollo Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, Apollo Server is easier to use, easier to contribute to, and more secure
* **Performance**: Apollo Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to Apollo Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/master/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/master/ROADMAP.md) and make your first PR!
