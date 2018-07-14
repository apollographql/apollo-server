# GraphQL Server for Express, Connect, Hapi, Cloudflare workers, and more

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)
[![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://www.apollographql.com/#slack)

Apollo Server is a community-maintained open-source GraphQL server. It works with pretty much all Node.js HTTP server frameworks, and we're happy to take PRs for more! Apollo Server works with any GraphQL schema built with [GraphQL.js](https://github.com/graphql/graphql-js), so you can build your schema with that directly or with a convenience library such as [graphql-tools](https://www.apollographql.com/docs/graphql-tools/).

## Documentation

[Read the docs!](https://www.apollographql.com/docs/apollo-server/v2)

## Principles

Apollo Server is built with the following principles in mind:

- **By the community, for the community**: Apollo Server's development is driven by the needs of developers
- **Simplicity**: by keeping things simple, Apollo Server is easier to use, easier to contribute to, and more secure
- **Performance**: Apollo Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to Apollo Server, just read [CONTRIBUTING.md](./CONTRIBUTING.md), take a look at the [roadmap](./ROADMAP.md) and make your first PR!

## Getting started

Apollo Server is super easy to set up. Just `npm install apollo-server-<integration>`, write a GraphQL schema, and then use one of the following snippets to get started. For more info, read the [Apollo Server docs](https://www.apollographql.com/docs/apollo-server/v2).

### Installation

Run `npm install --save apollo-server-<integration>` and you're good to go!

```js
const { ApolloServer, gql } = require('apollo-server');

// The GraphQL schema
const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => 'world',
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
```

## Integrations

Often times, Apollo Server needs to be run with a particular integration. To start, run `npm install --save apollo-server-<integration>` where `<integration>` is one of the following:

- `express`
- `hapi`
- `lambda`
- `cloudflare`

If a framework is not on this list and it should be supported, please open a PR.

### Express

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
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
);
```

### Connect

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

server.use(query());
server.applyMiddleware({ app, path });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
);
```

> Note; `qs-middleware` is only required if running outside of Meteor

### Hapi

The code below requires Hapi 17 or higher.

```js
const { ApolloServer, gql } = require('apollo-server-hapi');
const Hapi = require('hapi');

async function StartServer() {
  const server = new ApolloServer({ typeDefs, resolvers });

  const app = new Hapi.server({
    port: 4000,
  });

  await server.applyMiddleware({
    app,
  });

  await server.installSubscriptionHandlers(app.listener);

  await app.start();
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

### AWS Lambda

Apollo Server can be run on Lambda and deployed with AWS Serverless Application Model (SAM). It requires an API Gateway with Lambda Proxy Integration.

```js
const { ApolloServer, gql } = require('apollo-server-lambda');

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

exports.graphqlHandler = server.createHandler();
```

## Apollo Server Development

If you want to develop Apollo Server locally you must follow the following instructions:

- Fork this repository

- Install the Apollo Server project in your computer

```
git clone https://github.com/[your-user]/apollo-server
cd apollo-server
npm install
cd packages/apollo-server-<integration>/
npm link
```

- Install your local Apollo Server in other App

```
cd ~/myApp
npm link apollo-server-<integration>
```
