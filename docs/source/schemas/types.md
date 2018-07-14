---
title: Schema types
description: How to write your types, expose your data, and keep it all working great
---

GraphQL is a strongly typed language and the concept of "types" is a fundamental part of GraphQL.  Types define the capabilities of a GraphQL server and allow GraphQL operations to be validated.

While in the most basic sense, you could have a GraphQL server return a single, scalar type, combining these types provides the ability to build GraphQL servers of varying complexities.

## Core scalar types

Scalar types represent the leaves of an operation and alway resolve to concrete data. The default, scalar types which GraphQL offers are:

* `Int`: Signed 32‐bit integer
* `Float`: Signed double-precision floating-point value
* `String`: UTF‐8 character sequence
* `Boolean`: true or false
* `ID` (serialized as `String`): A unique identifier, often used to refetch an object or as the key for a cache. While serialized as a String, ID signifies that it is not intended to be human‐readable

These primitive types cover a majority of use cases. For other use cases, we can create [custom scalar types](../features/scalars-enums.html).

## Object types

The object type is the most common type used in a schema and represents a group of fields. Each field inside of an object type maps to another type, allowing nested types and circular references.

```graphql
type TypeName {
  fieldA: String
  fieldB: Boolean
  fieldC: Int
  fieldD: CustomType
}

type CustomType {
  circular: TypeName
}
```

### `Query` type

The `Query` type defines the entry points into Apollo server for fetching data. Since all requests must use one of the Query's fields, the Query serves as the organization point for defining how to access to other fields. It can be referred to as the root query type. This schema is an example of a server that can return a todo list for given user.

```graphql
type Query {
  todos(user: ID): [String]
}
```

To write your first Query go [here]().

### `Mutation` type

The `Mutation` type or root mutation type defines the entry points into Apollo server for modifying server data. Similar to the `Query`, the root mutation type serves as the organization point for all requests designed to modify the server's data.

```graphql
type Response {
  success: Boolean
  error: Error
  newTodo: String
}

type Query {
  addTodo(user: ID, todo: String): Response
}
```

To implement your first mutation, follow the [... guide]().

### `Subscription` type

The `Subscription` type defines entry points into Apollo server for the advanced use case of listening to events over a persistent connection. For more information, see the subscription section.

## Enum type

The `Enum` type are a special type of scalar that is restricted to a set of values.

```graphql
enum Genre {
  MYSTERY
  SIFI
  FANTASY
}
```

In Apollo server, a resolver that returns an enum can use the direct string representation.

```js
const schema = gql`
type Query {
  genre: Genre
}
`;

const resolvers = {
  Query: {
    genre: () => 'MYSTERY'
  }
}
```

## List type modifier

Lists are defined with as type modifier that wraps object types, scalars, and enums. This signals to Apollo server that the resolver should return an array of the wrapped type. In this example `todos` is expected to return a list of strings.

```js
const schema = gql`
type Query {
  todos: [String]
}
`;

const resolvers = {
  Query: {
    todos: () => ['reduce', 'reuse', 'gc']
  }
}
```

## Non-nullable types

By default, each of the core scalar types can also be null. That is to say, they can either return a value of the specified type or they can have no value. This default provides the maximum flexibility for schema changes and enables the errors to be returned at the finest granularity. The only time to make a field non-null is if an object cannot exist without the field.

To override this default and specify that a type _must_ be defined, an exclamation mark (`!`) can be appended to a type to ensure the presence of the value in return results.  For example, a `String` which could not be missing a value would be identified as `String!`. If the resolver for a non-nullable field throws an error, then the error is propagated up to the parents on the resolver chain until either the root field or a nullable field is reached.

Using the exclamation mark to declare a field as non-nullable simplifies the contract with the client, since clients will not have to check to see whether a field contains a value or not. However marking fields as non-nullable means that the field will always be a part of that type, which make it impossible to deprecate from an active schema. Removing a nullability check from a field makes a field optional. Existing client code would need to be made aware of this new requirement, and adjust their logic accordingly.

## Union type

The `Union` type indicates that a field can return more than one object type, but doesn't define specific fields itself.  Therefore, a query being made on a field which is union-typed must specify the object types containing the fields it wants.

```graphql
union Result = Book | Author

type Query {
  search: [Result]
}
```

The query for these result would appear:

```graphql
{
  search(contains: "") {
    ... on Book {
			title
    }
    ... on Author {
      name
    }
  }
}
```


