---
title: Schema delegation
description: Forward queries to other schemas automatically
---

Schema delegation is a way to automatically forward a query (or a part of a query) from a parent schema to another schema (called a _subschema_) that is able to execute the query. Delegation is useful when the parent schema shares a significant part of its data model with the subschema. For example, the parent schema might be powering a GraphQL gateway that connects multiple existing endpoints together, each with its own schema. This kind of architecture could be implemented using schema delegation.

The `graphql-tools` package provides several related tools for managing schema delegation:

* [Remote schemas](./remote-schemas.html) - turning a remote GraphQL endpoint into a local schema
* [Schema transforms](./schema-transforms.html) - modifying existing schemas to make delegation easier
* [Schema stitching](./schema-stitching) - merging multiple schemas into one

Delegation is performed by one function, `delegateToSchema`, called from within a resolver function of the parent schema. The `delegateToSchema` function sends the query subtree received by the parent resolver to a subschema that knows how to execute it, then returns the result as if the parent resolver had executed the query.

<h2 id="example">Motivational example</h2>

Let's consider two schemas, a subschema and a parent schema that reuses parts of a subschema. While the parent schema reuses the *definitions* of the subschema, we want to keep the implementations separate, so that the subschema can be tested independently, or even used as a remote service.

```graphql
# Subschema
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

# Parent schema
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

<h2 id="api">API</h2>

<h3 id="delegateToSchema">delegateToSchema</h3>

The `delegateToSchema` method can be found on the `info.mergeInfo` object within any resolver function, and should be called with the following named options:

```
delegateToSchema(options: {
  schema: GraphQLSchema;
  operation: 'query' | 'mutation' | 'subscription';
  fieldName: string;
  args?: { [key: string]: any };
  context: { [key: string]: any };
  info: GraphQLResolveInfo;
  transforms?: Array<Transform>;
}): Promise<any>
```

#### schema: GraphQLSchema

A subschema to delegate to.

#### operation: 'query' | 'mutation' | 'subscription'

The operation type to use during the delegation.

#### fieldName: string

A root field in a subschema from which the query should start.

#### args: { [key: string]: any }

Additional arguments to be passed to the field. Arguments passed to the field that is being resolved will be preserved if the subschema expects them, so you don't have to pass existing arguments explicitly, though you could use the additional arguments to override the existing ones. For example:

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
    bookings(parent, args, context, info) {
      return info.mergeInfo.delegateToSchema({
        schema: subschema,
        operation: 'query',
        fieldName: 'bookingsByUser',
        args: {
          userId: parent.id,
        },
        context,
        info,
      );
    },
    ...
  },
  ...
};
```

#### context: { [key: string]: any }

GraphQL context that is going to be past to subschema execution or subsciption call.

#### info: GraphQLResolveInfo

GraphQL resolve info of the current resolver. Provides access to the subquery that starts at the current resolver.

Also provides the `info.mergeInfo.delegateToSchema` function discussed above.

#### transforms: Array<Transform>

[Transforms](./schema-transforms.html) to apply to the query and results. Should be the same transforms that were used to transform the schema, if any. After transformation, `transformedSchema.transforms` contains the transforms that were applied.

<h2 id="considerations">Additional considerations</h2>

### Aliases

Delegation preserves aliases that are passed from the parent query. However that presents problems, because default GraphQL resolvers retrieve field from parent based on their name, not aliases. This way results with aliases will be missing from the delegated result. `mergeSchemas` and `transformSchemas` go around that by using `src/stitching/defaultMergedResolver` for all fields without explicit resolver. When building new libraries around delegation, one should consider how the aliases will be handled.
