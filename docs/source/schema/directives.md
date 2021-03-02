---
title: Directives
sidebar_title: Directives
description: Configure schema types, fields, and arguments
---

A **directive** decorates part of a GraphQL document with additional configuration. Tools like Apollo Server (and [Apollo Client](https://www.apollographql.com/docs/react/local-state/managing-state-with-field-policies/#querying)) can read a GraphQL document's directives and perform custom logic as appropriate.

Directives are preceded by the `@` character, like so:

```graphql{2}
type ExampleType {
  oldField: String @deprecated(reason: "Use `newField`.")
  newField: String
}
```

This example shows the `@deprecated` directive, which is a [default directive](#default-directives) (i.e., it's part of the [GraphQL specification](http://spec.graphql.org/June2018/#sec--deprecated)). It demonstrates the following about directives:

* Directives can take arguments of their own (`reason` in this case).
* Directives appear _after_ the declaration of what they decorate (the `oldField` field in this case)

## Valid locations

Each directive's definition specifies _where_ it can appear in a GraphQL document. For example, here's the GraphQL spec's definition of the `@deprecated` directive:

```graphql
directive @deprecated(
  reason: String = "No longer supported"
) on FIELD_DEFINITION | ENUM_VALUE
```

This indicates that `@deprecated` can decorate either a schema field definition (as shown in the example above) or an enum value definition (as shown here):

```graphql
enum MyEnum {
  OLD_VALUE @deprecated(reason: "Use `NEW_VALUE`.")
  NEW_VALUE
}
```

If `@deprecated` appears elsewhere in a GraphQL schema, it produces an error.

## Default directives

The [GraphQL specification](http://spec.graphql.org/June2018/#sec-Type-System.Directives) defines the following default directives:

| Directive | Description |
|-----------|-------------|
| `@deprecated(reason: String)` | Marks the definition of a field or enum value as deprecated with an optional reason. |
| `@skip(if: Boolean!)` | If `true`, the decorated field or fragment in an operation is _not_ resolved by the GraphQL server. |
| `@include(if: Boolean!)` | If `false`, the decorated field or fragment in an operation is _not_ resolved by the GraphQL server. |

## Custom directives

### Creating

See [Implementing directives](/schema/creating-directives/).

### Using

You can extend Apollo Server with custom schema directives created by you or a third party.

To use a custom directive, pass its associated `SchemaDirectiveVisitor` subclass to Apollo Server via the `schemaDirectives` argument. This object maps the name of a directive (e.g., `upper`) to the class that implements its behavior (e.g., `UpperCaseDirective`).

```js{40-42}
const { ApolloServer, gql, SchemaDirectiveVisitor } = require('apollo-server');
const { defaultFieldResolver } = require('graphql');

// Class definition for an @upper directive
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

// Schema definition (including custom directive)
const typeDefs = gql`
  directive @upper on FIELD_DEFINITION

  type Query {
    hello: String @upper
  }
`;

// Resolvers
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
