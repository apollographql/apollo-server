[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server/tree/main.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)
[![Join the community forum](https://img.shields.io/badge/join%20the%20community-forum-blueviolet)](https://community.apollographql.com)
[![Read CHANGELOG](https://img.shields.io/badge/read-changelog-blue)](https://github.com/apollographql/apollo-server/blob/HEAD/CHANGELOG.md)


This is the [Micro](https://github.com/zeit/micro) integration for the Apollo community GraphQL Server. [Read the docs.](https://www.apollographql.com/docs/apollo-server/) [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md)

A full example of how to use `apollo-server-micro` can be found in [the docs](https://www.apollographql.com/docs/apollo-server/integrations/middleware/#apollo-server-micro).

## CORS Example

This example demonstrates how to setup a simple Micro + CORS + GraphQL
microservice, using [`micro-cors`](https://github.com/possibilities/micro-cors):

1) Package installation.

```shell
npm install micro micro-cors apollo-server-micro graphql
```

2) `index.js`

```js
const cors = require('micro-cors')(); // highlight-line
const { ApolloServer, gql } = require('apollo-server-micro');
const { send } = require('micro');

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
module.exports = apolloServer.start().then(() => {
  const handler = apolloServer.createHandler();
  return cors((req, res) => req.method === 'OPTIONS' ? send(res, 200, 'ok') : handler(req, res))
});
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

```shell
npm install micro apollo-server-micro graphql
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
module.exports = apolloServer.start().then(() => {
  return apolloServer.createHandler({ path: '/data' });  // highlight-line
});
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

4) After an `npm start`, access `http://localhost:3000/data` in your
browser to run queries using
[`graphql-playground`](https://github.com/prismagraphql/graphql-playground),
or send GraphQL requests directly to the same URL.

## Fully Custom Routing Example

This example demonstrates how to setup a simple Micro + GraphQL microservice,
that uses [`micro-router`](https://github.com/pedronauck/micro-router) for
fully custom routing:

1) Package installation.

```shell
npm install micro microrouter apollo-server-micro graphql
```

2) `index.js`

```js{1,21-26}
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
module.exports = apolloServer.start().then(() => {
  const graphqlPath = '/data';
  const graphqlHandler = apolloServer.createHandler({ path: graphqlPath });
  return router(
    get('/', (req, res) => 'Welcome!'),
    post(graphqlPath, graphqlHandler),
    get(graphqlPath, graphqlHandler),
  );
});
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

4) After an `npm start`, access `http://localhost:3000/data` in your
browser to run queries using
[`graphql-playground`](https://github.com/prismagraphql/graphql-playground),
or send GraphQL requests directly to the same URL.
