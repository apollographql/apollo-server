---
title: Schema delegation
description: Forward queries to other schemas automatically
---

Schema delegation is a way to automatically forward a query (or a part of a query) from a parent schema to another schema (called a _subschema_) that is able to execute the query. Delegation is useful when the parent schema shares a significant part of its data model with the subschema. For example, the parent schema might be powering a GraphQL gateway that connects multiple existing endpoints together, each with its own schema. This kind of architecture could be implemented using schema delegation.

The `graphql-tools` package provides several related tools for managing schema delegation:

* [Remote schemas](/features/remote-schemas/) - turning a remote GraphQL endpoint into a local schema
* [Schema transforms](/features/schema-transforms/) - modifying existing schemas to make delegation easier
* [Schema stitching](/features/schema-stitching/) - merging multiple schemas into one

Delegation is performed by one function, `delegateToSchema`, called from within a resolver function of the parent schema. The `delegateToSchema` function sends the query subtree received by the parent resolver to a subschema that knows how to execute it, then returns the result as if the parent resolver had executed the query.

## Motivational example

Let's consider two schemas, a subschema and a parent schema that reuses parts of a subschema. In this example the parent schema reuses the *definitions* of the subschema. However the implementations separate should be kept separate, so that the subschema can be tested independently or retrieved from a remote service. The subschema:

```graphql
type Repository {
  id: ID!
  url: String
  issues: [Issue]
  userId: ID!
}

type Issue {
  id: ID!
  text: String!
  repository: Repository!
}

type Query {
  repositoryById(id: ID!): Repository
  repositoriesByUserId(id: ID!): [Repository]
}
```

Parent Schema:

```graphql
type Repository {
  id: ID!
  url: String
  issues: [Issue]
  userId: ID!
  user: User
}

type Issue {
  id: ID!
  text: String!
  repository: Repository!
}

type User {
  id: ID!
  username: String
  repositories: [Repository]
}

type Query {
  userById(id: ID!): User
}
```

Suppose we want the parent schema to delegate retrieval of repositories to the subschema, in order to execute queries such as this one:

```graphql
query {
  userById(id: "1") {
    id
    username
    repositories {
      id
      url
      user
      issues {
        text
      }
    }
  }
}
```

The resolver function for the `repositories` field of the `User` type would be responsible for the delegation, in this case. While it's possible to call a remote GraphQL endpoint or resolve the data manually, this would require us to transform the query manually, or always fetch all possible fields, which could lead to overfetching. Delegation automatically extracts the appropriate query to send to the subschema:

```graphql
# To the subschema
query($id: ID!) {
  repositoriesByUserId(id: $id) {
    id
    url
    issues {
      text
    }
  }
}
```

Delegation also removes the fields that don't exist on the subschema, such as `user`. This field would be retrieved from the parent schema using normal GraphQL resolvers.

## Example

The `delegateToSchema` method can be found on the `info.mergeInfo` object within any resolver function, and should be called with the following named options:


```graphql
# Subschema

type Booking {
  id: ID!
}

type Query {
  bookingsByUser(userId: ID!, limit: Int): [Booking]
}

# Schema

type User {
  id: ID!
  bookings(limit: Int): [Booking]
}

type Booking {
  id: ID!
}
```

If we delegate at `User.bookings` to `Query.bookingsByUser`, we want to preserve the `limit` argument and add an `userId` argument by using the `User.id`. So the resolver would look like the following:

```js
const resolvers = {
  User: {
    bookings: (parent, args, context, info) => {
      return info.mergeInfo.delegateToSchema({
        schema: subschema,
        operation: 'query',
        fieldName: 'bookingsByUser',
        args: {
          userId: parent.id,
        },
        context,
        info,
      });
    },
  },
};
```

## Additional considerations

### Aliases

Delegation preserves aliases that are passed from the parent query. However that presents problems, because default GraphQL resolvers retrieve field from parent based on their name, not aliases. This way results with aliases will be missing from the delegated result. `mergeSchemas` and `transformSchemas` go around that by using `src/stitching/defaultMergedResolver` for all fields without explicit resolver. When building new libraries around delegation, one should consider how the aliases will be handled.

## API

Under the hood, Apollo Server uses the `graphql-tools` library, which includes [`delegateToSchema`](/api/graphql-tools/#delegatetoschema) by default.
