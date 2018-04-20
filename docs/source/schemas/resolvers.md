---
title: Resolvers
description: How to fetch data, select from the results, and join types together
---

> (Evans) If we decide that schema/types should be API reference, then this should be in the essentials section.

## Prerequisites

* understand Query and Mutation types
* what query/mutation looks like coming from the client
  * selection set? > understand it means the data requested by a client query/mutation
*

## Servicing Requests

Now that we understand the structure of Queries and Mutations, we need to understand how to service those requests.  Queries and mutations define the data they require, so the servicing of the operations uses this structure to organize the servers work. Every field in a GraphQL schema has a corresponding resolver. When a query or mutation requests a field, then the fields resolver is called and the returned value is placed under the field in the server response.

### Basic Resolver

With the following schema, a client could request `query { key }`.

```graphql
type Query {
  key: String
}
```

In order to service this request, we would provide the following resolvers, which enable to server to respond with `{ data: { key: 'major' } }`.

```js
resolvers = {
  Query: {
    key:() => 'major'
  }
}
```

### Nested Types and Resolvers

In addition to returning scalar types, such as Strings, Queries can request nested objects with different types. An example of a nested query would be:

```graphql
query {
  parent {
    child
  }
}

//Start schema
type Parent {
  child: String
}

type Query {
  parent: Parent
}
```

Following the previous example, a first implementation of these resolvers might be:

https://launchpad.graphql.com/lk308wpxnq
```js
resolvers = {
  Query: {
    parent: () => ({})
  }

  Parent: {
    child: () => 'son'
  }
}
```

These resolvers can be simplified taking advantage of two features: parameters provided to every resolver and the implicit resolvers implemented by all GraphQL frameworks. The first parameter to each resolver is the result of their parent resolver, following the query's structure. In this case, `child`'s resolver will receive the result of `parent`'s resolver. In addition, when no resolver is provided, the default function returns the field name's value from the parent resolvers' result.

```js
resolvers = {
  Query: {
    parent: () => ({child: 'son'})
  }

  // Implicitly provided by the framework:
  // Parent: {
  //   child: (parent) => parent.child
  // }
}
```

You'll notice how this implementation makes your resolvers more simple. In practice, you should fetch data in parent resolvers when retrieval is cheap. For more complicated cases where some fields are more expensive to request, read [this section on performance]() to learn how to optimize your data fetching.

### Resolver Signature

In addition to the parent resolvers' value, resolvers receive a couple more arguments. The full resolver function signature contains four positional arguments: `(parent, args, context, info)` and can return an object or [Promise](https://codeburst.io/javascript-learn-promises-f1eaa00c5461). Once a promise resolves, then the children resolvers will continue executing. This is useful for fetching data from a [backend]().

The resolver parameters generally follow this naming convention and are described in detail:

1. `parent`: The object that contains the result returned from the resolver on the parent field, or, in the case of a top-level `Query` field, the `rootValue` passed from the [server configuration](/docs/apollo-server/setup.html). This argument enables the nested nature of GraphQL queries.
2. `args`: An object with the arguments passed into the field in the query. For example, if the field was called with `query{ key(arg: "you meant") }`, the `args` object would be: `{ "arg": "you meant" }`.
3. `context`: This is an object shared by all resolvers in a particular query, and is used to contain per-request state, including authentication information, dataloader instances, and anything else that should be taken into account when resolving the query. Read [this section]() for an explanation of when and how to use context.
4. `info`: This argument should only be used in advanced cases, but it contains information about the execution state of the query, including the field name, path to the field from the root, and more. It's only documented in the [GraphQL.js source code](https://github.com/graphql/graphql-js/blob/c82ff68f52722c20f10da69c9e50a030a1f218ae/src/type/definition.js#L489-L500).

In addition to returning GraphQL defined [scalars](), you can return [custom scalars]() for special use cases, such as JSON or big integers.

## Material Summary

* The work to service Queries and Mutations is done by resolvers
* resolvers are functions that return the data requested by a query or mutation
  * in the case of a mutation, it will have some side-effects
* resolvers always correspond to a field in type, which can be the Query, Mutation, or a user defined type
  * example on root Query with just functions -> no arguments


* resolver on user defined type
  * resolver for parent is needed since the default would return null
  * this indicates the best practice for resolvers to al

* The resolver function signature is `(parent, args, context, info)`
  * parent contains the data returned by parent field's resolver
  * client query with parent and child labeled
  * default resolver returns parent['field-name']
    * for fields of the Query type, parent is null
  * args come from the query arguments access them, like so:

* BEST PRACTICE warning: The option to define a resolver for the parent or child resolver is a "solved" question
  * use the parent and allow the default resolvers to run for children
  * follows the waterfall of resolver execution and does not skip intermediate steps as in the first parent child example

* Mention that resolvers support promises.
  * child resolvers will not run until parent is resolved
* Mention that resolvers can also be custom scalar implementations.
  * point at advanced/custom-scalars