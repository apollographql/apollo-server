---
title: GraphQL Playground
description: Visually exploring a Apollo Server
---

[GraphQL Playground](https://github.com/prismagraphql/graphql-playground) is a graphical interactive in-browser GraphQL IDE, created by [Prisma](https://www.prisma.io/), based on [GraphiQL](https://github.com/graphql/graphiql). In development, Apollo Server collocates a GraphQL Playground instance with the GraphQL path. When a browser sends a request to Apollo Server, it receives the GraphQL Playground gui. When `NODE_ENV` is set to production, introspection and Playground are disabled as a production best practice.

<div align="center">
![GraphQL Playground](../images/playground.png)
</div>

## Enabling Playground in Production

By default, Apollo Server disables introspection and GraphQL Playground in production. For some applications, it is possible to expose them in production. In those case, introspection and the gui can be enabled explicitly in the following manner.

```js line=8,16
const { ApolloServer, gql } = require('apollo-server');
const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

// gui accepts a Playground configuration
server.applyMiddleware({
  gui: true,
});

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
);
```

> Note: when using apollo-server-express, you can remove apollo-server from your package.json
