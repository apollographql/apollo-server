[![npm version](https://badge.fury.io/js/apollo-server-fastify.svg)](https://badge.fury.io/js/apollo-server-fastify)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server/tree/main.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)
[![Join the community forum](https://img.shields.io/badge/join%20the%20community-forum-blueviolet)](https://community.apollographql.com)
[![Read CHANGELOG](https://img.shields.io/badge/read-changelog-blue)](https://github.com/apollographql/apollo-server/blob/HEAD/CHANGELOG.md)


This is the Fastify integration of GraphQL Server. Apollo Server is a community-maintained open-source GraphQL server that works with many Node.js HTTP server frameworks. [Read the docs](https://www.apollographql.com/docs/apollo-server/). [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md)

```shell
npm install apollo-server-fastify@3.x graphql
```

## Fastify

As of Apollo Server 3, this package supports Fastify v3 only.

```js
const { ApolloServer, gql } = require('apollo-server-fastify');
const { typeDefs, resolvers } = require('./module');

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const app = require('fastify')();

(async function () {
  await server.start();
  app.register(server.createHandler());
  await app.listen(3000);
})();
```

## Principles

GraphQL Server is built with the following principles in mind:

* **By the community, for the community**: GraphQL Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, GraphQL Server is easier to use, easier to contribute to, and more secure
* **Performance**: GraphQL Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to GraphQL Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/main/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/main/ROADMAP.md) and make your first PR!
