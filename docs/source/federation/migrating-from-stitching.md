---
title: Migrating from schema stitching
description: How to migrate services to Apollo Federation
---

## Comparison with schema stitching

If you're familiar with the `graphql-tools` schema stitching implementation, you're likely wondering how that compares to federation. There are three major differences between the approaches:

1. With federation, microservices all expose a proper part of the overall graph and can refer directly to types that live in other services, without the need to add foreign keys or superfluous relationship root fields to your schema.
2. Federation is fully declarative and doesn't require any user code to be running in the gateway.
3. Execution is efficient and predictable, because it relies on a query plan generated ahead of time with full knowledge of the overall query, instead of on runtime schema delegation that gets invoked as part of normal resolver-based execution.

The first point may need some unpacking. Schema stitching forces you to expose foreign keys and relationship root fields at service boundaries instead of referring to external types directly.

For example, your reviews service would expose  `authorID` and `productID` fields, instead of fields that link to `User` or `Product`. You're also forced to add relationship root fields to get the reviews for a user or product by ID:

```graphql
extend type Query {
  reviewsForUser(userID: ID!): [Review]
}

type Review {
  body: String
  authorID: ID!
}
```

This means the relationships are implicit, and you can't create a proper graph just based on this schema. In order to compose this service into an overall graph, you'll have to add link definitions to the gateway:

```graphql
extend type Review {
  author: User
}

extend type User {
  reviews: [Review]
}

```

And you'll also have to write the code that implements these links, code that will be running in the gateway:

```js
{
  User: {
    reviews: {
      fragment: `... on User { id }`,
      resolve(user, args, context, info) {
        return info.mergeInfo.delegateToSchema({
          schema: reviewsSchema,
          operation: "query",
          fieldName: "reviewsForUser",
          args: {
            id: user.id
          },
          context,
          info
        });
      }
    },
  }
}
```

As a result, services can't really be developed in a modular way, because every team will also have to touch the gateway. That means it becomes a development bottleneck, and it's also often code that no one really owns. Yet any change to the gateway code can bring down the entire gateway.

## Preparing for a migration

The basic strategy for migrating from a stitching gateway to Apollo Federation is to start by making the underlying services federation-capable, then running a new federation gateway side-by-side with the stitching gateway as you make the transition. The essential steps are these:

1. [Add federation support to all stitched services](#adding-federation-support-to-services)
2. [Modifying the schema](#modifying-the-schema)
3. [Remove type extensions at the gateway and add them to the services](#removing-type-extensions-from-the-gateway)
4. [Move resolvers from the stitching gateway to the services](#adding-resolvers-to-the-federated-services)
5. [Start up a new gateway instance to communicate with the services](#starting-up-a-new-gateway)

To see a project using schema stitching that was migrated to take advantage of federation, check out [this repository](https://github.com/apollographql/federation-migration-example).

### Adding federation support to services

The first step is to install the federation package:

```
npm i @apollo/federation
```

Once installed, use the `buildFederatedSchema` utility to modify your existing schema with the needed fields:

```js
const { ApolloServer } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});
```

Before moving on, start up the service and ensure that it still works properly with the existing stitched gateway.

### Modifying the schema

Next, you need to modify your existing schema to take advantage of federation. For more information on how to do this, check out [this guide](/federation/core-concepts/).

### Removing type extensions from the gateway

If you followed the previous step, and added type extensions and fields to your services, you likely have conflicting fields with the stitching gateway now and will get duplicate field errors. You should be able to safely move any type extensions and field definitions out of the stitched gateway and into the service if you haven't already. With federated services, fields and type extensions can reference types that weren't even defined on that service.

For example, if you have a reservation and user service and want to add a user field to the reservation, previously you would extend the Reservation type at the gateway before building the final schema.

```javascript{1-5,8}
const extendedReservationSchema = `
  extend type Reservation {
    user: User
  }
`;

const generateAndMergeSchemas = async () => {
  const reservationSchema = await generateReservationSchema();
  const userSchema = await generateUserSchema();

  return mergeSchemas({
    schemas: [reservationSchema, userSchema, extendedReservationSchema],
    resolvers: {
      Reservation: {
        user: {
          fragment: `... on Reservation { userId }`,
          resolve: (parent, args, context, info) => {...}
        }
      }
    }
  })
}
```

With federation directives like `@external` it's possible to replace these gateway extensions with extensions on the service that owns their execution.

In the example above, the User service is the one that has awareness of how to fetch a user's information based on the reservation object, so in the User service, we can add the extension:

```graphql
extend type Reservation @key(fields: "id") {
  id: ID! @external
  userId: ID! @external
  user: User @requires(fields: "userId")
}
```

> In order to not break any existing clients, we won't remove the `userId` field until all usage of it is stopped.

The important parts to focus on in this guide are the `user` and `userId` fields.

The user field is similar to the extension that was previously at the gateway with the exception of the `@requires` directive. This directive signals to the query planner that the `user` field also needs the `Reservation.userId` field to properly lookup the user. You can think of the `@requires` directive as acting similarly to the `fragment` previously used in `mergeSchemas` in the stitched gateway.

The userId field is in this extension and marked as `@external` simply as a signal to the federated service that this field exists on the `Reservation` type. Federated services are built to be able to operate independently without any knowledge of the rest of the schema, so type hints like this are necessary to pass validation.


### Adding resolvers to the federated services

Following the previous steps ensures that the stitching gateway will still work with federation, but doesn't quite cover everything needed. This step is to write resolvers at the service-level that previously existed at the gateway.

Inside of `mergeSchemas`, we declare `resolvers` that look to a service and manually call an existing field using `delegateToSchema`. And example of one of these resolvers is:

```js
resolvers: {
  Reservation: {
    user: {
      fragment: `... on Reservation { userId }`,
      resolve: (parent, args, context, info) => {
        return info.mergeInfo.delegateToSchema({
          schema: userSchema,
          operation: 'query',
          fieldName: 'user',
          args: {
            id: parent.userId,
          },
          context,
          info,
        });
      },
    },
  },
}
```

This resolver calls `Query.user` on the `userSchema` to lookup a `User` and adds that user to the `Reservation.user` field that was previously defined at the gateway. This code can all remain. You don't need to remove it from the stitched gateway. In fact, if you did that, the stitched gateway would break.

Instead, we just need to _add_ a resolver for `Reservation.user` in the `Users` service.

```js
{
  Reservation: {
    user: ({ userId }) => {
      return lookupUser(userId);
    },
  }
}
```

The important thing to know about this resolver is that it receives as a first argument anything that is defined in a `@key` or `@requires` on the type.

So for the `Reservation.user` that we defined earlier:

```graphql
extend type Reservation @key(fields: "id") {
  id: ID! @external
  userId: ID! @external
  user: User @requires(fields: "userId")
}
```

The `Reservation.user` resolver will receive an `id` (of the reservation) and a `userId`. You can use the `userId` or anything else defined on the `Reservation` to lookup our user. For this example, the `userId` of a reservation is all you would need.

### Starting up a new Gateway

Once a service is running independently, you can start up a gateway to sit in front of it. Even if you have only migrated one of your services, you can set up a gateway, and verify it is working. Once it is, you can expand, and keep adding services to your graph, until all services are moved over. Once that is done, the old stitching gateway can be retired.
