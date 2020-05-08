---
title: Value types
description: Define the exact same type in multiple services
---

A natural overlap among identical types between services is not uncommon. Rather than having a single service "own" those types, all services that use them are expected to share ownership. This form of type "duplication" across services is supported for Scalars, Objects, Interfaces, Enums, Unions, and Inputs. The rule of thumb for any of these value types is that the types **must be identical** in name and contents.

## Objects, Interfaces, and Inputs
For types with field definitions, all fields _and their types_ must be identical.

## Scalars
For Scalar values, it's important that services **share the same serialization and parsing logic**, since there is no way to validate that logic from the schema level by federation tooling.

## Enums
For Enum types, all values must match across services. **Even if a service doesn't use all values in an Enum, they still must be defined in the schema**. Failure to include all enum values in all services that use the Enum will result in a validation error when building the federated schema.

## Unions
Union types must share the same types in the union, even if not all types are used by a service.

In the following example, the Product and User services both use the same `ProductCategory` enum, `Date` scalar, `Error` type, and `ProductOrError` union.

```graphql
# Product Service
scalar Date

union ProductOrError = Product | Error

type Error {
  code: Int!
  message: String!
}

type Product @key(fields: "sku"){
  sku: ID!
  category: ProductCategory
  dateCreated: Date
}

enum ProductCategory {
  FURNITURE
  BOOK
  DIGITAL_DOWNLOAD
}

# User Service
scalar Date

union ProductOrError = Product | Error

type Error {
  code: Int!
  message: String!
}

type User @key(fields: "id"){
  id: ID!
  dateCreated: Date
  favoriteCategory: ProductCategory
  favoriteProducts: [Product!]
}

enum ProductCategory {
  FURNITURE
  BOOK
  DIGITAL_DOWNLOAD
}

extend type Product @key(fields: "sku"){
  sku: ID! @external
}
```
