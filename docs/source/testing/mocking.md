---
title: Mocking
description: Mock your GraphQL data based on a schema.
---

Mocking allows Apollo Server to return simulated data for GraphQL operations based on your server's schema. The strongly-typed nature of a GraphQL API lends itself extremely well to mocking, which is an important part of a GraphQL-first development process.  

Reliable mocking enables frontend developers to build out and test UI components and features without having to wait for a full backend implementation. Mocking is also valuable when using a tool like [Storybook](https://storybook.js.org/) because you don't need to start a real GraphQL server.

## Using the default mocks

You can turn on `apollo-server`'s default mocking logic by adding the `mocks` option in the configuration of a new `ApolloServer` instance and setting it to `true` . 

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const server = new ApolloServer({
  typeDefs,
  mocks: true,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

> Note: If `typeDefs` has any custom scalar types, your `resolvers` must still contain the `serialize`, `parseValue`, and `parseLiteral` functions for each of those custom scalars.

Mocking logic looks at the types expected by your schema's fields and returns values based on those types. For example, mocking will return a string where a string is expected, a number for a Int, etc. The shape of your mocked results should always be consistent with the shape of a real result from a successful GraphQL operation.

When using mocks your existing resolvers are ignored by default. See the ["Using existing resolvers with mocks"](#using-existing-resolvers-with-mocks) section below to see how to change this behavior.

For more sophisticated testing, mocks can be further customized to return user-specified data.

## Customizing mocks

In addition to a boolean, `mocks` can be an object describing custom mocking logic, returning specific values for specific field types (much like a resolver map).

Namely `mocks` accepts functions for specific types in the schema that are called when that type is expected. By default, the functions in `mocks` will overwrite the resolvers in `resolvers`. In this example `hello` and `resolved` will both return `'Hello'`.

```js{16-20}
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    hello: String
    resolved: String
  }
`;

const resolvers = {
  Query: {
    resolved: () => 'Resolved',
  },
};

const mocks = {
  Int: () => 6,
  Float: () => 22.1,
  String: () => 'Hello',
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  mocks,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

Similarly to `resolvers`, `mocks` allows you to define object types, along with functions the fields of those object types should return. Take note that the value corresponding to `Person` is a function that returns an object that contains fields pointing at more functions:

```js
// importing in the casual library for use in our mocks
const casual = require('casual');

const mocks = {
  Person: () => ({
    name: casual.name,
    age: () => casual.integer(0, 120),
  }),
};
```

The previous example uses [casual](https://github.com/boo1ean/casual), a fake data generator for JavaScript, which returns a different result every time the field is called. In other scenarios, such as testing, a collection of fake objects or a generator that always uses a consistent seed are often necessary to provide consistent data.

### Using lists in mocks

To automate mocking a list, return an array of the desired length. `[...new Array(n)]` is a convenient syntax for making an array containing *n* copies of `undefined`.

```js
const casual = require('casual');

const mocks = {
  Person: () => ({
    // a list of length between 2 and 6, using the "casual" npm module
    // to generate a random integer
    friends: [...new Array(casual.integer(2, 6))],
    // a list of three lists of two items: [[1, 1], [2, 2], [3, 3]]
    listOfLists: () => [...new Array(3)].map((i) => [...new Array(2)]),
  }),
};
```
### Using existing resolvers with mocks

The default behavior for mocks is to overwrite the resolvers already present in the schema. To keep the existing resolvers, set the `mockEntireSchema` option to false.

> Note: mocking resolvers will not work if the `mocks` option is `false`, even if `mockEntireSchema` is true.

```js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    hello: String
    resolved: String
  }
`;

const resolvers = {
  Query: {
    resolved: () => 'Resolved',
  },
};

const mocks = {
  Int: () => 6,
  Float: () => 22.1,
  String: () => 'Hello',
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  mocks,
  mockEntireSchema: false, // highlight-line
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

## Mocking a schema using introspection

The GraphQL specification allows clients to introspect the schema with a [special set of types and fields](http://spec.graphql.org/October2021/#sec-Introspection) that every schema must include. The results of a [standard introspection query](https://github.com/graphql/graphql-js/blob/main/src/utilities/getIntrospectionQuery.ts) can be used to generate an instance of GraphQLSchema which can be mocked as explained above.

This helps when you need to mock a schema defined in a language other than JS, for example Go, Ruby, or Python.

To convert an [introspection query](https://github.com/graphql/graphql-js/blob/main/src/utilities/getIntrospectionQuery.ts) result to a `GraphQLSchema` object, you can use the `buildClientSchema` utility from the `graphql` package.

```js
const { buildClientSchema } = require('graphql');
const introspectionResult = require('schema.json');
const { ApolloServer } = require('apollo-server');

const schema = buildClientSchema(introspectionResult.data);

const server = new ApolloServer({
  schema,
  mocks: true,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

## API

Under the hood, Apollo Server's mocking functionality is provided by the function [`addMocksToSchema`](https://www.graphql-tools.com/docs/mocking/) from the `@graphql-tools/mock` package. The `mocks` object is passed directly to the function, and `preserveResolvers` is the inverse of `mockEntireSchema`.

Apollo Server does not support all of the arguments to `addMocksToSchema`, such as `resolvers`. If you'd like to use features of `@graphql-tools/mock` that aren't supported by Apollo Server, you can use `@graphql-tools/mock` directly:

```js
const { addMocksToSchema } = require('@graphql-tools/mock')
const { makeExecutableSchema } = require('@graphql-tools/schema');

const server = new ApolloServer({
  schema: addMocksToSchema({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
  }),
});
```
