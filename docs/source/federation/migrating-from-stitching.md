---
title: Migrating from schema stitching
description: How to migrate services to Apollo Federation
---

If you have a distributed data graph that uses schema stitching, follow the
steps in this guide to migrate it to use Apollo Federation.

> For details on the advantages of using a federated data graph instead of
> schema stitching, see [this blog post](https://blog.apollographql.com/apollo-federation-f260cf525d21).

## Summary of steps

You can (and should) migrate **incrementally** from schema stitching to Apollo Federation.
To do so, you run Apollo Gateway _alongside_ your existing schema-stitching gateway and migrate the services that implement your data graph (**implementing services**)
one at a time.

Here are the high-level steps for migrating to Apollo Federation:

1. Add federation support to your implementing services
2. Start up an instance of Apollo Gateway
3. Migrate stitching logic from your schema-stitching gateway to your implementing services
4. Move traffic from the schema-stitching gateway to Apollo Gateway
5. Make updates to your federated schema

Each step is described in detail below.

> [This GitHub repository](https://github.com/apollographql/federation-migration-example) shows the same project before and after
> migrating to Apollo Federation from schema stitching.

## Step 1: Add federation support to your implementing services

You can add federation support to your implementing services _without_ impacting your
existing schema-stitching architecture. Support for federation is fully compatible
with schema stitching.

Because of this, we recommend that you migrate your implementing services in place
instead of creating replacement services. Doing so helps you identify any type conflicts that exist across your data graph.

### Using Apollo Server

If your implementing services use Apollo Server, add federation
support to them by installing the `@apollo/federation` package:

```bash
npm install @apollo/federation
```

Then use the `buildFederatedSchema` function to augment your schema with
fields that are necessary for federation support:

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

### Using another GraphQL server

 are several packages contributed by the community to support other GraphQL runtimes, including:

* [GraphQL-Java](https://github.com/apollographql/federation-jvm)
* [Graphene](https://pypi.org/project/graphene-federation/)
* [GraphQL-Ruby](https://github.com/Gusto/apollo-federation-ruby)

Before moving on, start up the service and ensure that it still works properly with the existing stitched gateway.

#### Instrumenting registry support

We highly recommend running services communicate their SDLs to the gateway via an [external registry](https://principledgraphql.com/integrity#3-track-the-schema-in-a-registry). There are a few reasons for doing this, which revolve around reliability of your data graph as well as maintaining a central source of truth for collaboration. Specifically with reliability, you want to ensure that whether your gateway is "up" does not depend on all services being "up". Therefore, though using the `serviceList` argument to Apollo gateway is a good way to test things locally, we recommend maintaining service SDLs in an external registry.

Apollo Graph Manager works as a (completely free!) service registry which handles managed configuration of the gateway. Running the gateway in this managed mode only requires providing a Graph Manager API key, which will direct the gateway to download service SDLs automatically from the registry in a fault-tolerant way. To read more about the design details and configuration, please read the docs on [managed configuration](https://www.apollographql.com/docs/graph-manager/federation/#registering-federated-services). In short, if using Apollo Graph Manager as your external federation registry, make sure to call `apollo service:push` with a `--serviceName` flag as part of your service's deploy script(s).

## Step 2: Start up an instance of Apollo Gateway

Once you've migrated your first service to federation, you can start exposing them through a top-level gateway. Apollo gateway is a query-planner and executor that handles incoming GraphQL requests and breaks them down into a series of operations to underlying GraphQL services. We recommend setting the Apollo gateway up side-by-side with your existing stitching gateway. Depending on your infrastructure, you may even want to put them in the same process to support dynamically routing traffic through either your stitching gateway or the federated gateway.

As mentioned before, we highly recommend running the gateway with a [managed configuration](https://www.apollographql.com/docs/graph-manager/federation/#managed-configuration). To create a gateway that uses managed configuration through Apollo Graph Manager, you simply need to set `ENGINE_API_KEY` and `ENGINE_SCHEMA_TAG` environment variables appropriately and leave out the `serviceList` constructor option to `ApolloGateway`. See the [Graph Manager docs](https://www.apollographql.com/docs/graph-manager/federation/#connecting-apollo-server-to-the-graph-manager) for more details.

Once your gateway is set up, you should be able to make direct queries to it that get routed to underlying services and see responses come through.

### Moving linking logic to service

When running a stitching gateway, it's customary to put linking logic _in the gateway_ rather than in the services themselves. The federation model, on the other hand, puts linking logic in services, where resolvers are written to extend foreign types using a primary `@key` field on that type as a dependency. Thus, as part of the migration from schema-stitching to federation, the next step will be to migrate this logic from your stitching gateway into downstream services. Below, we've included some examples of how to do this in more detail. For the most common use cases, here is a good rule of thumb to follow:

* **fragments** : When using fragments in your schema stitching resolvers, these usually translate to a combination of `@key` and `@requires` directives. In general, think of `@key` as the field(s) that completely identify an entity, and only use `@requires` for additional non-identifying information
* **filtering types** : We do not recommend filtering types out of your exposed schema when using a gateway. If you want types to be hidden, simply do not include them in your service's registered SDL.
* **renaming types** : If you are currently renaming types at the gateway level, simply rename these types at the service level instead
* **transforming fields** : If you are currently transforming fields at the gateway level, simply transform these fields at the service level instead

#### Removing type extensions from the gateway

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


#### Adding resolvers to the federated services

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

The important thing to know about this resolver is that it receives (as its first argument) anything that is defined in a `@key` on the type plus whatever is defined within `@requires` on the field.

So for the `Reservation.user` that we defined earlier:

```graphql
extend type Reservation @key(fields: "id") {
  id: ID! @external
  userId: ID! @external
  user: User @requires(fields: "userId")
}
```

The `Reservation.user` resolver will receive an `id` (of the reservation) and a `userId`. You can use the `userId` or anything else defined on the `Reservation` to lookup our user. For this example, the `userId` of a reservation is all you would need.

### Modifying the schema

Once you have fully migrated your graph to federation, it should look identical to your stitching gateway's schema, unless you decided to remove unused types along the way. At this point, you can fully migrate all traffic and begin to modify your existing schema to take advantage of federation. For more information on how to do this, check out [this guide](/federation/core-concepts/).

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
