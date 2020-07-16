---
title: Entities
description: Reference and extend types across services
---

In Apollo Federation, an **entity** is a type that you define canonically in _one_ implementing service and can then reference and extend in _other_ implementing services. Entities are the core building block of a federated graph.

## Defining

In a GraphQL schema, you can designate any object type as an entity by adding a `@key` directive to its definition, like so:

```graphql{1}:title=products
type Product @key(fields: "upc") {
  upc: String!
  name: String!
  price: Int
}
```

The `@key` directive defines the entity's **primary key**, which consists of one or more of the type's `fields`. In the example above, the `Product` entity's primary key is its `upc` field. The gateway's query planner uses an entity's primary key to identify a given instance of the type.

> An entity's `@key` cannot include fields that hold unions or interfaces.

### Defining multiple primary keys

If an entity can be uniquely identified by more than one combination of fields, you can define more than one primary key for that entity.

In the following example, a `Product` entity can be uniquely identified by either its `upc` _or_ its `sku`:

```graphql{1}:title=products
type Product @key(fields: "upc") @key(fields: "sku") {
  upc: String!
  sku: String!
  price: String
}
```

This pattern is helpful when different services interact with different fields of an entity. For example, a `reviews` service might refer to products by their UPC, whereas an `inventory` service might use SKUs.

### Defining a compound primary key

A single primary key can consist of multiple fields, and even nested fields.

The following example shows a primary key that consists of both a user's `id` _and_ the `id` of that user's associated organization:

```graphql{1}:title=directory
type User @key(fields: "id organization { id }") {
  id: ID!
  organization: Organization!
}

type Organization {
  id: ID!
}
```

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
* The `@key` directive indicates that `Product` uses the `upc` field as its primary key. This value must match the value of exactly one `@key` defined in the entity's originating service, even if the entity defines [multiple primary keys](#defining-multiple-primary-keys).
* The `upc` field must be included in the stub because it is part of the specified `@key`. It also must be annotated with the `@external` directive to indicate that the field originates in another service.

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

The gateway provides this representation to the entity's originating service to fetch the full object. For this to work, the originating service (in this case, `products`) must define a **reference resolver** for the `Product` entity:

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

An implementing service can add fields to an entity that's defined in another service. This is called **extending** the entity.

When a service extends an entity, the entity's _originating_ service is not aware of the added fields. Only the _extending_ service (along with the gateway) knows about these fields.

> Each field of an entity should be defined in exactly one service. Otherwise, a schema composition error will occur.

### Example #1

Let's say we want to add a `reviews` field to the `Product` entity. This field will hold a list of reviews for the product. The `Product` entity originates in the `products` service, but it makes much more sense for the `reviews` service to resolve this particular field.

To handle this case, we can extend the `Product` entity in the `reviews` service, like so:

```graphql{3}:title=reviews
extend type Product @key(fields: "upc") {
  upc: String! @external
  reviews: [Review]
}
```

This definition is nearly identical to the stub we defined for the `Product` type in [Referencing](#referencing). All we've added is the `reviews` field. We _don't_ include an `@external` directive, because this field _does_ originate in the `reviews` service.

Whenever a service extends an entity with a new field, it is also responsible for _resolving_ the field. The gateway is automatically aware of this responsibility. In our example, the generated query plan will fetch the `upc` field for each `Product` from the `products` service and pass those to the `reviews` service, where you can then access these fields on the object passed into your `reviews` resolver:

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

Similar to the `reviews` relationship example above, the gateway fetches the required `upc` field from the `products` service and passes it to the `inventory` service, even if the query didn't ask for the `upc`:

```graphql
query GetTopProductAvailability {
  topProducts {
    inStock
  }
}
```

## The `Query` and `Mutation` types

In Apollo Federation, the `Query` and `Mutation` base types originate in the graph composition itself and _all_ of your implementing services are automatically treated as [extending](#extending) these types to add the operations they support without explicitly adding the `extends` keyword.

For example, the `products` service might extend the root `Query` type to add a `topProducts` query, like so:

```graphql:title=products
type Query {
  topProducts(first: Int = 5): [Product]
}
```

## Migrating a field to another service (advanced)

As your federated graph grows, you might decide that you want a particular field of an entity to originate in a different service.

For example, let's say your `products` service defines a `Product` entity that includes an `inStock` boolean field. Then, you add an `inventory` service to your federated graph. It now makes sense for the `inStock` field to originate in the `inventory` service instead.

Apollo Gateway helps you perform this migration much like you perform a database migration, with the following steps:

1. In the `inventory` service's schema, [extend](#extending) the `Product` entity to add the `inStock` field.

    _Note that this is technically a composition error, because `inStock` is already defined in the `products` service. However, this error is handled gracefully, as described below._

2. In the `inventory` service, add a resolver for the `inStock` field. This service should resolve the field with the exact same outcome as the resolver in the `products` service.

3. Push the updated `inventory` service to your environment.

    _Again, this technically deploys a composition error. **However**, this error is handled gracefully in one of two ways, depending on whether you are using [managed federation](https://www.apollographql.com/docs/graph-manager/federation/):_

    * _If you **are** using managed federation, Apollo Studio does **not** push an updated schema to your gateway, and the gateway continues to resolve the `inStock` field in the `products` service._

    * _If you are **not** using managed federation, your gateway starts resolving the `inStock` field in whichever service is listed **last** in your gateway's [`serviceList`](/api/apollo-gateway/#apollogateway)._

4. In the `products` service's schema, remove the `inStock` field and push the updated service to your environment.

    _This takes care of the composition error, regardless of whether you are using managed federation. The gateway will begin resolving the `inStock` field in the `inventory` service._

5. Remove the resolver for `inStock` from the `products` service and push the updated service to your environment.

    _By removing the `inStock` field from `products` **before** removing its associated resolver, you guarantee that the gateway never attempts to resolve the field in a service that lacks a resolver for it._

## Extending an entity with computed fields (advanced)

When you [extend an entity](#extending), you can define fields that depend on fields in the entity's originating service. For example, a `shipping` service might extend the `Product` entity with a `shippingEstimate` field, which is calculated based on the product's `size` and `weight`:

```graphql{5}:title=shipping
extend type Product @key(fields: "sku") {
  sku: ID! @external
  size: Int @external
  weight: Int @external
  shippingEstimate: String @requires(fields: "size weight")
}
```

As shown, you use the `@requires` directive to indicate which fields (and subfields) from the entity's originating service are required.

>You **cannot** require fields that are defined in a service besides the entity's originating service.

In the above example, if a client requests a product's `shippingEstimate`, the gateway will first obtain the product's `size` and `weight` from the `products` service, then pass those values to the `shipping` service. This enables you to access those values directly from your resolver:

```js{4}
{
  Product: {
    shippingEstimate(product) {
      return computeShippingEstimate(product.sku, product.size, product.weight);
    }
  }
}
```

## Resolving another service's field (advanced)

Sometimes, multiple implementing services are capable of resolving a particular field for an entity, because all of those services have access to a particular data store. For example, an `inventory` service and a `products` service might both have access to the database that stores all product-related data.

When you [extend an entity](#extending) in this case, you can specify that the extending service `@provides` the field, like so:

```graphql{2,8-9}:title=inventory
type InStockCount {
  product: Product! @provides(fields: "name price")
  quantity: Integer!
}

extend type Product @key(fields: "sku") {
  sku: String! @external
  name: String @external
  price: Integer @external
}
```

**This is a completely optional optimization.** When the gateway plans a query's execution, it looks at which fields are available from each implementing service. It can then attempt to optimize performance by executing the query across the fewest services needed to access all required fields.

Keep the following in mind when using the `@provides` directive:

* Each service that `@provides` a field must also define a resolver for that field. **That resolver's behavior must match the behavior of the resolver in the field's originating service.**
* When an entity's field can be fetched from multiple services, there is no guarantee as to _which_ service will resolve that field for a particular query.
* If a service `@provides` a field, it must still list that field as `@external`, because the field originates in another service.
