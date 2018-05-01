---
title: Resolvers
description: How to fetch data, select from the results, and join types together
---

Resolvers tell GraphQL execution how to fill in data for each field in your query. Resolvers are organized into a one to one mapping to the fields in your GraphQL schema. This section describes how resolvers are written and organized, the default resolver that applies to every field, and the arguments available to resolvers.

### Resolver map

In order to respond to queries, a schema needs to have resolve functions for all fields. This collection of functions is called the "resolver map". This map relates the schema fields and types to a function.

```js
const schema = `
type Book {
  title: String
  author: Author
}

type Author {
  books: [Book]
}

type Query {
  author: Author
}
`;

const resolvers = {
  Query: {
    author(root, args, context, info) {
      return find(authors, { id: args.id });
    },
  },
  Author: {
    books(author) {
      return filter(books, { author: author.name });
    },
  },
};
```

Note that you don't have to put all of your resolvers in one object. Refer to the ["modularizing the schema"](/docs/graphql-tools/generate-schema.html#modularizing) section to learn how to combine multiple resolver maps into one.

### Default resolver

Explicit resolvers are not needed for every type, since Apollo Server provides a [default](https://github.com/graphql/graphql-js/blob/69d90c601ad5a6f49c06b4ebbc8c73d51ef03566/src/execution/execute.js#L1264-L1278) that can perform two actions depending on the contents of `parent`:

1. Return the property from `parent` with the relevant field name
2. Calls a function on `parent` with the relevant field name and provide the remaining resolver parameters as arguments

For the following schema, the `title` field of `Book` would not need a resolver if the result of the `books` resolver provided a list of objects that already contained a `title` field.

```graphql
type Book {
  title: String
}

type Author {
  books: [Book]
}
```

## Resolver Signature

In addition to the parent resolvers' value, resolvers receive a couple more arguments. The full resolver function signature contains four positional arguments: `(parent, args, context, info)` and can return an object or [Promise](https://codeburst.io/javascript-learn-promises-f1eaa00c5461). Once a promise resolves, then the children resolvers will continue executing. This is useful for fetching data from a [backend]().

The resolver parameters generally follow this naming convention and are described in detail:

1. `parent`: The object that contains the result returned from the resolver on the parent field, or, in the case of a top-level `Query` field, the `rootValue` passed from the [server configuration](). This argument enables the nested nature of GraphQL queries.
2. `args`: An object with the arguments passed into the field in the query. For example, if the field was called with `query{ key(arg: "you meant") }`, the `args` object would be: `{ "arg": "you meant" }`.
3. `context`: This is an object shared by all resolvers in a particular query, and is used to contain per-request state, including authentication information, dataloader instances, and anything else that should be taken into account when resolving the query. Read [this section]() for an explanation of when and how to use context.
4. `info`: This argument should only be used in advanced cases, but it contains information about the execution state of the query, including the field name, path to the field from the root, and more. It's only documented in the [GraphQL.js source code](https://github.com/graphql/graphql-js/blob/c82ff68f52722c20f10da69c9e50a030a1f218ae/src/type/definition.js#L489-L500).

In addition to returning GraphQL defined [scalars](), you can return [custom scalars]() for special use cases, such as JSON or big integers.


### `parent` argument

The first argument to every resolver, `parent`, can be a bit confusing at first, but it makes sense when you consider what a GraphQL query looks like:

```graphql
query {
  getAuthor(id: 5){
    name
    posts {
      title
      author {
        name # this will be the same as the name above
      }
    }
  }
}
```

Every GraphQL query is a tree of function calls in the server. So the `obj` contains the result of parent resolver, in this case:

1. `parent` in `Query.getAuthor` will be whatever the server configuration passed for `rootValue`.
2. `parent` in `Author.name` and `Author.posts` will be the result from `getAuthor`, likely an Author object from the backend.
3. `parent` in `Post.title` and `Post.author` will be one item from the `posts` result array.
4. `parent` in `Author.name` is the result from the above `Post.author` call.

Every resolver function is called according to the nesting of the query. To understand this transition from query to resolvers from another perspective, read this [blog post](https://dev-blog.apollodata.com/graphql-explained-5844742f195e#.fq5jjdw7t).

### Result format

Resolvers in GraphQL can return different kinds of results which are treated differently:

1. `null` or `undefined` - this indicates the object could not be found. If your schema says that field is _nullable_, then the result will have a `null` value at that position. If the field is `non-null`, the result will "bubble up" to the nearest nullable field and that result will be set to `null`. This is to ensure that the API consumer never gets a `null` value when they were expecting a result.
2. An array - this is only valid if the schema indicates that the result of a field should be a list. The sub-selection of the query will run once for every item in this array.
3. A promise - resolvers often do asynchronous actions like fetching from a database or backend API, so they can return promises. This can be combined with arrays, so a resolver can return a promise that resolves to an array, or an array of promises, and both are handled correctly.
4. A scalar or object value - a resolver can also return any other kind of value, which doesn't have any special meaning but is simply passed down into any nested resolvers, as described in the next section.

## Material Summary

* The work to service Queries and Mutations is done by resolvers
* resolvers are functions that return the data requested by a query or mutation
  * in the case of a mutation, it will have some side-effects
* resolvers always correspond to a field in type, which can be the Query, Mutation, or a user defined type
  * example on root Query with just functions -> no arguments


* resolver on user defined type
  * resolver for parent is needed since the default would return null
  * this indicates the best practice for resolvers to always stay simple and use the default if possible

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
