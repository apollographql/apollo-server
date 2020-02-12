---
title: Working with entities
description: Reference and extend another service's types
---

In Apollo Federation, an **entity** is a type that you define canonically in _one_ implementing service and can then reference and extend in _other_ implementing services. Entities are the core building block of a federated graph.

## Declaring

In a GraphQL schema, you can designate any object type as an entity by adding a `@key` directive to its definition, like so:

```graphql{1}:title=products
type Product @key(fields: "upc") {
  upc: String!
  name: String!
  price: Int
}
```

The `@key` directive declares the entity's **primary key**, which consists of one or more of the type's `fields`. In the example above, the `Product` entity's primary key is its `upc` field. Apollo Gateway's query planner uses an entity's primary key to identify a given instance of the type.

> Apollo Federation supports [defining _multiple_ primary keys for an entity](./advanced-features/#multiple-primary-keys), along with [primary keys that consist of multiple fields](./advanced-features/#compound-and-nested-keys).

## Referencing

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

* The `extend` keyword indicates that `Product` is an entity that is defined in another implementing service (in this case, the `products` service).
* The `@key` directive indicates that `Product` uses the `upc` field as its primary key. **This value must match the value of `@key` specified in the entity's originating service.**
* The `upc` field must be included in the stub because it is part of the entity's primary key. It also must be annotated with the `@external` directive to indicate that the field originates in another service.

This explicit syntax has several benefits:
* It is standard GraphQL grammar.
* It enables you to run the `reviews` service standalone with a valid schema, including a `Product` type with a single `upc` field.
* It provides strong typing information that lets you catch mistakes at schema composition time.

## Resolving

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

This return value is a **representation** of a `Product` entity. Services use representations to reference entities from other services. A representation requires only an explicit `__typename` definition and values for the entity's primary key fields.

Apollo Gateway provides this representation to the entity's originating service to fetch the full object. For this to work, the originating service (in this case, `products`) must define a **reference resolver** for the `Product` entity:

```js{3-5}
{
  Product: {
    __resolveReference(reference) {
      return fetchProductByUPC(reference.upc);
    }
  }
}
```

> Reference resolvers are a special addition to Apollo Server that enable entities to be referenced by other services. They are called whenever a query references an `entity` across service boundaries. To learn more about `__resolveReference`, see the [API docs](/api/apollo-federation/).

With this model, each implementing service's schema represents a true subset of the complete data graph. This prevents the need for defining foreign-key fields in individual schemas, and enables clients to transparently execute a query like the following, which hits both the `products` and `reviews` services:

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

## Extending

An implementing service can also add fields to an entity that's defined in another service. This is called **extending** the entity.

When a service extends an entity, the entity's _originating_ service is not aware of the added fields. Only the _extending_ service (along with Apollo Gateway) knows about these fields.

> It is invalid for more than one service to extend the same entity with the same field name. Each individual field of an entity must originate in exactly one service.

### Example #1

Let's say we want to add a `reviews` field to the `Product` entity. This field will hold a list of reviews for the product. The `Product` entity originates in the `products` service, but it makes much more sense for the `reviews` service to resolve this particular field.

To handle this case, we can extend the `Product` entity in the `reviews` service like so:

```graphql{3}:title=reviews
extend type Product @key(fields: "upc") {
  upc: String! @external
  reviews: [Review]
}
```

As you can see, this definition is nearly identical to the stub we defined for the `Product` type in [Referencing](#referencing). All we've added is the `reviews` field. We _don't_ add an `@external` directive to the field, because it _does_ originate in the `reviews` service.

Because the `reviews` service adds the `reviews` field, it is also responsible for _resolving_ the field. Apollo Gateway is automatically aware of this responsibility. The generated query plan will fetch the `upc` field for each `Product` from the `products` service and pass those to the `reviews` service, where you can then access these fields on the object passed into your `reviews` resolver:

```js
{
  Product: {
    reviews(product) {
      return fetchReviewsForProduct(product.upc);
    }
  }
}
```

### Example #2

Let's say we want to be able to query for the `inStock` status of a product. That information lives in an `inventory` service, so we'll add the type extension there:

```graphql{3}:title=inventory
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

Similar to the `reviews` relationship example above, Apollo Gateway fetches the required `upc` field from the `products` service and passes it to the `inventory` service, even if the query didn't ask for the `upc`:

```graphql
query {
  topProducts {
    inStock
  }
}
```

## The `Query` and `Mutation` entities

In Apollo Federation, the `Query` and `Mutation` base types are _automatically_ entities that originate in Apollo Gateway itself. Consequently, _all_ of your implementing services should [extend](#extending) these types to add the operations they support.

For example, the `products` service might extend the root `Query` type to add a `topProducts` query, like so:

```graphql:title=products
extend type Query {
  topProducts(first: Int = 5): [Product]
}
```

## Changing a field's originating service

As your federated graph grows, you might decide that you want a particular field of an entity to originate in a different service.

For example, let's say the `products` service defines a `Product` entity that includes an `inStock` boolean field. Then, you add an `inventory` service to your federated graph. It now makes sense for the `inStock` field to originate in the `inventory` service instead.

Apollo Gateway helps you perform this migration much like you perform a database migration, with the following steps:

1. In the `inventory` service, [extend](#extending) the `Product` entity to add the `inStock` field. **Note that this is technically a federation error**, because this field is already defined in the `products` service.

2. In the `inventory` service, add a resolver for the `inStock` field. This service should resolve the field with the exact same outcome as the resolver in the `products` service.

3. Push the updated `inventory` service to your environment. **Again, this is a federation error**. When Apollo Gateway detects a duplicate field like this, it ignores the _newer_ declaration (i.e., the one in the `inventory` service) and continues to resolve the field in the `products` service.

4. In the `products` service, remove the `inStock` field and its resolver.

5. Push the updated `products` service to your environment. This removes the invalid duplicate, and Apollo Gateway will begin resolving the `inStock` field in the `inventory` service.
