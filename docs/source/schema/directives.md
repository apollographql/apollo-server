---
title: Using schema directives
description: Using schema directives to transform schema types, fields, and arguments
---

A _directive_ is an identifier preceded by a `@` character, optionally followed by a list of named arguments, which can appear after almost any form of syntax in the GraphQL query or schema languages. Here's an example from the [GraphQL draft specification](http://facebook.github.io/graphql/draft/#sec-Type-System.Directives) that illustrates several of these possibilities:

```typescript
directive @deprecated(
  reason: String = "No longer supported"
) on FIELD_DEFINITION | ENUM_VALUE

type ExampleType {
  newField: String
  oldField: String @deprecated(reason: "Use `newField`.")
}
```

As you can see, the usage of `@deprecated(reason: ...)` _follows_ the field that it pertains to (`oldField`), though the syntax might remind you of "decorators" in other languages, which usually appear on the line above. Directives are typically _declared_ once, using the `directive @deprecated ... on ...` syntax, and then _used_ zero or more times throughout the schema document, using the `@deprecated(reason: ...)` syntax.

## Default Directives

GraphQL provides several default directives: [`@deprecated`](http://facebook.github.io/graphql/draft/#sec--deprecated), [`@skip`](http://facebook.github.io/graphql/draft/#sec--skip), and [`@include`](http://facebook.github.io/graphql/draft/#sec--include).

  * [`@deprecated`](http://facebook.github.io/graphql/draft/#sec--deprecated)`(reason: String)` - marks field as deprecated with message
  * [`@skip`](http://facebook.github.io/graphql/draft/#sec--skip)`(if: Boolean!)` - GraphQL execution skips the field if true by not calling the resolver
  * [`@include`](http://facebook.github.io/graphql/draft/#sec--include)`(if: Boolean!)` - Calls resolver for annotated field if true

## Using custom schema directives

To use a custom schema directive, pass the implemented class to Apollo Server via the `schemaDirectives` argument, which is an object that maps directive names to directive implementations:

```js
const { ApolloServer, gql, SchemaDirectiveVisitor } = require('apollo-server');
const { defaultFieldResolver } = require('graphql');

// Create (or import) a custom schema directive
class UpperCaseDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    field.resolve = async function (...args) {
      const result = await resolve.apply(this, args);
      if (typeof result === 'string') {
        return result.toUpperCase();
      }
      return result;
    };
  }
}

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  directive @upper on FIELD_DEFINITION

  type Query {
    hello: String @upper
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    hello: (parent, args, context) => {
      return 'Hello world!';
    },
  },
};

// Add directive to the ApolloServer constructor
const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    upper: UpperCaseDirective,
  }
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});

```

The implementation of `UpperCaseDirective` takes care of changing the resolver and modifying the schema if necessary.

## Building your own

To learn how to implement your own schema directives, read [this guide](/schema/creating-directives/).
