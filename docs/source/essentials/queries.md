---
title: Queries
---

## Prerequisites

* A basic understanding of a GraphQL schema ([Schema]())
## Prerequisites

## Overview

A GraphQL query is for reading data.  The schema defines the types of queries which are available to the clients connecting to your server.

## Material

* GraphQL query defines the shape of data that will be returned by a particular request
  * This is what an author + books query looks like coming from the client
  * make sure it has arguments
* This query is then checked again the server's schema
  * looks like this:
* "root" level queries define the main entry points
* Each of those root queries returns a type
* You have to have a query
* It's an entry point like all rest endpoints
* It's how you fetch data

**Actually writing resolvers for your queries is found in server/queries**

> TODO: The below headings were left over from the other document.  Do we want to remove them?

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
  * essentially copy and paste code that you can then add onto
