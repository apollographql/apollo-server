---
title: Migrating to v2.0
description: How to migrate to Apollo Server 2.0
---

Apollo Server 2.0 dramatically simplifies the API for building a GraphQL server without compromising on features. It's also completely backward compatible, so you don't have to worry about breaking changes when upgrading.

While it's possible to migrate an existing server to 2.0 without any changes, we recommend changing to new patterns we're suggesting in order to take advantage of all the latest Apollo Server features, reduce the boilerplate, and enable future flexibility.  To learn how to migrate to 2.0 from version 1.0, please read the following guide.

## The `gql` tag

Apollo Server 2.0 ships with the `gql` tag for **editor syntax highlighting** and **auto-formatting** with Prettier.  In the future, we will be using it for statically analyzing GraphQL queries, so Apollo Server requires wrapping your schema with `gql`.

The `gql` tag parses the query string into an AST  and is now exported from the new `apollo-server` package.

```js{1,3}
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

//Some projects use schemas imported from external files
const fs = require('fs');
const typeDefs = gql`${fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8')}`;

//gql can also be used as regular function to convert a string to an AST
const typeDefs = gql(fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8'))
```

## Changes to app dependencies

> Apollo Server 2.0 requires Node.js v6 and higher.

Apollo Server 2.0 simplifies implementing a GraphQL server.  Apollo Server 1.0 revolved around providing middleware-based solutions, which had to be added to an application which already existed.  These middleware implementations were tied to the HTTP server in use (e.g. `apollo-server-express` for Express implementations, `apollo-server-hapi` for hapi, etc.).

There is a consideration to be made when following the rest of the guide:

* [**Middleware option**](#middleware): If the application being migrated implements Apollo Server alongside other middleware, there are some packages which can be removed, but adding the `apollo-server-{integration}` package and switching to using the new `applyMiddleware` API should still simplify the setup.  In this case, check the [Middleware](#middleware) section.
* [**Stand-alone option**](#stand-alone): If the application being migrated is only used as a GraphQL server, Apollo Server 2.0 _eliminates the need to run a separate HTTP server_ and allows some dependencies to be removed.  In these cases, the [Stand-alone](#stand-alone) option will reduce the amount of code necessary for running a GraphQL server.

## Simplified usage

Check out the following changes for Apollo Server 2.0.

* You no longer need to import `body-parser` to set up `apollo-server-express`.
* You no longer need to import `makeExecutableSchema` from `graphql-tools`.
* You no longer need to import `graphqlExpress` and `graphiqlExpress` from `apollo-server-express`.
* You should pass in `typeDefs` and `resolvers` as parameters to an instance of Apollo Server.
* If the server is only functioning as a GraphQL server, it's no longer necessary to run your own HTTP server (like `express`).

## Middleware

With the middleware option used by Apollo Server 1.0 users, it is necessary to install the 2.0 version of `apollo-server-express`.  To do this, install via the terminal:

    npm install apollo-server-express graphql

The changes are best shown by comparing the before and after of the application.

## Apollo Server 1 (old pattern)

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

### Apollo Server 2 (new pattern)

Now, you can just do this instead:

```js
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const PORT = 4000;

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
server.applyMiddleware({ app });

app.listen({ port: PORT }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
```

## Stand-alone

For starting a production-ready GraphQL server quickly, Apollo Server 2.0 ships with a built-in server, so starting a server (e.g. Express, Koa, etc.) is no longer necessary.

For these cases, it's possible to remove the existing `apollo-server-{integrations}` package and add the new version 2.0 of `apollo-server`. If using Express, this can be done by running:

    npm uninstall --save apollo-server-express

    npm install apollo-server graphql

An implementation with this pattern would look like:

```js
const { ApolloServer, gql } = require('apollo-server');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Query {
    announcement: String
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    announcement: () =>
      `Say hello to the new Apollo Server! A production ready GraphQL server with an incredible getting started experience.`
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

## Adding Additional Middleware to Apollo Server 2

For middleware that is collocated with the GraphQL endpoint, Apollo Server 2 allows middleware mounted on the same path before `applyMiddleware` is called. For example, this server runs an authentication middleware before GraphQL execution.

```js
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const app = express();
const path = '/graphql';

const server = new ApolloServer({ typeDefs, resolvers });

//Mount a jwt or other authentication middleware that is run before the GraphQL execution
app.use(path, jwtCheck);

server.applyMiddleware({ app, path });

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
```

## Using an Existing Schema

For many existing instances of Apollo Server, the schema is created at runtime before server startup, using `makeExecutableSchema` or `mergeSchemas`. Apollo Server 2 stays backwards compatible with these more complex schemas, accepting it as the `schema` field in the server constructor options. Additionally, Apollo Server 2 exports all of `graphql-tools`, so `makeExecutableSchema` and other functions can be imported directly from Apollo Server.

```js
const {
  ApolloServer,
  makeExecutableSchema
} = require('apollo-server');

// The `typeDefs` passed into `makeExecutableSchema` are _intentionally_
// passed in without using the `gql` tag since it requires a `String` and
// the `gql` tag returns an AST.  When not using `makeExecutableSchema`
// and passing `typeDefs` into the `ApolloServer` constructor, it's
// recommended to use the `gql` tag.
const typeDefs = `
  type Query {
    hello: String
  }
`;

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
//mergeSchemas can be imported from apollo-server
//const schema = mergeSchemas(...);

const server = new ApolloServer({ schema });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

### Constructing an Executable Schema Manually

While we recommend the use [schema-definition language (SDL)](https://www.apollographql.com/docs/apollo-server/essentials/schema.html#sdl) for defining a GraphQL schema since we feel it's more human-readable and language-agnostic, Apollo Server 2 also supports schemas which are built with the [`graphql-js`'s `graphql/type` notation](https://graphql.org/graphql-js/type/) by passing a `GraphQLSchema` to the `schema` option of the `ApolloServer` constructor.

For example, using this technique the above schema might be represented and used as:

```js
const {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');
const { ApolloServer } = require('apollo-server');

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'hello world';
        }
      }
    }
  })
});

const server = new ApolloServer({ schema });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
```

## Accessing Request Headers

Apollo Server 1 allowed request headers to be used in the construction of the GraphQL options. Apollo Server 2 allows constructor to create the context based upon the request.

```js
//old way
graphqlExpress((req, res) => ({
  schema: myGraphQLSchema,
  context: {
    token: req.headers['auth-token'],
  },
}))

//new way
new ApolloServer({
  schema: myGraphQLSchema,
  context: ({req, res}) => ({
    token: req.headers['auth-token'],
  }),
});
```

## Replacing `logFunction`

Apollo Server 2 removes the `logFunction` to reduce the exposure of internal implementation details. The experimental, non-public `graphql-extensions` provides a more structured and flexible way of instrumenting Apollo Server. An explanation of to do more granular logging, can be found in the [metrics section](/monitoring/metrics/).

## Replacing GraphiQL

Apollo Server 2 ships with GraphQL Playground instead of GraphiQL and collocates the GUI with the endpoint. GraphQL playground can be customized in the following manner.

```js
const { ApolloServer, gql } = require('apollo-server-express');

const server = new ApolloServer({
  // These will be defined for both new or existing servers
  typeDefs,
  resolvers,
  playground: {
    endpoint?: string
    subscriptionEndpoint?: string
    tabs: [
      {
        endpoint: string
        query: string
        variables?: string
        responses?: string[]
        headers?: { [key: string]: string }
      },
    ],
  },
});

server.applyMiddleware({
  app, // app is from an existing express app
});

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
```

Some Apollo Server 1 implementations use a custom version of GraphiQL, which can be added to Apollo Server 2 as a middleware or ported to use the [React version of GraphQL Playground](https://www.npmjs.com/package/graphql-playground-react).
