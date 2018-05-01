---
title: Introduction
description: Combining multiple GraphQL APIs into one
---

Schema stitching is the process of creating a single GraphQL schema from multiple underlying GraphQL APIs.

One of the main benefits of GraphQL is that we can query all of our data as part of one schema, and get everything we need in one request. But as the schema grows, it might become cumbersome to manage it all as one codebase, and it starts to make sense to split it into different modules. We may also want to decompose your schema into separate microservices, which can be developed and deployed independently.

In both cases, we use `mergeSchemas` to combine multiple GraphQL schemas together and produce a merged schema that knows how to delegate parts of the query to the relevant subschemas. These subschemas can be either local to the server, or running on a remote server. They can even be services offered by 3rd parties, allowing us to connect to external data and create mashups.

<h2 id="remote-schemas" title="Remote schemas">Working with remote schemas</h2>

In order to merge with a remote schema, we first call [makeRemoteExecutableSchema](./remote-schemas.html) to create a local proxy for the schema that knows how to call the remote endpoint. We then merge that local proxy schema the same way we would merge any other locally implemented schema.

<h2 id="basic-example">Basic example</h2>

In this example we'll stitch together two very simple schemas. It doesn't matter whether these are local or proxies created with `makeRemoteExecutableSchema`, because the merging itself would be the same.

In this case, we're dealing with two schemas that implement a system with users and "chirps"&mdash;small snippets of text that users can post.

```js
const {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  mergeSchemas,
  ApolloServer,
  gql,
} = require('apollo-server');

// Mocked chirp schema
// We don't worry about the schema implementation right now since we're just
// demonstrating schema stitching.
const chirpSchema = makeExecutableSchema({
  typeDefs: gql`
    type Chirp {
      id: ID!
      text: String
      authorId: ID!
    }

    type Query {
      chirpById(id: ID!): Chirp
      chirpsByAuthorId(authorId: ID!): [Chirp]
    }
  `
});

addMockFunctionsToSchema({ schema: chirpSchema });

// Mocked author schema
const authorSchema = makeExecutableSchema({
  typeDefs: gql`
    type User {
      id: ID!
      email: String
    }

    type Query {
      userById(id: ID!): User
    }
  `
});

addMockFunctionsToSchema({ schema: authorSchema });

const server = new ApolloServer({ schema });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

This gives us a new schema with the root fields on `Query` from both schemas (along with the `User` and `Chirp` types):

```graphql
type Query {
  chirpById(id: ID!): Chirp
  chirpsByAuthorId(authorId: ID!): [Chirp]
  userById(id: ID!): User
}
```

We now have a single schema that supports asking for `userById` and `chirpsByAuthorId` in the same query!

<h3 id="adding-resolvers">Adding resolvers between schemas</h3>

Combining existing root fields is a great start, but in practice we will often want to introduce additional fields for working with the relationships between types that came from different subschemas. For example, we might want to go from a particular user to their chirps, or from a chirp to its author. Or we might want to query a `latestChirps` field and then get the author of each of those chirps. If the only way to obtain a chirp's author is to call the `userById(id)` root query field with the `authorId` of a given chirp, and we don't know the chirp's `authorId` until we receive the GraphQL response, then we won't be able to obtain the authors as part of the same query.

To add this ability to navigate between types, we need to _extend_ existing types with new fields that translate between the types:

```js
const linkTypeDefs = gql`
  extend type User {
    chirps: [Chirp]
  }

  extend type Chirp {
    author: User
  }
`;
```

We can now merge these three schemas together:

```js
mergeSchemas({
  schemas: [
    chirpSchema,
    authorSchema,
    linkTypeDefs,
  ],
});
```

We won't be able to query `User.chirps` or `Chirp.author` yet, however, because we still need to define resolvers for these new fields.

How should these resolvers be implemented? When we resolve `User.chirps` or `Chirp.author`, we want to _delegate_ to the relevant root fields. To get from a user to the user's chirps, for example, we'll want to use the `id` of the user to call `Query.chirpsByAuthorId`. And to get from a chirp to its author, we can use the chirp's `authorId` field to call the existing `Query.userById` field.

Resolvers for fields in schemas created by `mergeSchema` have access to a handy `delegateToSchema` function (exposed via `info.mergeInfo.delegateToSchema`) that allows forwarding parts of queries (or even whole new queries) to one of the subschemas that was passed to `mergeSchemas`.

In order to delegate to these root fields, we'll need to make sure we've actually requested the `id` of the user or the `authorId` of the chirp. To avoid forcing users to add these fields to their queries manually, resolvers on a merged schema can define a `fragment` property that specifies the required fields, and they will be added to the query automatically.

A complete implementation of schema stitching for these schemas might look like this:

```js
const mergedSchema = mergeSchemas({
  schemas: [
    chirpSchema,
    authorSchema,
    linkTypeDefs,
  ],
  resolvers: {
    User: {
      chirps: {
        fragment: `fragment UserFragment on User { id }`,
        resolve(user, args, context, info) {
          return info.mergeInfo.delegateToSchema({
            schema: chirpSchema,
            operation: 'query',
            fieldName: 'chirpsByAuthorId',
            args: {
              authorId: user.id,
            },
            context,
            info,
          });
        },
      },
    },
    Chirp: {
      author: {
        fragment: `fragment ChirpFragment on Chirp { authorId }`,
        resolve(chirp, args, context, info) {
          return info.mergeInfo.delegateToSchema({
            schema: authorSchema,
            operation: 'query',
            fieldName: 'userById',
            args: {
              id: chirp.authorId,
            },
            context,
            info,
          });
        },
      },
    },
  },
});
```

<h2 id="using-with-transforms">Using with Transforms</h2>

Often, when creating a GraphQL gateway that combines multiple existing schemas, we might want to modify one of the schemas. The most common tasks include renaming some of the types, and filtering the root fields. By using [transforms](./schema-transforms) with schema stitching, we can easily tweak the subschemas before merging them together.

Before, when we were simply merging schemas without first transforming them, we would typically delegate directly to one of the merged schemas. Once we add transforms to the mix, there are times when we want to delegate to fields of the new, transformed schemas, and other times when we want to delegate to the original, untransformed schemas.

For example, suppose we transform the `chirpSchema` by removing the `chirpsByAuthorId` field and add a `Chirp_` prefix to all types and field names, in order to make it very clear which types and fields came from `chirpSchema`:

```js
const {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  mergeSchemas,
  transformSchema,
  FilterRootFields,
  RenameTypes,
  RenameRootFields,
} = require('apollo-server');

// Mocked chirp schema; we don't want to worry about the schema
// implementation right now since we're just demonstrating
// schema stitching
const chirpSchema = makeExecutableSchema({
  typeDefs: gql`
    type Chirp {
      id: ID!
      text: String
      authorId: ID!
    }

    type Query {
      chirpById(id: ID!): Chirp
      chirpsByAuthorId(authorId: ID!): [Chirp]
    }
  `
});

addMockFunctionsToSchema({ schema: chirpSchema });

// create transform schema

const transformedChirpSchema = transformSchema(chirpSchema, [
  new FilterRootFields(
    (operation: string, rootField: string) => rootField !== 'chirpsByAuthorId'
  ),
  new RenameTypes((name: string) => `Chirp_${name}`),
  new RenameRootFields((name: string) => `Chirp_${name}`),
]);
```

Now we have a schema that has all fields and types prefixed with `Chirp_` and has only the `chirpById` root field. Note that the original schema has not been modified, and remains fully functional. We've simply created a new, slightly different schema, which hopefully will be more convenient for merging with our other subschemas.

Now let's implement the resolvers:

```js
const mergedSchema = mergeSchemas({
  schemas: [
    transformedChirpSchema,
    authorSchema,
    linkTypeDefs,
  ],
  resolvers: {
    User: {
      chirps: {
        fragment: `fragment UserFragment on User { id }`,
        resolve(user, args, context, info) {
          return info.mergeInfo.delegateToSchema({
            schema: chirpSchema,
            operation: 'query',
            fieldName: 'chirpsByAuthorId',
            args: {
              authorId: user.id,
            },
            context,
            info,
            transforms: transformedChirpSchema.transforms,
          });
        },
      },
    },
    Chirp_Chirp: {
      author: {
        fragment: `fragment ChirpFragment on Chirp { authorId }`,
        resolve(chirp, args, context, info) {
          return info.mergeInfo.delegateToSchema({
            schema: authorSchema,
            operation: 'query',
            fieldName: 'userById',
            args: {
              id: chirp.authorId,
            },
            context,
            info,
          });
        },
      },
    },
  },
});

const server = new ApolloServer({ schema: mergedSchema });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

Notice that `resolvers.Chirp_Chirp` has been renamed from just `Chirp`, but `resolvers.Chirp_Chirp.author.fragment` still refers to the original `Chirp` type and `authorId` field, rather than `Chirp_Chirp` and `Chirp_authorId`.

Also, when we call `info.mergeInfo.delegateToSchema` in the `User.chirps` resolvers, we can delegate to the original `chirpsByAuthorId` field, even though it has been filtered out of the final schema. That's because we're delegating to the original `chirpSchema`, which has not been modified by the transforms.

<h2 id="complex-example">Complex example</h2>

For a more complicated example involving properties and bookings, with implementations of all of the resolvers, check out the Launchpad links below:

* [Property schema](https://launchpad.graphql.com/v7l45qkw3)
* [Booking schema](https://launchpad.graphql.com/41p4j4309)
* [Merged schema](https://launchpad.graphql.com/q5kq9z15p)

<h2 id="api">API</h2>

<h3 id="mergeSchemas">mergeSchemas</h3>

```ts
mergeSchemas({
  schemas: Array<string | GraphQLSchema | Array<GraphQLNamedType>>;
  resolvers?: Array<IResolvers> | IResolvers;
  onTypeConflict?: (
    left: GraphQLNamedType,
    right: GraphQLNamedType,
    info?: {
      left: {
        schema?: GraphQLSchema;
      };
      right: {
        schema?: GraphQLSchema;
      };
    },
  ) => GraphQLNamedType;
})
```

This is the main function that implements schema stitching. Read below for a description of each option.

#### schemas

`schemas` is an array of `GraphQLSchema` objects, schema strings, or lists of `GraphQLNamedType`s. Strings can contain type extensions or GraphQL types, which will be added to resulting schema. Note that type extensions are always applied last, while types are defined in the order in which they are provided.

#### resolvers

`resolvers` accepts resolvers in same format as [makeExecutableSchema](./resolvers.html). It can also take an Array of resolvers. One addition to the resolver format is the possibility to specify a `fragment` for a resolver. The `fragment` must be a GraphQL fragment definition string, specifying which fields from the parent schema are required for the resolver to function properly.

```js
resolvers: {
  Booking: {
    property: {
      fragment: 'fragment BookingFragment on Booking { propertyId }',
      resolve(parent, args, context, info) {
        return mergeInfo.delegateToSchema({
          schema: bookingSchema,
          operation: 'query',
          fieldName: 'propertyById',
          args: {
            id: parent.propertyId,
          },
          context,
          info,
        });
      },
    },
  },
}
```

#### mergeInfo and delegateToSchema

The `info.mergeInfo` object provides the `delegateToSchema` method:

```js
type MergeInfo = {
  delegateToSchema<TContext>(options: IDelegateToSchemaOptions<TContext>): any;
}

interface IDelegateToSchemaOptions<TContext = {
    [key: string]: any;
}> {
    schema: GraphQLSchema;
    operation: Operation;
    fieldName: string;
    args?: {
        [key: string]: any;
    };
    context: TContext;
    info: GraphQLResolveInfo;
    transforms?: Array<Transform>;
}
```

As described in the documentation above, `info.mergeInfo.delegateToSchema` allows delegating to any `GraphQLSchema` object, optionally applying transforms in the process. See [Schema Delegation](./schema-delegation.html) and the [*Using with transforms*](#using-with-transforms) section of this document.

#### onTypeConflict

```js
type OnTypeConflict = (
  left: GraphQLNamedType,
  right: GraphQLNamedType,
  info?: {
    left: {
      schema?: GraphQLSchema;
    };
    right: {
      schema?: GraphQLSchema;
    };
  },
) => GraphQLNamedType;
```

The `onTypeConflict` option to `mergeSchemas` allows customization of type resolving logic.

The default behavior of `mergeSchemas` is to take the first encountered type of all the types with the same name. If there are conflicts, `onTypeConflict` enables explicit selection of the winning type.

For example, here's how we could select the last type among multiple types with the same name:

```js
const onTypeConflict = (left, right) => right;
```

And here's how we might select the type whose schema has the latest `version`:

```js
const onTypeConflict = (left, right, info) => {
  if (info.left.schema.version >= info.right.schema.version) {
    return left;
  } else {
    return right;
  }
}
```

When using schema transforms, `onTypeConflict` is often unnecessary, since transforms can be used to prevent conflicts before merging schemas. However, if you're not using schema transforms, `onTypeConflict` can be a quick way to make `mergeSchemas` produce more desirable results.
