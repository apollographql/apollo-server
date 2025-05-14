# `@apollo/server`

> This `@apollo/server` package is new with Apollo Server 4. Previous major versions of Apollo Server used a set of package names starting with `apollo-server`, such as `apollo-server`, `apollo-server-express`, `apollo-server-core`, etc.

[![npm version](https://badge.fury.io/js/%40apollo%2Fserver.svg)](https://badge.fury.io/js/%40apollo%2Fserver)
[![Build Status](https://circleci.com/gh/apollographql/apollo-server.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-server)
[![Join the community](https://img.shields.io/discourse/status?label=Join%20the%20community&server=https%3A%2F%2Fcommunity.apollographql.com)](https://community.apollographql.com)

---

**Announcement:**
Join 1000+ engineers at GraphQL Summit 2025 by Apollo for talks, workshops, and office hours. Oct 6-8, 2025 in San Francisco. [Get your pass here ->](https://www.apollographql.com/graphql-summit-2025?utm_campaign=2025-03-04_graphql-summit-github-announcement&utm_medium=github&utm_source=apollo-server)

---

## A TypeScript/JavaScript GraphQL server

**Apollo Server is an [open-source](https://github.com/apollographql/apollo-server), spec-compliant GraphQL server** that's compatible with any GraphQL client, including [Apollo Client](https://www.apollographql.com/docs/react). It's the best way to build a production-ready, self-documenting GraphQL API that can use data from any source.


You can use Apollo Server as:

* A stand-alone GraphQL server
* The GraphQL server for a [subgraph](https://www.apollographql.com/docs/federation/subgraphs/) in a federated supergraph
* The gateway for a [federated supergraph](https://www.apollographql.com/docs/federation/)

Apollo Server provides a simple API for integrating with any Node.js web framework or serverless environment. The `@apollo/server` package itself ships with a minimally-configurable, standalone web server which handles CORS and body parsing out of the box. Integrations with other environments are community-maintained.

Apollo Server provides:

*  **Straightforward setup**, so your client developers can start fetching data quickly
*  **Incremental adoption**, enabling you to add features as they're needed
*  **Universal compatibility** with any data source, any build tool, and any GraphQL client
*  **Production readiness**, enabling you to confidently run your graph in production

## Documentation

Full documentation for Apollo Server is available on [our documentation site](https://www.apollographql.com/docs/apollo-server/). This README shows the basics of getting a server running (both standalone and with Express), but most features are only documented on our docs site.


## Getting started: standalone server

> You can also check out the [getting started](https://www.apollographql.com/docs/apollo-server/getting-started) guide in the Apollo Server docs for more details, including examples in both TypeScript and JavaScript.

Apollo Server's standalone server lets you get a GraphQL server up and running quickly without needing to set up an HTTP server yourself. It allows all the same configuration of GraphQL logic as the Express integration, but does not provide the ability to make fine-grained tweaks to the HTTP-specific behavior of your server.

First, install Apollo Server and the JavaScript implementation of the core GraphQL algorithms:

```
npm install @apollo/server graphql
```

Then, write the following to `server.mjs`. (By using the `.mjs` extension, Node lets you use the `await` keyword at the top level.)

```js
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';

// The GraphQL schema
const typeDefs = `#graphql
  type Query {
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

const { url } = await startStandaloneServer(server);
console.log(`🚀 Server ready at ${url}`);
```

Now run your server with:

```
node server.mjs
```

Open the URL it prints in a web browser. It will show [Apollo Sandbox](https://www.apollographql.com/docs/studio/explorer/sandbox/), a web-based tool for running GraphQL operations. Try running the operation `query { hello }`!


## Getting started: Express middleware

Apollo Server's Express middleware lets you run your GraphQL server as part of an app built with [Express](https://expressjs.com/), the most popular web framework for Node.

First, install Apollo Server, its Express middleware, the JavaScript implementation of the core GraphQL algorithms, Express, and the standard Express middleware package for CORS headers:

```
npm install @apollo/server @as-integrations/express5 graphql express cors
```

If using Typescript you may also need to install additional type declaration packages as development dependencies to avoid common errors when importing the above packages (i.e. Could not find a declaration file for module '`cors`'):

```
npm install --save-dev @types/cors @types/express
```

Then, write the following to `server.mjs`. (By using the `.mjs` extension, Node lets you use the `await` keyword at the top level.)

```js
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import express from 'express';
import http from 'http';
import cors from 'cors';

// The GraphQL schema
const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => 'world',
  },
};

const app = express();
const httpServer = http.createServer(app);

// Set up Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
await server.start();

app.use(
  cors(),
  express.json(),
  expressMiddleware(server),
);

await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000`);
```

Now run your server with:

```
node server.mjs
```

Open the URL it prints in a web browser. It will show [Apollo Sandbox](https://www.apollographql.com/docs/studio/explorer/sandbox/), a web-based tool for running GraphQL operations. Try running the operation `query { hello }`!
