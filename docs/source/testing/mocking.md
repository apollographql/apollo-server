---
title: Mocking
description: Mock your GraphQL data based on a schema.
---

Mocking enables Apollo Server to return simulated data for GraphQL operations based on your server's schema. The strongly-typed nature of a GraphQL API lends itself to mocking, which is an important part of a GraphQL-first development process.

Mocking enables frontend developers to build out and test UI components and features without needing to wait for a full backend implementation. Mocking is also valuable when using a UI tool like [Storybook](https://storybook.js.org/), because you don't need to start a real GraphQL server.

## Using default mocks

You can turn on Apollo Server's default mocking logic by passing `mocks: true` to the ApolloServer constructor:

```js{11}
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

Mocking logic looks at the type returned by each schema field and returns a default value for that type.

The table below covers the default scalar types and the default mocked values returned for each type:

<table class="field-table">
  <thead>
    <tr>
      <th>Type</th>
      <th>Default Mock Value</th>
    </tr>
  </thead>

<tbody>
<tr >
<td>

##### `Int`

</td>
<td>

Returns a random positive or negative integer.
</td>
</tr>


<tr>
<td>

##### `String`

</td>
<td>

Returns "Hello world".
</td>
</tr>


<tr>
<td>

##### `Float`

</td>
<td>

Returns a random positive or negative double-precision floating-point value.
</td>
</tr>


<tr>
<td>

##### `Boolean`

</td>
<td>

Randomly returns either `true` or `false`.
</td>
</tr>


<tr>
<td>

##### `ID`

</td>
<td>

Returns a randomized UUID containing a combination of integers and letters.
</td>
</tr>

</tbody>
</table>

By default when using mocks, your existing resolvers are **ignored** in favor of `mocks`. To configure this behavior, see [Using existing resolvers with mocks](#using-existing-resolvers-with-mocks).

>Note: If `typeDefs` has any [custom scalar types](../schema/custom-scalars/#providing-custom-scalars-to-apollo-server), you will need to specify what your server should return for those types. You can do this by creating a customized mock with resolvers for each custom scalar type, as described below.

## Customizing mocks

For more sophisticated testing, you can customize your mocks to return user-specified data.

Instead of providing a boolean to the `mocks` option, you can provide an object that defines custom mocking logic. This enables you to specify values to return for different return types.

By default, the functions in `mocks` will take precedence over any currently defined resolvers. In the below example, both `hello` and `resolved` return `Hello`.

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

You can also use `mocks` to define object types and the fields belonging to those object types (much like a [resolver map](../data/resolvers/#base-syntax)).

In the below example, note that our mocked `Person` object calls a function returning an object with fields pointing at _other_ functions:

```js
// importing the casual library
const casual = require('casual');

const mocks = {
  Person: () => ({
    name: casual.name,
    age: () => casual.integer(0, 120),
  }),
};
```

The previous example uses [casual](https://github.com/boo1ean/casual), a fake data generator for JavaScript which returns a different result every time the function is called. In other scenarios, such as testing, a collection of fake objects or a generator that always uses a consistent seed are often necessary to provide consistent data.

### Using lists in mocks

To automate mocking a list, return an array of the desired length. Using `[...new Array(n)]` is convenient syntax for creating an array that contains *n* copies of `undefined`.

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

The default behavior for mocks is to overwrite the resolvers already present in the schema. To use your server's existing resolvers while mocking, set the `mockEntireSchema` option to `false`.

> Note: Mocking resolvers doesn't work if the `mocks` option is `false`, even if `mockEntireSchema` is true.

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

Running the above example with the `mockEntireSchema` option set to false, the `resolved` field now returns the string `Resolved`.

## Mocking a schema using introspection

The GraphQL specification allows clients to introspect the schema with a [special set of types and fields](http://spec.graphql.org/October2021/#sec-Introspection) that every schema must include. The results of a [standard introspection query](https://github.com/graphql/graphql-js/blob/main/src/utilities/getIntrospectionQuery.ts) can be used to generate an instance of `GraphQLSchema` that can be mocked as explained above.

This helps when you need to mock a schema defined in a language besides JavaScript.

To convert an [introspection query](https://github.com/graphql/graphql-js/blob/main/src/utilities/getIntrospectionQuery.ts) result to a `GraphQLSchema` object, you can use the `buildClientSchema` utility from the `graphql` package.

```js
const { buildClientSchema } = require('graphql');
const introspectionResult = require('schema.json');
const { ApolloServer } = require('apollo-server');

const schema = buildClientSchema(introspectionResult.data);  // highlight-line

const server = new ApolloServer({
  schema,
  mocks: true,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

## API

Under the hood, Apollo Server's mocking functionality is provided by the function [`addMocksToSchema`](https://www.graphql-tools.com/docs/mocking/) from the `@graphql-tools/mock` package. The `mocks` object is passed directly to the `addMocksToSchema` function, and `preserveResolvers` is the inverse of `mockEntireSchema`.

Apollo Server does not support all of the arguments to `addMocksToSchema`, such as `resolvers`. If you'd like to use the features of `@graphql-tools/mock` that aren't supported by Apollo Server, you can install and use `@graphql-tools/mock` directly:

```js
const { addMocksToSchema } = require('@graphql-tools/mock')
const { makeExecutableSchema } = require('@graphql-tools/schema');

const server = new ApolloServer({
  schema: addMocksToSchema({
    schema: makeExecutableSchema({ typeDefs, resolvers }),
  }),
});
```
