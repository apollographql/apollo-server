---
title: Migrating to v2.0 Beta
description: How to migrate to Apollo Server 2.0 beta
---

Migrating from Apollo Server 1 to Apollo Server 2.0 beta is a walk in the park.

### Node.js

Apollo Server 2.0 beta requires Node.js v6 and higher.

### Apollo Server Dependency in your App

Update the `apollo-server` dependency to `2.0.0-beta.1` in your `package.json` file. Another alternative is to use the `@beta` tag from your terminal: `npm install apollo-server@beta`. 

Once updated, your existing code should work as intended. No errors!

### The `gql` tag

Apollo Server 2.0 ships with the `gql` tag. You don't need to require `graphl-tags` anymore. It's not necessary to use the `gql` tag on the server. However, we recommend it for editor syntax highlighting and also to enable future functionality including statically analyzing GraphQL queries.

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
* The Apollo Server constructor can simply take in the `typeDefs` and resolvers as parameters.

### Apollo Server 1

An example of using Apollo Server 1 with Express:

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
      `Say hello to the new ApolloServer! A production ready GraphQL server with an incredible getting started experience`
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```