---
title: Google Cloud Functions
description: Setting up Apollo Server with Google Cloud Functions
---

[![npm version](https://badge.fury.io/js/apollo-server-cloud-function.svg)](https://badge.fury.io/js/apollo-server-cloud-function) [![Build Status](https://circleci.com/gh/apollographql/apollo-server.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://www.apollographql.com/#slack)

This is the Google Cloud Function integration of GraphQL Server. Apollo Server is a community-maintained open-source GraphQL server that works with many Node.js HTTP server frameworks. [Read the docs](https://www.apollographql.com/docs/apollo-server/v2). [Read the CHANGELOG](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md).

```sh
npm install apollo-server-cloud-function@rc graphql
```

## Deploying with Google Cloud Function

#### 1. Write the API handlers

In a file named `graphql.js`, place the following code:

```js
const { ApolloServer, gql } = require('apollo-server-cloud-function');

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

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

exports.handler = server.createHandler();
```

#### 2. Configure your Cloud function and deploy

Set the _Function to execute_ option to _handler_
and deploy

## Getting request info

To read information about the current request from the API Gateway event (HTTP headers, HTTP method, body, path, ...) or the current Google Cloud Function (Function Name, Function Version, awsRequestId, time remaining, ...) use the options function. This way they can be passed to your schema resolvers using the context option.

```js
const { ApolloServer, gql } = require('apollo-server-cloud-function');

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

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({
    headers: req.headers,
    req,
    res,
  }),
});

exports.handler = server.createHandler();
```

## Modifying the GCF Response (Enable CORS)

To enable CORS the response HTTP headers need to be modified. To accomplish this use the `cors` option.

```js
const { ApolloServer, gql } = require('apollo-server-cloud-function');

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

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

exports.handler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true,
  },
});
```

To enable CORS response for requests with credentials (cookies, http authentication) the allow origin header must equal the request origin and the allow credential header must be set to true.

```js
const { ApolloServer, gql } = require('apollo-server-cloud-function');

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

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

exports.handler = server.createHandler({
  cors: {
    origin: true,
    credentials: true,
  },
});
```

### Cors Options

The options correspond to the [express cors configuration](https://github.com/expressjs/cors#configuration-options) with the following fields(all are optional):

- `origin`: boolean | string | string[]
- `methods`: string | string[]
- `allowedHeaders`: string | string[]
- `exposedHeaders`: string | string[]
- `credentials`: boolean
- `maxAge`: number

## Principles

GraphQL Server is built with the following principles in mind:

- **By the community, for the community**: GraphQL Server's development is driven by the needs of developers
- **Simplicity**: by keeping things simple, GraphQL Server is easier to use, easier to contribute to, and more secure
- **Performance**: GraphQL Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to GraphQL Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/master/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/master/ROADMAP.md) and make your first PR!
