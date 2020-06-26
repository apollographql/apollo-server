[![npm version](https://badge.fury.io/js/apollo-server-cloud-functions.svg)](https://badge.fury.io/js/apollo-server-cloud-functions) [![Build Status](https://circleci.com/gh/apollographql/apollo-server.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server) [![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/apollo)


This is the Google Cloud Function integration of GraphQL Server. Apollo Server is a community-maintained open-source GraphQL server that works with many Node.js HTTP server frameworks. [Read the docs](https://www.apollographql.com/docs/apollo-server/v2). [Read the CHANGELOG](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md).

```shell
npm install apollo-server-cloud-functions graphql
```

## Deploying with Google Cloud Function

#### 1. Write the API handlers

First, create a `package.json` file and include `apollo-server-cloud-functions` in your dependencies. Then in a file named `index.js`, place the following code:

```js
const { ApolloServer, gql } = require('apollo-server-cloud-functions');

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
  playground: true,
  introspection: true,
});

exports.handler = server.createHandler();
```

#### 2. Configure your Cloud Function and deploy

On the Create Function page, set _Trigger_ to `HTTP` and _Function to execute_ to the name of your exported handler, in this case `handler`.

Since NODE_ENV is a reserved environment variable in GCF and it defaults to "production", both the **playground** and **introspection**
options need to be explicitly set to `true` for the GraphQL Playground to work correctly.

After configuring your Function you can press **Create** and an http endpoint will be created a few seconds later.

You can refer to the [Cloud Functions documentation](https://cloud.google.com/functions/docs/quickstart-console) for more details

## Getting request info

To read information about the currently executing Google Cloud Function (HTTP headers, HTTP method, body, path, ...) use the context option. This way you can pass any request specific data to your schema resolvers.

```js
const { ApolloServer, gql } = require('apollo-server-cloud-functions');

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
const { ApolloServer, gql } = require('apollo-server-cloud-functions');

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
const { ApolloServer, gql } = require('apollo-server-cloud-functions');

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

Anyone is welcome to contribute to GraphQL Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/main/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/main/ROADMAP.md) and make your first PR!
