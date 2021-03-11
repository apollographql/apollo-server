---
title: Using a different version of graphql-tools
---

Apollo Server includes `graphql-tools` version 4 by default. If you want to use a newer version, you can do so with the following steps:

1. Install `graphql-tools` separately in your project.

2. Update your `ApolloServer` constructor to provide the `schema` option _instead of_ `typeDefs`, `resolvers`, and `schemaDirectives`. You pass these options to the `makeExecutableSchema` function, which you provide as the value of `schema`:

    ```js
    const { ApolloServer, gql } = require("apollo-server");
    const { makeExecutableSchema } = require("@graphql-tools/schema");

    const server = new ApolloServer({
      schema: makeExecutableSchema({
        typeDefs,
        resolvers,
        schemaDirectives: {
          // ...directive subclasses...
        }
      }),
      // ...other options...
    });
    ```

For more information on the latest version of `graphql-tools`, see the [official documentation](https://www.graphql-tools.com/docs/introduction/).
