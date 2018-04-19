---
title: Queries
description: How to execute, debug, and connect to your Apollo Server
---

## Prerequisites

* What a query looks like essentials/queries
* Query type schema/types
* How resolvers work schema/resolvers

## Implementing Queries in Apollo Server

> (Evans) this section feels very similar to resolvers

Now that we understand the Query type, GraphQL types, and resolvers, we can explain the following code to define our schema and resolvers. This example shows the

```js
const { ApolloServer } = require('apollo-server');

const typeDefs = `
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

## Material to include

* This section ties all of the information in the prereqs to show you how to implement Queries with the Apollo Server
  * esentially copy and paste code that you can then add onto
