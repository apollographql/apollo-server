---
title: Using Context
description: How to use context to make your app faster, easier to test, and contained
---

> (Evans) With resolvers folded into essentials, I could see this section split between essentials/resolvers and server/secrets or server/connections or backends/general

## What is?

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
