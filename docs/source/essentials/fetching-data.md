---
title: Fetching data
---

GraphQL is the best way to work with data from **any** back-end that your product needs. It is not a mapping of your database, but rather a graph of the data sources and shapes your product is made of. Works with multiple data sources (first party or third)

## Context

> TODO: Shorten this up, a lot.

### What is?

The `context` is the third positional argument passed to every resolver. `context` references the same object across all resolvers, so no resolver should modify the contents. Additionally, it is best to ensure that the contents of `context` does not change depending on the particular query or mutation.

The common uses of the `context` are storing [authentication scope](), database connections([mongo](), [postgres](), etc), and custom fetch functions. Additionally when batching requests across different resolvers to avoid the n+1 problem, you will attach your instances of [dataloader](best-practice) to the `context`.


> (Evans) not sure if this idea of a constant context is completely true/a best-practice, expecially if making a connection is costly, so you only start the operation if certain fields are requested

### todo: talk about state?

## How to use?

To provide a `context` to your resolvers, add an object to the Apollo Server constructor. For specific examples, follow the [backend/]() instructions.

```
  const server = new ApolloServer(req => ({
    typeDefs,
    resolvers,
    context: {
      authScope: getScope(req)
    }
  }));

  //resolver
  (parent, _, context) => {
    if(context.authScope !== ADMIN) throw AuthenticationError('not admin');
    ...
  }
```

The context can also be created asynchronous, allowing database connections and other operations to complete.

```
context: async () => ({
  db: await client.connect(),
})

//resolver
(parent, _, context) => {
  return context.db.query('SELECT * FROM table_name');
}
```

## Implementing Queries in Apollo Server

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

## Material Summary

* The context is shared by all resolvers during a single query or mutation
* setup the context on every request
* Great place to store authentication (but this will be covered in authentication)
* database connections
  * mongo
  * postgress
  * fetch functions
* N+1 problem
  * A consideration for dataloader.
* Here's how you add it to Apollo Server
* State
* BEST practice: keep your context code the same regardless of query/mutation that is coming in
