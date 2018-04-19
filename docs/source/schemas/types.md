---
title: Schema Types
description: How to write your types, expose your data, and keep it all working great
---

> (Jesse) I am proposing that types should be explained before queries, since a query is a type.
> (Evans) This could possibly be just a reference section, especially if the essentials section gives just enough info for someone to start writing resolvers. Honestly The only type necessary to start is String ;)

## Overview

GraphQL is a strongly typed language and the concept of "types" is a fundamental part of GraphQL.  Types define the capabilities of a GraphQL server and allow GraphQL operations to be easily validated.

While in the most basic sence, you could have a GraphQL server return a single, scalar type, combining these types provides the ability to build GraphQL servers of varying complexities.

## Core scalar types

The default, scalar types which GraphQL offers are:

* `Int`
* `Float`
* `String`
* `Boolean`
* `ID` (a special type of `String`)

These primitive types

## Object types

The object type is the most common type used in a schema and represents a group of fields.  In turn, each field maps to another type, allowing nested types and circular references in a schema design.

```graphql
type Query {
  fieldA: String
  fieldB: Boolean
  fieldC: Int
}
```

## Non-nullable types

By default, each of the core scalar types can also be null.  That is to say, they can either return a value of the specified type or they can have no value.

In order to specify that a type _must_ be defined, an exclamation mark (`!`) can be appended to a type to ensure the presence of the value in return results.  For example, a `String` which could not be missing a value would be identified as `String!`.

By using the exclamation mark to declare a field as non-nullable, the contract with the client can be simplified since clients will not have to check to see whether a field contains a value or not.

On the other hand, marking fields as non-nullable might make it more difficult to iterate into a schema which makes a field optional, since existing client code would need to be made aware of this new requirement, and adjust their logic accordingly.

## Union type

The `Union` type indicates that a field can return more than one object type, but doesn't define specific fields itself.  Therefore, a query being made on a field which is union-typed must specify the object types containing the fields it wants.

## Enum type

The `Enum` type


## `Query` type

The `Query` type is a special object type used to organize other fields.

* special type to define entry points to server to get data
* often called the root query type
* How to add arguments
* backed by a resolver, which is a function that provides the data requested by a query
* essential/queries for info on what queries look like from client/on server
* server/queries for details to implement them

## `Mutation` type

* special type to define operations to change server data
* backed by a resolver that performs the backend modification
* look at essentials/mutations for mutation shape from client and appearance on server
* server/mutations for implementation information

## `Subscription` type

* special type to define operations that listen to events
* disclaimer that you'll want to setup your server with queries and mutations before adding in subscriptions
* backed by a resolver that calls `subscribe` or something 🤷‍♂️
* look at advanced/subscriptions for mutation shape from client and appearance on server and implementation information

For more information, see the subscription section


## Custom scalar types

The core types provide functionality for most of the common cases an application will have, but it's also possible to define custom types.

For more information, see the advanced section on [custom scalar types]().

