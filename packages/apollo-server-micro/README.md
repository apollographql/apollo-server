---
title: Micro
description: Setting up Apollo Server with Micro
---

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core) [![Build Status](https://circleci.com/gh/apollographql/apollo-cache-control-js.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-cache-control-js) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://www.apollographql.com/#slack)

This is the [Micro](https://github.com/zeit/micro) integration for the Apollo community GraphQL Server. [Read the docs.](https://www.apollographql.com/docs/apollo-server/) [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md)

## Basic GraphQL Microservice

This example demonstrates how to setup a simple microservice using Micro, that
handles all incoming requests as GraphQL requests.

1) Package installation.

```sh
npm install --save micro apollo-server-micro
```

2) `index.js`

```js
const { ApolloServer, gql } = require('apollo-server-micro');

const typeDefs = gql`
  type Query {
    sayHello: String
  }
`;

const resolvers = {
  Query: {
    sayHello(root, args, context) {
      return 'Hello World!';
    },
  },
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });
module.exports = apolloServer.graphqlHandler();
```

3) `package.json`

```json
{
  "main": "index.js",
  "scripts": {
    "start": "micro"
  }
}
```

4) After an `npm start`, your `http://localhost:3000` endpoint can now handle
GraphQL requests.
