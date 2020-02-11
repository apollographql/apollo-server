---
title: Working with entities
description: Reference types across services
---

In Apollo Federation, an **entity** is a type that you define canonically in _one_ implementing service and then reference and extend in _other_ implementing services. Entities are the core building block of a federated graph.

## Declaring an entity

In a GraphQL schema, you can designate an object type as an entity by adding a `@key` directive to its definition, like so:

```graphql{1}:title=products
type Product @key(fields: "upc") {
  upc: String!
  name: String!
  price: Int
}
```

The `@key` directive declares the entity's **primary key**, which consists of one or more of the type's `fields`. In the example above, the `Product` entity's primary key is its `upc` field. The Apollo query planner uses an entity's primary key to identify a given instance of the type.

> Apollo Federation supports [defining _multiple_ primary keys for an entity](./advanced-features/#multiple-primary-keys), along with [primary keys that consist of multiple fields](./advanced-features/#compound-and-nested-keys).

## Referencing an entity from another service

After you define an entity in one implementing service, other implementing services can then reference that entity. If a `products` service defines the `Product` entity above, a `reviews` service can then add a field of type `Product` to its `Review` type, like so:

```graphql:title=reviews
type Review {
  product: Product
}

# This is a "stub" of the Product entity (see below)
extend type Product @key(fields: "upc") {
  upc: String! @external
}
```

Because the `Product` entity is defined in another service, the `reviews` service needs to define a **stub** of it to make its own schema valid. The stub includes just enough information for the service to know how to interact with a `Product`:

* The `extend` keyword indicates that `Product` is an entity that is defined in another implementing service (in this case, `products`).
* The `@key` directive indicates that `Product` uses the `upc` field as its primary key. **This value must match the value of `@key` specified in the entity's originating service.**
* The `upc` field must be included in the stub because it is part of the entity's primary key. It also must be annotated with the `@external` directive to indicate that the field originates from another service.

This explicit syntax has several benefits:
* It is standard GraphQL grammar.
* It enables you to run the `reviews` service standalone with a valid schema, including a `Product` type with a single `upc` field.
* It provides strong typing information that lets you catch mistakes at schema composition time.

## Resolving an entity from another service

In our example, the `reviews` service needs to define its own resolver for the `Product` entity. The `reviews` service doesn't know much about `Product`s, but fortunately, it doesn't need to. All it needs to do is return enough information to uniquely identify a given `Product`, like so:

```js
{
  Review: {
    product(review) {
      return { __typename: "Product", upc: review.upc };
    }
  }
}
```

This return value is a **representation** of a `Product` entity. Implementing services use representations to reference entities from other services. All a representation requires is an explicit `__typename` definition and values for the entity's primary key fields.

Your federated gateway provides this representation to the entity's originating service to fetch the full object. For this to work, the originating service (in this case, `products`) must define a **reference resolver** for the `Product` entity:

```js{3-5}
{
  Product: {
    __resolveReference(reference) {
      return fetchProductByUPC(reference.upc);
    }
  }
}
```

> Reference resolvers are a special addition to Apollo Server that enable an entity to be resolved by another service. They are called whenever a query references an `entity` across service boundaries. To learn more about `__resolveReference`, see the [API docs](/api/apollo-federation/).

With this model, each implementing service ends up with a schema that represents a true subset of the complete data graph, as opposed to complex individual schemas that define foreign key fields like `productID`. This enables clients to transparently execute a query like the following, which hits both the `products` and `reviews` services:

```graphql
{
  reviews {
    product {
      name
      price
    }
  }
}
```

## Extending an entity from another service

Returning a reference to an author represents just one side of a relationship. A true data graph should expose the ability to navigate relationships in both directions. You'll want to be able to go from a product to its reviews, for example. While these fields are exposed on `Product` for the client to query, they can't be part of the accounts service because they are a concern of the reviews service.

The `extend type` mechanism is all we need for this use case. While the `Product` type belongs to the product catalog service, other services can define extension fields on this type using the `extend type` syntax.

The query planner will make sure the fields required by a resolver on an extension field are requested from the service hosting the type even if the user didn't request them directly. Every resolver that is added to a type from another service will receive the fields requested in the `@key` directive on the type extension.

For example, if we wanted to add a reviews field to the `Product` type:

```graphql{3}
extend type Product @key(fields: "upc") {
  upc: String! @external
  reviews: [Review]
}
```

Since the reviews service already had a concept of the `Product` type from returning it, adding additional fields to the overall type can be done just like it was a normal type.

The generated query plan will fetch the `upc` field for each `Product` from the product catalog service and pass those to the reviews service, where you can then access these fields on the object passed into your `reviews` resolver:

```js
{
  Product: {
    reviews(product) {
      return fetchReviewsForProduct(product.upc);
    }
  }
}
```

Type extensions aren't just useful for relationships. You can also use them to extend types with additional scalar or other value fields. Here, we want to be able to query for the `inStock` status of a product. That information lives in an inventory service, so we'll add the type extension there:

```graphql{3}
extend type Product @key(fields: "upc") {
  upc: ID! @external
  inStock: Boolean
}
```

```js
{
  Product: {
    inStock(product): {
      return fetchInStockStatusForProduct(product.upc);
    }
  }
}
```

Similar to the `reviews` relationship example above, the gateway will fetch the required `upc` field from the product catalog service and pass it to the inventory service, even if the query didn't ask for the `upc`:

```graphql
query {
  topProducts {
    inStock
  }
}
```

## Root queries and mutations

Since `Query` and `Mutation` are regular types in GraphQL, we use the same `extend type` pattern to define root queries. This gives us a mechanism for how each service can define root queries for the composed graph.

To implement a root query, such as `topProducts`, we simply extend the `Query` type:

```graphql
extend type Query {
  topProducts(first: Int = 5): [Product]
}
```

There is no need to explicitly define `Query` or `Mutation` base types anywhere; Apollo automatically handles this for you.

## Value Types

A natural overlap among identical types between services is not uncommon. Rather than having a single service "own" those types, all services that use them are expected to share ownership. This form of type "duplication" across services is supported for Scalars, Objects, Interfaces, Enums, Unions, and Inputs. The rule of thumb for any of these value types is that the types **must be identical** in name and contents.

### Objects, Interfaces, and Inputs
For types with field definitions, all fields _and their types_ must be identical.

### Scalars
For Scalar values, it's important that services **share the same serialization and parsing logic**, since there is no way to validate that logic from the schema level by federation tooling.

### Enums
For Enum types, all values must match across services. **Even if a service doesn't use all values in an Enum, they still must be defined in the schema**. Failure to include all enum values in all services that use the Enum will result in a validation error when building the federated schema.

### Unions
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
