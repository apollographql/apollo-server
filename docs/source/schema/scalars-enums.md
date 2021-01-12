---
title: Custom scalars
---

The GraphQL specification includes default scalar types `Int`, `Float`, `String`, `Boolean`, and `ID`. Although these scalars cover the majority of use cases, some applications need to support another atomic data type (such as `Date`) or add validation to an existing type. To enable this, you can define custom scalar types.

> For more information about the `graphql` library's type system, see the [official documentation](http://graphql.org/graphql-js/type/).


## Defining a custom scalar

To define a custom scalar, add it to your schema like so:

```graphql
scalar MyCustomScalar
```

Object types in your schema can now contain fields of type `MyCustomScalar`. However, Apollo Server still needs to know how to interact with values of this new scalar type.

## Defining custom scalar logic

After you define a custom scalar type, you need to define how Apollo Server interacts with it. Specifically, Apollo Server needs to know how to transform the scalar's value when sending and receiving it from clients. You define these interactions in an instance of the [`GraphQLScalarType`](http://graphql.org/graphql-js/type/#graphqlscalartype) class.

The following `GraphQLScalarType` object defines placeholder functions for interacting with a custom scalar named `Date`:

```js
const { GraphQLScalarType, Kind } = require('graphql');

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    return value.getTime(); // Transform value returned to client
  },
  parseValue(value) {
    return new Date(value); // Transform JSON value sent by client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return parseInt(ast.value, 10); // Transform AST value to type expected by parseValue
    }
    return null; // Invalid hard-coded value
  },
});
```

This initialization defines the following methods:

* `serialize`
* `parseValue`
* `parseLiteral`

Together, these methods describe how Apollo Server interacts with the scalar in every scenario.

### `serialize`

The `serialize` method converts the scalar's back-end representation to the format expected by the requesting client (this is almost always JSON.)

In the example above, the `Date` scalar is represented on the backend by the `Date` JavaScript object. When we send a `Date` scalar in a GraphQL response, we serialize it as the integer value returned by the [`getTime` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime) of a JavaScript `Date` object.

> Note that Apollo Client cannot automatically interpret custom scalars ([see issue](https://github.com/apollographql/apollo-feature-requests/issues/2)), so your client must define custom logic to deserialize this value as needed.

### `parseValue`

The `parseValue` method converts the scalar's `serialize`d value to its back-end representation.

Apollo Server calls this method when the scalar appears in an incoming query (such as in a field argument).

### `parseLiteral`

When an incoming query string includes a hard-coded value for the scalar, that value is part of the query document's abstract syntax tree (AST). Apollo Server calls the `parseLiteral` method to convert the value's AST representation (which is always a string) to the format expected by the `parseValue` method (the example above expects an integer).

## Providing custom scalars to Apollo Server

After you define your `GraphQLScalarType` instance, you include it in the same [resolver map](../data/resolvers/#defining-a-resolver) that contains resolvers for your schema's other types and fields:

```js
const { ApolloServer, gql } = require('apollo-server');

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

## Custom scalar examples

Let's look at a couple of examples to demonstrate how a custom scalar type can be defined.

### Date as a scalar

The goal is to define a `Date` data type for returning `Date` values from the database. Let's say we're using a MongoDB driver that uses the native JavaScript `Date` data type. The `Date` data type can be easily serialized as a number using the [`getTime()` method](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime). Therefore, we would like our GraphQL server to send and receive `Date`s as numbers when serializing to JSON. This number will be resolved to a `Date` on the server representing the date value. On the client, the user can simply create a new date from the received numeric value.

The following is the implementation of the `Date` data type. First, the schema:

```js
const typeDefs = gql`
  scalar Date

  type MyType {
    created: Date
  }
`
```

Next, the resolver:

```js
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

const resolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
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

### Validations

In this example, we follow the [official GraphQL documentation](http://graphql.org/docs/api-reference-type-system/) for the scalar datatype, which demonstrates how to validate a database field that should only contain odd numbers in GraphQL. First, the schema:

```js
const typeDefs = gql`
  scalar Odd

  type MyType {
    oddValue: Odd
  }
`
```

Next, the resolver:

```js
const { ApolloServer, gql } = require('apollo-server');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

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

Here, we'll take the [graphql-type-json](https://github.com/taion/graphql-type-json) package as an example to demonstrate what can be done. This npm package defines a JSON GraphQL scalar type.

Remark : `GraphQLJSON` is a [`GraphQLScalarType`](http://graphql.org/graphql-js/type/#graphqlscalartype) instance.

Add the `graphql-type-json` package to the project's dependencies :

```shell
$ npm install graphql-type-json
```

In code, require the type defined by in the npm package and use it :

```js
const { ApolloServer, gql } = require('apollo-server');
const GraphQLJSON = require('graphql-type-json');

const schemaString = gql`
  scalar JSON

  type Foo {
    aField: JSON
  }

  type Query {
    foo: Foo
  }
`;

const resolveFunctions = {
  JSON: GraphQLJSON
};

const server = new ApolloServer({ typeDefs: schemaString, resolvers: resolveFunctions });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```
