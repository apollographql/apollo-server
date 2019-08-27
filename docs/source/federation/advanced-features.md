---
title: Advanced features
description: Patterns for complex graphs
---

Federation supports several advanced features that make it easier to integrate with legacy APIs or build complex schemas.

## Multiple primary keys

In some cases there may be multiple ways of referring to an entity, such as when we refer to a user either by ID or by email. This pattern is especially common when a type spans services: your review system may refer to a product by UPC, while your inventory system stores SKUs.

Therefore, the programming model allows types to define multiple keys, which indicates they can be looked up in one of several ways:

```graphql
type Product @key(fields: "upc") @key(fields: "sku") {
  upc: String!
  sku: String!
  price: String
}
```

> Note the difference from `@key(fields: "upc sku")`, a composite key, which would mean that only the combination of UPC and SKU is unique. See below.

Multiple keys are only allowed on the base type, not on type extensions. Type extensions are used to define external types, so a `@key` directive there is meant to specify which key of the base type will be used as a foreign key by the service that contains the type extension. For example, our reviews service could use `upc`:

```graphql
extend type Product @key(fields: "upc") {
  upc: String! @external
  reviews: [Review]
}
```

While the inventory service uses `sku`:

```graphql
extend type Product @key(fields: "sku") {
  sku: ID! @external
  inStock: Boolean
}
```

## Compound and nested keys

Keys may be complex and include nested fields, as when a user's ID is only unique within its organization:

```graphql
type User @key(fields: "id organization { id }") {
  id: ID!
  organization: Organization!
}

type Organization {
  id: ID!
}
```

> Note that although the fields argument is parsed as a selection set, some restrictions apply to make the result suitable as a key. For example, fields shouldn't return unions or interfaces.

## Computed fields

In many cases, what you need to resolve an extension field is a foreign key, which you specify through the `@key` directive on the type extension. With the `@requires` directive however, you can require any additional combination of fields (including subfields) from the base type that you may need in your resolver. For example, you may need access to a product's size and weight to calculate a shipping estimate:

```graphql{5}
extend type Product @key(fields: "sku") {
  sku: ID! @external
  size: Int @external
  weight: Int @external
  shippingEstimate: String @requires(fields: "size weight")
}
```

If a client requests `shippingEstimate`, the query planner will now request `size` and `weight` from the base `Product` type, and pass it through to your service, so you can access them directly from your resolver in the exact same way you would if `Product` was contained within a single service:

```js{4}
{
  Product: {
    shippingEstimate(product) {
      return computeShippingEstimate(product.sku, product.size, product.weight);
    }
  }
}
```

> Note that you can only require fields that live on the original type definition, not on type extensions defined in other services.

## Using denormalized data

In some cases, a service will be able to provide additional fields, even if these are not part of a key. For example, our review system may store the user's name in addition to the id, so we don't have to perform a separate fetch to the accounts service to get it. We can indicate which additional fields can be queried on the referenced type using the `@provides` directive:

```graphql{2,7}
type Review {
  author: User @provides(fields: "username")
}

extend type User @key(fields: "id") {
  id: ID! @external
  username: String @external
}
```

The `@provides` directive acts as a hint to the gateway

```js{4}
{
  Review: {
    author(review) {
      return { id: review.authorID, username: review.authorUsername };
    }
  }
}
```

This knowledge can be used by the gateway to generate a more efficient query plan and avoids a fetch to a separate service because a field is already provided. In this case, we can return the author's name as part of the fetch to the reviews service:

```graphql
query {
  topReviews {
    author {
      username
    }
  }
}
```
