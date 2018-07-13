---
title: GraphQL Playground
description: Visually exploring an Apollo Server
---

[GraphQL Playground](https://github.com/prismagraphql/graphql-playground) is a graphical, interactive, in-browser GraphQL IDE, created by [Prisma](https://www.prisma.io/) and based on [GraphiQL](https://github.com/graphql/graphiql).

In development, Apollo Server enables GraphQL Playground on the same URL as the GraphQL server itself (e.g. `http://localhost:4000/graphql`) and automatically serves the GUI to web browsers.  When `NODE_ENV` is set to `production`, GraphQL Playground (as well as introspection) is disabled as a production best-practice.

<div align="center">
![GraphQL Playground](../images/graphql-playground.png)
</div>

## Enabling GraphQL Playground in production

To enable GraphQL Playground in production, an integration package must be installed to provide more control over the middlewares used. The following example uses the express integration:

```bash
npm install --save apollo-server-express@rc graphql
```

Introspection and the GUI can be enabled explicitly in the following manner.

```js line=8,16
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

const app = express();

// `gui` accepts a GraphQL Playground configuration
server.applyMiddleware({
  app,
  gui: true,
});

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
);
```

> Note: When using the `apollo-server-express` package, the `apollo-server` package can be uninstalled.
