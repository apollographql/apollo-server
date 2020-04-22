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
| Fastify  | `apollo-server-fastify`  |
| hapi  | `apollo-server-hapi`  |
| Koa | `apollo-server-koa` |

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

That happens because you are passing this top-level representation **by reference** so into the Apollo Server code, a specific route for Apollo is configured internally and applied to that middleware (Express e.g.). For additional information check the implementation code [here](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-server-express/src/ApolloServer).

> **Note:** When integrating with hapi, call `applyMiddleware` with `await`.
