---
title: Fetching data with resolvers
---

## Overview

GraphQL is the best way to work with data from **any** back-end that your product needs. It is not a mapping of your database, but rather a graph of the data sources and shapes your product is made of. Resolvers are the key to this graph. Each resolver represents a single field, and can be used to fetch data from any source(s) you may have.

## Context

The context is how you access your shared connections and fetchers in resolvers to get data.

The `context` is the third argument passed to every resolver. It is useful for passing things that any resolver may need, like [authentication scope](), database connections([mongo](), [postgres](), etc), and custom fetch functions. Additionally, if you're using [dataloaders to batch requests](../best-practices/performance.html#Batching-data-lookups)  across resolvers, you can attach them to the `context` as well.

As a best practice, `context` should be the same for all resolvers, no matter the particular query or mutation, and resolvers should never modify it. This ensures consistency across resolvers, and helps increase development velocity.

> (Evans) not sure if this idea of a constant context is completely true/a best-practice, expecially if making a connection is costly, so you only start the operation if certain fields are requested

### How to use it

To provide a `context` to your resolvers, add a `context` object to the Apollo Server constructor. This constructor gets called with every request, so you can set the context based off the details of the request (like HTTP headers).

For specific examples, follow the [backend]() instructions.

```
const server = new ApolloServer(req => ({
  typeDefs,
  resolvers,
  context: {
    authScope: getScope(req.headers.authorization)
  }
}));

// resolver
(parent, _, context) => {
  if(context.authScope !== ADMIN) throw AuthenticationError('not admin');
  ...
}
```

The context can also be created asynchronously, allowing database connections and other operations to complete.

```
context: async () => ({
  db: await client.connect(),
})

// resolver
(parent, _, context) => {
  return context.db.query('SELECT * FROM table_name');
}
```

## Implementing Queries in Apollo Server

Now that we understand the Query type, GraphQL types, and resolvers, we can explain the following code to define our schema and resolvers. This example shows the

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Process {
    params: [String]
    program: String
  }

  type Query {
    process: Process
    argv: [String]
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Process: {
    params: (parent) => parent.argv.slice(1)
    program: (parent) => parent.argv[0]
    url: (_,_,context) => context.req.baseUrl
  }

  Query: {
    process: () => process
    argv: () => process.argv
  },
};

new ApolloServer({ typeDefs, resolvers, context: { req } })
  .listen()
  .then(({ url }) => {
    console.log(`Visit ${url} to run queries!`);
  });
```

## Material Summary

- [x] The context is shared by all resolvers during a single query or mutation
- [x] setup the context on every request
- [x] Great place to store authentication (but this will be covered in authentication)
- [ ] database connections
  - [ ] mongo
  - [ ] postgress
  - [ ] fetch functions
- [x] N+1 problem
  - [x] A consideration for dataloader.
- [x] Here's how you add it to Apollo Server
- [ ] State
- [x] BEST practice: keep your context code the same regardless of query/mutation that is coming in
