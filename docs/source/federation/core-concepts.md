---
title: Core concepts
description: How schema composition works
---

Apollo Federation works through a declarative composition model where services expose their capabilities and together they can be formed into a single graph. This section describes the core concepts in the programming model.

## Entities and keys

An entity is a type that can be referenced by another service. Entities create connection points between services and form the basic building blocks of a federated graph. Entities have a primary key whose value uniquely identifies a specific instance of the type, similar to the function of a primary key in a SQL table.

Declaring an entity is done by adding a `@key` directive to the type definition. The directive takes one argument specifying the key:

```graphql{1}
type Product @key(fields: "upc") {
  upc: String!
  name: String!
  price: Int
}
```

In this example, the `@key` directive tells the Apollo query planner that a particular instance of `Product` can be fetched if you have its `upc`. Unlike Relay's [Node interface](https://facebook.github.io/relay/docs/en/graphql-server-specification.html#object-identification), keys can be any field (not just `ID`) and need not be globally unique. The ability to specify an entity's key makes it easier to build a data graph on top of existing APIs and services that already have a notion of a primary key, and encourages a more natural product-centric type definition.

> Apollo supports multiple keys for an entity and composite keys (combination of fields). See [advanced features](/federation/advanced-features/) for more information on these options.

## Referencing external types

Once an entity is part of the graph, other services can begin to reference that type from their own types. Let's look at how the reviews service can join across services to return a `Product`:

```graphql
# in the reviews service
type Review {
  product: Product
}

extend type Product @key(fields: "upc") {
  upc: String! @external
}
```

In this example we have a `Review` type with a field called `product` that returns the `Product` type. Since `Product` is an entity that lives in another service, we define a *stub* of that type in this service with just enough information to enable composition. The syntax may look a bit strange at first, so let's unpack it:
- The `extend` keyword declares that `Product` is an entity defined elsewhere, in this case the product catalog service.
- The `@key` directive declares that we'll use a UPC to reference a particular product. This must match the referenced entity's own key as defined in the product catalog service.
- The definition of the `upc` field with an `@external` directive declares the type of the `upc` field (`String!`, in this case) that is implemented in another service.

This explicit syntax has several benefits. It is standard GraphQL grammar. It allows us to run the reviews service standalone with a valid schema, including a `Product` type with a single `upc` field. And it provides strong typing information that lets us catch mistakes at schema composition time.

With the type definitions in place, we can write a resolver for `Review.product`. Instead of returning a complete `Product` object (we can't; this service doesn't know much about products), the resolver just returns a reference to the external type.

```js
{
  Review: {
    product(review) {
      return { __typename: "Product", upc: review.product_upc };
    }
  }
}
```

The `{ __typename: "Product", upc: review.product_upc }` object is a *representation* of a `Product` entity. Representations are how services reference each others' types. They contain an explicit typename definition and a value for the key.

The gateway will use the representation as an input to the service that owns the referenced entity. So to allow the gateway to enter the graph in this manner and resume execution of the query, the last thing we need is a *reference resolver* back in the product catalog service. We only write this once per entity.

```js{3-5}
{
  Product: {
    __resolveReference(reference) {
      return fetchProductByUPC(reference.upc);
    }
  }
}
```

> Reference resolvers are a special addition to Apollo Server that allow individual types to be resolved by a reference from another service. They are called when a query references an `entity` across service boundaries. To learn more about `__resolveReference`, see the [API docs](/api/apollo-federation/).

What is nice about this model is that we end up with a schema that represents a true subset of the overall graph, as opposed to a mangled schema with foreign key fields like `productID`. Ultimately, this means clients can write queries like this without having to ask for special fields or make additional requests to other services.

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

So to review: to reference an external entity from a resolver, we
1. Define a stub type for the entity we want to reference. The key as declared in the stub must match the entity's own declaration.
2. From the referencing resolver, return a representation.
3. In the referenced service, implement a reference resolver for the entity.

## Extending external types

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


