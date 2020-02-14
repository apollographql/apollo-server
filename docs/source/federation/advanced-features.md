---
title: Advanced features
description: Patterns for complex graphs
---

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
