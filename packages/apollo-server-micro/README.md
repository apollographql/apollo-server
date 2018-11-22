---
title: Micro
description: Setting up Apollo Server with Micro
---

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core) [![Build Status](https://circleci.com/gh/apollographql/apollo-cache-control-js.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-cache-control-js) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://www.apollographql.com/#slack)

This is the [Micro](https://github.com/zeit/micro) integration for the Apollo community GraphQL Server. [Read the docs.](https://www.apollographql.com/docs/apollo-server/) [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md)

## Basic GraphQL Microservice

This example demonstrates how to setup a simple microservice, using Micro, that
handles incoming GraphQL requests via the default `/graphql` endpoint.

1) Package installation.

```sh
npm install --save micro apollo-server-micro@rc graphql
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
    sayHello(parent, args, context) {
      return 'Hello World!';
    },
  },
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });
module.exports = apolloServer.createHandler();
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

4) After an `npm start`, access `http://localhost:3000/graphql` in your
browser to run queries using
[`graphql-playground`](https://github.com/prismagraphql/graphql-playground),
or send GraphQL requests directly to the same URL.

## CORS Example

This example demonstrates how to setup a simple Micro + CORS + GraphQL
microservice, using [`micro-cors`](https://github.com/possibilities/micro-cors):

1) Package installation.

```sh
npm install --save micro micro-cors apollo-server-micro@rc graphql
```

2) `index.js`

```js line=1,19
const cors = require('micro-cors')();
const { ApolloServer, gql } = require('apollo-server-micro');

const typeDefs = gql`
  type Query {
    sayHello: String
  }
`;

const resolvers = {
  Query: {
    sayHello(parent, args, context) {
      return 'Hello World!';
    },
  },
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });
module.exports = cors(apolloServer.createHandler());
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

4) After an `npm start`, access `http://localhost:3000/graphql` in your
browser to run queries using
[`graphql-playground`](https://github.com/prismagraphql/graphql-playground),
or send GraphQL requests directly to the same URL.

## Custom GraphQL Path Example

This example shows how to setup a simple Micro + GraphQL microservice, that
uses a custom GraphQL endpoint path:

1) Package installation.

```sh
npm install --save micro apollo-server-micro@rc graphql
```

2) `index.js`

```js line=18
const { ApolloServer, gql } = require('apollo-server-micro');

const typeDefs = gql`
  type Query {
    sayHello: String
  }
`;

const resolvers = {
  Query: {
    sayHello(parent, args, context) {
      return 'Hello World!';
    },
  },
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });
module.exports = apolloServer.createHandler({ path: '/data' });
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

4) After an `npm start`, access `http://localhost:3000/graphql` in your
browser to run queries using
[`graphql-playground`](https://github.com/prismagraphql/graphql-playground),
or send GraphQL requests directly to the same URL.

## Fully Custom Routing Example

This example demonstrates how to setup a simple Micro + GraphQL microservice,
that uses [`micro-router`](https://github.com/pedronauck/micro-router) for
fully custom routing:

1) Package installation.

```sh
npm install --save micro microrouter apollo-server-micro@rc graphql
```

2) `index.js`

```js line=1,21-26
const { router, get, post, options } = require('microrouter');
const { ApolloServer, gql } = require('apollo-server-micro');

const typeDefs = gql`
  type Query {
    sayHello: String
  }
`;

const resolvers = {
  Query: {
    sayHello(parent, args, context) {
      return 'Hello World!';
    },
  },
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });
const graphqlPath = '/data';
const graphqlHandler = apolloServer.createHandler({ path: graphqlPath });
module.exports = router(
  get('/', (req, res) => 'Welcome!'),
  options(graphqlPath, graphqlHandler),
  post(graphqlPath, graphqlHandler),
  get(graphqlPath, graphqlHandler),
);
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

4) After an `npm start`, access `http://localhost:3000/graphql` in your
browser to run queries using
[`graphql-playground`](https://github.com/prismagraphql/graphql-playground),
or send GraphQL requests directly to the same URL.
