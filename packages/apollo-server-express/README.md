---
title: Express / Connect
description: Setting up Apollo Server with Express.js or Connect
---

[![npm version](https://badge.fury.io/js/apollo-server-express.svg)](https://badge.fury.io/js/apollo-server-express) [![Build Status](https://circleci.com/gh/apollographql/apollo-server.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/apollo)


This is the Express and Connect integration of GraphQL Server. Apollo Server is a community-maintained open-source GraphQL server that works with many Node.js HTTP server frameworks. [Read the docs](https://www.apollographql.com/docs/apollo-server/). [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md)

```sh
npm install apollo-server-express
```

## Express

```js
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
```

## Connect

```js
const connect = require('connect');
const { ApolloServer, gql } = require('apollo-server-express');
const query = require('qs-middleware');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: () => 'Hello world!',
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

const app = connect();
const path = '/graphql';

app.use(query());
server.applyMiddleware({ app, path });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
```

> Note; `qs-middleware` is only required if running outside of Meteor

## Principles

GraphQL Server is built with the following principles in mind:

* **By the community, for the community**: GraphQL Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, GraphQL Server is easier to use, easier to contribute to, and more secure
* **Performance**: GraphQL Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to GraphQL Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/master/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/master/ROADMAP.md) and make your first PR!
