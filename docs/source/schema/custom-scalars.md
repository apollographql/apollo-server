---
title: Custom scalars
---

The GraphQL specification includes default scalar types `Int`, `Float`, `String`, `Boolean`, and `ID`. Although these scalars cover the majority of use cases, some applications need to support other atomic data types (such as `Date`) or add validation to an existing type. To enable this, you can define custom scalar types.

## Defining a custom scalar

To define a custom scalar, add it to your schema like so:

```graphql
scalar MyCustomScalar
```

You can now use `MyCustomScalar` in your schema anywhere you can use a default scalar (e.g., as the type of an object field, input type field, or argument).

However, Apollo Server still needs to know how to interact with values of this new scalar type.

## Defining custom scalar logic

After you define a custom scalar type, you need to define how Apollo Server interacts with it. In particular, you need to define:

- How the scalar's value is represented in your backend
  - _This is often the representation used by the driver for your backing data store._
- How the value's back-end representation is **serialized** to a JSON-compatible type
- How the JSON-compatible representation is **deserialized** to the back-end representation

You define these interactions in an instance of the [`GraphQLScalarType`](http://graphql.org/graphql-js/type/#graphqlscalartype) class.

> For more information about the `graphql` library's type system, see the [official documentation](http://graphql.org/graphql-js/type/).

## Example: The `Date` scalar

<Disclaimer />

The following `GraphQLScalarType` object defines interactions for a custom scalar that represents a date (this is one of the most commonly implemented custom scalars). It assumes that our backend represents a date with the `Date` JavaScript object.

<MultiCodeBlock>

```ts
import { GraphQLScalarType, Kind } from 'graphql';

const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value: Date) {
    return value.getTime(); // Convert outgoing Date to integer for JSON
  },
  parseValue(value: number) {
    return new Date(value); // Convert incoming integer to Date
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      // Convert hard-coded AST string to integer and then to Date
      return new Date(parseInt(ast.value, 10));
    }
    // Invalid hard-coded value (not an integer)
    return null;
  },
});
```

</MultiCodeBlock>

This initialization defines the following methods:

- `serialize`
- `parseValue`
- `parseLiteral`

Together, these methods describe how Apollo Server interacts with the scalar in every scenario.

### `serialize`

The `serialize` method converts the scalar's back-end representation to a JSON-compatible format so Apollo Server can include it in an operation response.

In the example above, the `Date` scalar is represented on the backend by the `Date` JavaScript object. When we send a `Date` scalar in a GraphQL response, we serialize it as the integer value returned by the [`getTime` function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime) of a JavaScript `Date` object.

> Note that Apollo Client cannot automatically interpret custom scalars ([see issue](https://github.com/apollographql/apollo-feature-requests/issues/2)), so your client must define custom logic to deserialize this value as needed.

### `parseValue`

The `parseValue` method converts the scalar's JSON value to its back-end representation before it's added to a resolver's `args`.

Apollo Server calls this method when the scalar is provided by a client as a [GraphQL variable](https://graphql.org/learn/queries/#variables) for an argument. (When a scalar is provided as a hard-coded argument in the operation string, [`parseLiteral`](#parseliteral) is called instead.)

### `parseLiteral`

When an incoming query string includes the scalar as a hard-coded argument value, that value is part of the query document's abstract syntax tree (AST). Apollo Server calls the `parseLiteral` method to convert the value's AST representation to the scalar's back-end representation.

In [the example above](#example-the-date-scalar), `parseLiteral` converts the AST value from a string to an integer, and _then_ converts from integer to `Date` to match the result of `parseValue`.

## Providing custom scalars to Apollo Server

After you define your `GraphQLScalarType` instance, you include it in the same [resolver map](../data/resolvers/#defining-a-resolver) that contains resolvers for your schema's other types and fields:

<MultiCodeBlock>

```ts {6, 22-25}
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLScalarType, Kind } from 'graphql';

const typeDefs = `#graphql
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
  Date: dateScalar,
  // ...other resolver definitions...
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`🚀 Server listening at: ${url}`);
```

</MultiCodeBlock>

## Example: Restricting integers to odd values

In this example, we create a custom scalar called `Odd` that can only contain odd integers:

<MultiCodeBlock>

```ts title="index.ts"
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLScalarType, Kind, GraphQLError } from 'graphql';

// Basic schema
const typeDefs = `#graphql
  scalar Odd

  type Query {
    # Echoes the provided odd integer
    echoOdd(odd: Odd!): Odd!
  }
`;

// Validation function for checking "oddness"
function oddValue(value: number) {
  if (typeof value === 'number' && Number.isInteger(value) && value % 2 !== 0) {
    return value;
  }
  throw new GraphQLError('Provided value is not an odd integer', {
    extensions: { code: 'BAD_USER_INPUT' },
  });
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
      throw new GraphQLError('Provided value is not an odd integer', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    },
  }),
  Query: {
    echoOdd(_, { odd }) {
      return odd;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`🚀 Server listening at: ${url}`);
```

</MultiCodeBlock>

## Importing a third-party custom scalar

If another library defines a custom scalar, you can import it and use it just like any other symbol.

For example, the [`graphql-type-json`](https://github.com/taion/graphql-type-json) package defines the `GraphQLJSON` object, which is an instance of `GraphQLScalarType`. You can use this object to define a `JSON` scalar that accepts any value that is valid JSON.

First, install the library:

```shell
$ npm install graphql-type-json
```

Then import the `GraphQLJSON` object and add it to the resolver map as usual:

```js
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLJSONObject } from 'graphql-type-json';

const typeDefs = `#graphql
  scalar JSON

  type MyObject {
    myField: JSON
  }

  type Query {
    objects: [MyObject]
  }
`;

const resolvers = {
  JSON: GraphQLJSON,
  // ...other resolvers...
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, { listen: { port: 4000 } });

console.log(`🚀 Server listening at: ${url}`);
```
