---
title: Hapi
description: Setting up Apollo Server with Hapi
---

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core) [![Build Status](https://circleci.com/gh/apollographql/apollo-cache-control-js.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-cache-control-js) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://www.apollographql.com/#slack)

This is the Hapi integration of Apollo Server. Apollo Server is a community-maintained open-source Apollo Server that works with all Node.js HTTP server frameworks: Express, Connect, Hapi, Koa and Restify. [Read the docs](https://www.apollographql.com/docs/apollo-server/). [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md)

```sh
npm install apollo-server-hapi
```

## Usage

With the Hapi plugins `graphqlHapi` and `graphiqlHapi` you can pass a route object that includes options to be applied to the route. The example below enables CORS on the `/graphql` route.

The code below requires Hapi 17, See below for Hapi 16 support.

```js
import Hapi from 'hapi';
import { graphqlHapi } from 'apollo-server-hapi';

const HOST = 'localhost';
const PORT = 3000;

async function StartServer() {
  const server = new Hapi.server({
    host: HOST,
    port: PORT,
  });

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: {
        schema: myGraphQLSchema,
      },
      route: {
        cors: true,
      },
    },
  });

  try {
    await server.start();
  } catch (err) {
    console.log(`Error while starting server: ${err.message}`);
  }

  console.log(`Server running at: ${server.info.uri}`);
}

StartServer();
```

## Hapi 16

Imports must be monkey patched for Hapi 16 support (mainly attributes).

```js
import { graphqlHapi, graphiqlHapi } from 'apollo-server-hapi';

// add attributes for hapi 16
graphqlHapi.attributes = {
  name: graphqlHapi.name,
};

// if you happen to use graphiql then add attributes for hapi 16
graphiqlHapi.attributes = {
  name: graphiqlHapi.name,
};

async function StartServer() {
  const server = new Hapi.server({
    host: HOST,
    port: PORT,
  });

  await server.register({
    plugin: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: {
        schema: myGraphQLSchema,
      },
      route: {
        cors: true,
      },
    },
  });

  await server.register({
    plugin: graphiqlHapi,
    options: {
      path: '/graphiql',
      route: {
        cors: true,
      },
      graphiqlOptions: {
        endpointURL: 'graphql',
      },
    },
  });

  try {
    await server.start();
  } catch (err) {
    console.log(`Error while starting server: ${err.message}`);
  }

  console.log(`Server running at: ${server.info.uri}`);
}

StartServer();
```

## Principles

Apollo Server is built with the following principles in mind:

* **By the community, for the community**: Apollo Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, Apollo Server is easier to use, easier to contribute to, and more secure
* **Performance**: Apollo Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to Apollo Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/master/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/master/ROADMAP.md) and make your first PR!
