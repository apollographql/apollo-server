---
title: Migrating to v2.0 Beta
description: How to migrate to Apollo Server 2.0 beta
---

The Apollo Server 2.0 beta dramatically simplifies the API for building a GraphQL server without compromising on features. It's also completely backward compatible, so you don't have to worry about breaking changes when upgrading. We do recommend upgrading to the new API as soon as possible to take advantage of all the latest Apollo Server features. To learn how to migrate to the 2.0 beta from version 1.0, please read the following guide.

### Node.js

Apollo Server 2.0 beta requires Node.js v6 and higher.

### Apollo Server Dependency in your App

Update the `apollo-server` dependency to `2.0.0-beta.1` in your `package.json` file. Another alternative is to use the `@beta` tag from your terminal: `npm install apollo-server@beta`.

Once updated, your existing code should work as intended. No errors!

### The `gql` tag

Apollo Server 2.0 ships with the `gql` tag for editor syntax highlighting and auto-formatting with Prettier. In the future, we will be using it for statically analyzing GraphQL queries, so we recommend wrapping your schema with `gql` today. Unlike the `gql` tag on the client, it does not parse the query string into an AST.

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    hello: String
  }
`;
```

Check out the following changes for Apollo Server 2.0 beta with express.

* You no longer need to import `body-parser` to set up `apollo-server-exress`.
* You no longer need to import `makeExecutableSchema` from `graphql-tools`.
* You no longer need to import `graphqlExpress` and `graphiqlExpress` from `apollo-server-express`.
* You should pass in `typeDefs` and resolvers as parameters to an instance of Apollo Server.

### Apollo Server 1

An example of using Apollo Server 1 with the Express framework:

```js
const express = require('express');
const bodyParser = require('body-parser');
const { makeExecutableSchema } = require('graphql-tools');
const { graphqlExpress } = require('apollo-server-express');

const typeDefs = `
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello world!'
  },
}

const myGraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const PORT = 3000;

const app = express();

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: myGraphQLSchema }));

app.listen(PORT);
```

### Apollo Server 2

Now, you can just do this instead:

```js
const express = require('express');
const { ApolloServer, gql } = require('apollo-server');
const { registerServer } = require('apollo-server-express');

const app = express();

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello world!'
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
registerServer({ server, app });

// normal ApolloServer listen call but url will contain /graphql
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

### Stand-alone Apollo Server

If you are simply focused on running a production-ready GraphQL server quickly, Apollo Server 2.0 beta ships with a built-in server like so:

```js
const { ApolloServer, gql } = require("apollo-server");

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    annoucement: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    annoucement: () =>
      `Say hello to the new ApolloServer! A production ready GraphQL server with an incredible getting started experience.`
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```
