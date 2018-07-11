---
title: GraphQL Playground
description: Visually exploring a Apollo Server
---

[GraphQL Playground](https://github.com/prismagraphql/graphql-playground) is a graphical interactive in-browser GraphQL IDE, created by [Prisma](https://www.prisma.io/), based on [GraphiQL](https://github.com/graphql/graphiql). In development, Apollo Server collocates a GraphQL Playground instance with the GraphQL path. When a browser sends a request to Apollo Server, it receives GraphQL Playground. When `NODE_ENV` is set to production, introspection and Playground are disabled as a production best practice.

<div align="center">
![GraphQL Playground](../images/playground.png)
</div>

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

## Enabling Playground in Production

To enable Playground in production, introspection and the playground can be enabled explicitly in the following manner.

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
