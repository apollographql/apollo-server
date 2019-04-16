---
title: GraphQL Playground
description: Visually exploring an Apollo Server
---

[GraphQL Playground](https://github.com/prismagraphql/graphql-playground) is a graphical, interactive, in-browser GraphQL IDE, created by [Prisma](https://www.prisma.io/) and based on [GraphiQL](https://github.com/graphql/graphiql).

In development, Apollo Server enables GraphQL Playground on the same URL as the GraphQL server itself (e.g. `http://localhost:4000/graphql`) and automatically serves the GUI to web browsers.  When `NODE_ENV` is set to `production`, GraphQL Playground (as well as introspection) is disabled as a production best-practice.

![GraphQL Playground](../images/graphql-playground.png)

## Configuring Playground

The Apollo Server constructor contains the ability to configure GraphQL Playground with the `playground` configuration option. The options can be found on GraphQL Playground's [documentation](https://github.com/prismagraphql/graphql-playground/#usage)

```js
new ApolloServer({
typeDefs,
resolvers,
playground: {
  settings: {
    'editor.theme': 'light',
  },
  tabs: [
    {
      endpoint,
      query: defaultQuery,
    },
  ],
},
});
```

## Enabling GraphQL Playground in production

To enable GraphQL Playground in production, introspection and the playground can be enabled explicitly in the following manner.

```js line=7-8
const { ApolloServer } = require('apollo-server');
const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true,
});


server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```
