---
title: Custom scalars
---

The GraphQL specification includes default scalar types `Int`, `Float`, `String`, `Boolean`, and `ID`. Although these scalars cover the majority of use cases, some applications need to support other atomic data types (such as `Date`) or add validation to an existing type. To enable this, you can define custom scalar types.

## Defining a custom scalar

To define a custom scalar, add it to your schema like so:

```graphql
scalar MyCustomScalar
```

Object types in your schema can now contain fields of type `MyCustomScalar`. However, Apollo Server still needs to know how to interact with values of this new scalar type.

## Defining custom scalar logic

After you define a custom scalar type, you need to define how Apollo Server interacts with it. In particular, you need to define:

* How the scalar's value is represented in your backend
    * _This is often the representation used by the driver for your backing data store._
* How the value's back-end representation is **serialized** to a JSON-compatible type
* How the JSON-compatible representation is **deserialized** to the back-end representation

You define these interactions in an instance of the [`GraphQLScalarType`](http://graphql.org/graphql-js/type/#graphqlscalartype) class.

> For more information about the `graphql` library's type system, see the [official documentation](http://graphql.org/graphql-js/type/).

## Example: The `Date` scalar

The following `GraphQLScalarType` object defines interactions for a custom scalar that represents a date (this is one of the most commonly implemented custom scalars). It assumes that our backend represents a date with the `Date` JavaScript object.

```js
const { GraphQLScalarType, Kind } = require('graphql');

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10); // Convert hard-coded AST string to type expected by parseValue
    }
    return null; // Invalid hard-coded value (not an integer)
  },
});
```

This initialization defines the following methods:

* `serialize`
* `parseValue`
* `parseLiteral`

Together, these methods describe how Apollo Server interacts with the scalar in every scenario.

### `serialize`

The `serialize` method converts the scalar's back-end representation to a JSON-compatible format so Apollo Server can include it in an operation response.

In the example above, the `Date` scalar is represented on the backend by the `Date` JavaScript object. When we send a `Date` scalar in a GraphQL response, we serialize it as the integer value returned by the [`getTime` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime) of a JavaScript `Date` object.

> Note that Apollo Client cannot automatically interpret custom scalars ([see issue](https://github.com/apollographql/apollo-feature-requests/issues/2)), so your client must define custom logic to deserialize this value as needed.

### `parseValue`

The `parseValue` method converts the scalar's `serialize`d JSON value to its back-end representation.

Apollo Server calls this method when the scalar appears in an incoming query (such as in a field argument).

### `parseLiteral`

When an incoming query string includes a hard-coded value for the scalar, that value is part of the query document's abstract syntax tree (AST). Apollo Server calls the `parseLiteral` method to convert the value's AST representation (which is always a string) to the JSON-compatible format expected by the `parseValue` method (the example above expects an integer).

## Providing custom scalars to Apollo Server

After you define your `GraphQLScalarType` instance, you include it in the same [resolver map](../data/resolvers/#defining-a-resolver) that contains resolvers for your schema's other types and fields:

```js{21-24}
const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType, Kind } = require('graphql');

const typeDefs = gql`
  scalar Date

  type Event {
    id: ID!
    date: Date!
  }

  type Query {
    events: [Event!]
  }
`;

const dateScalar = new GraphQLScalarType({
  // See definition above
});

const resolvers = {
  Date: dateScalar
  // ...other resolver definitions...
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});
```

## Example: Restricting integers to odd values

In this example, we create a custom scalar called `Odd` that can only contain odd integers:

```js{20-31}
const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

// Basic schema
const typeDefs = gql`
  scalar Odd

  type MyType {
    oddValue: Odd
  }
`;

// Validation function
function oddValue(value) {
  return value % 2 === 1 ? value : null;
}

const resolvers = {
  Odd: new GraphQLScalarType({
    name: 'Odd',
    description: 'Odd custom scalar type',
    parseValue: oddValue,
    serialize: oddValue,
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return oddValue(parseInt(ast.value, 10));
      }
      return null;
    },
  }),
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

## Importing a third-party custom scalar

If another library defines a custom scalar, you can import it and use it just like any other symbol.

For example, the [`graphql-type-json`](https://github.com/taion/graphql-type-json) package defines the `GraphQLJSON` object, which is an instance of `GraphQLScalarType`. You can use this object to define a `JSON` scalar that accepts any value that is valid JSON.

First, install the library:

```shell
$ npm install graphql-type-json
```

Then `require` the `GraphQLJSON` object and add it to the resolver map as usual:

```js
const { ApolloServer, gql } = require('apollo-server');
const GraphQLJSON = require('graphql-type-json');

const typeDefs = gql`
  scalar JSON

  type MyObject {
    myField: JSON
  }

  type Query {
    objects: [MyObject]
  }
`;

const resolvers = {
  JSON: GraphQLJSON
  // ...other resolvers...
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```
