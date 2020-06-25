---
title: Integrating with Node.js middleware
sidebar_title: Node.js middleware
description: Use Apollo Server with Express, Koa, and more
---

Apollo Server integrates easily with several popular Node.js middleware libraries.
To integrate, first install the appropriate package from the table below _instead of_
the core `apollo-server` package:

| Middleware  | Package  |
|---|---|
| Express  | `apollo-server-express`  |
| AWS Lambda | `apollo-server-lambda` |
| Koa | `apollo-server-koa` |
| hapi  | `apollo-server-hapi`  |
| Micro | `apollo-server-micro` |
| Fastify  | `apollo-server-fastify`  |
| Google Cloud Functions | `apollo-server-cloud-functions` |
| Azure Functions | `apollo-server-azure-functions` |
| Cloudflare | `apollo-server-cloudflare` |


If you've already installed the core `apollo-server` package, you can `npm uninstall`
it after installing an integration package.

## Applying middleware

When integrating with middleware, first you initialize Apollo Server just like you
always do, and then you call `applyMiddleware`, like so:

```js
const { ApolloServer, gql } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
```

In the above example, the `app` parameter you provide to `applyMiddleware`
is your middleware's top-level representation of your application. In Express applications, for example, this variable is commonly named `app`.

By passing the existing `app` into `applyMiddleware`, Apollo Server can internally configure various middleware (including body parsing, the GraphQL Playground frontend, CORS support, etc.) without needing to separately apply those to the `app` with middleware mechanisms like Express.js' `app.use`.

> **Note:** When integrating with hapi, call `applyMiddleware` with `await`.
