---
title: Server-Side Caching
description: Configure caching behavior on a per-field basis
---

[Once enabled](#in-your-schema-static), Apollo Server lets you to define cache control settings (`maxAge` and `scope`) for each field in your schema:

```graphql {5,7}
type Post {
  id: ID!
  title: String
  author: Author
  votes: Int @cacheControl(maxAge: 30)
  comments: [Comment]
  readByCurrentUser: Boolean! @cacheControl(maxAge: 10, scope: PRIVATE)
}
```

When Apollo Server resolves an operation, it calculates the result's correct cache behavior based on the [_most restrictive_ settings](#calculating-cache-behavior) among the result's fields. You can then use this calculation to support any form of cache implementation you want, such as by providing it to your CDN via a `Cache-Control` header.

## Setting cache hints

You can define field-level cache hints [statically](#in-your-schema-static) in your schema definition or [dynamically](#in-your-resolvers-dynamic) in your resolvers (or both).

Note that when setting cache hints, it's important to understand:

- Which fields of your schema can be cached safely
- How long a cached value should remain valid
- Whether a cached value is global or user-specific

These details can vary significantly, even among the fields of a single object type.

### In your schema (static)

Apollo Server recognizes the `@cacheControl` directive, which you can use in your schema to define caching behavior either for a [single field](#field-level-definitions), or for _all_ fields that return a particular [type](#type-level-definitions).

**To use the `@cacheControl` directive, you must add the following definitions to your server's schema:**

```graphql
enum CacheControlScope {
  PUBLIC
  PRIVATE
}

directive @cacheControl(
  maxAge: Int
  scope: CacheControlScope
  inheritMaxAge: Boolean
) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION
```

If you don't add these definitions, Apollo Server throws an `Unknown directive "@cacheControl"` error on startup.

The `@cacheControl` directive accepts the following arguments:

| Name | Description |
|------|-------------|
| `maxAge` | The maximum amount of time the field's cached value is valid, in seconds. The default value is `0`, but you can [set a different default](#setting-a-different-default-maxage). |
| `scope` | If `PRIVATE`, the field's value is specific to a single user. The default value is `PUBLIC`. See also [Identifying users for `PRIVATE` responses](#identifying-users-for-private-responses). |
| `inheritMaxAge` | If `true`, this field inherits the `maxAge` of its parent field instead of using the [default `maxAge`](#setting-a-different-default-maxage). Do not provide `maxAge` if you provide this argument. |

Use `@cacheControl` for fields that should usually be cached with the same settings. If caching settings might change at runtime, you can use the [dynamic method](#in-your-resolvers-dynamic).

> **Important:** Apollo Server assigns each GraphQL response a `maxAge` equal to the _lowest_ `maxAge` among included fields. If any field has a `maxAge` of `0`, the response will not be cached at all.
>
> Similarly, Apollo Server sets a response's `scope` to `PRIVATE` if _any_ included field is `PRIVATE`.

#### Field-level definitions

This example defines cache control settings for two fields of the `Post` type: `votes` and `readByCurrentUser`:

```graphql {5,7} title="schema.graphql"
type Post {
  id: ID!
  title: String
  author: Author
  votes: Int @cacheControl(maxAge: 30)
  comments: [Comment]
  readByCurrentUser: Boolean! @cacheControl(maxAge: 10, scope: PRIVATE)
}
```

In this example:

- The value of the `votes` field is cached for a maximum of 30 seconds.
- The value of the `readByCurrentUser` field is cached for a maximum of 10 seconds, and its visibility is restricted to a single user.

#### Type-level definitions

This example defines cache control settings for _all_ schema fields that return a `Post` object:

```graphql {1} title="schema.graphql"
type Post @cacheControl(maxAge: 240) {
  id: Int!
  title: String
  author: Author
  votes: Int
  comments: [Comment]
  readByCurrentUser: Boolean!
}
```

If another object type in this schema includes a field of type `Post` (or a list of `Post`s), that field's value is cached for a maximum of 240 seconds:

```graphql title="schema.graphql"
type Comment {
  post: Post! # Cached for up to 240 seconds
  body: String!
}
```

**Note that [field-level settings](#field-level-definitions) override type-level settings.** In the following case, `Comment.post` is cached for a maximum of 120 seconds, _not_ 240 seconds:

```graphql title="schema.graphql"
type Comment {
  post: Post! @cacheControl(maxAge: 120)
  body: String!
}
```

### In your resolvers (dynamic)

You can decide how to cache a particular field's result _while_ you're resolving it. To support this, Apollo Server's [cache control plugin](../api/plugin/cache-control) provides a `cacheControl` object in the [`info` parameter](../data/resolvers/#resolver-arguments) that's passed to every resolver.

> If you set a field's cache hint in its resolver, it **overrides** any cache hint you [provided in your schema](#in-your-schema-static).

#### `cacheControl.setCacheHint`

The `cacheControl` object includes a `setCacheHint` method, which you call like so:

```ts
import { cacheControlFromInfo } from '@apollo/cache-control-types';

const resolvers = {
  Query: {
    post: (_, { id }, _, info) => {
      // Access ApolloServerPluginCacheControl's extension of the GraphQLResolveInfo object
      const cacheControl = cacheControlFromInfo(info)
      // highlight-start
      cacheControl.setCacheHint({ maxAge: 60, scope: 'PRIVATE' });
      // highlight-end
      return find(posts, { id });
    },
  },
};
```

The `setCacheHint` method accepts an object with `maxAge` and `scope` fields.

#### `cacheControl.cacheHint`

This object represents the field's current cache hint. Its fields include the following:

- The field's current `maxAge` and `scope` (which might have been set [statically](#in-your-schema-static))
- A `restrict` method, which is similar to `setCacheHint` but it can't _relax_ existing hint settings:

  ```ts
  import { cacheControlFromInfo } from '@apollo/cache-control-types';

  // Access ApolloServerPluginCacheControl's extension of the GraphQLResolveInfo object
  const cacheControl = cacheControlFromInfo(info)

  // If we call this first...
  cacheControl.setCacheHint({ maxAge: 60, scope: 'PRIVATE' });

  // ...then this changes maxAge (more restrictive) but NOT scope (less restrictive)
  cacheControl.cacheHint.restrict({ maxAge: 30, scope: 'PUBLIC' });
  ```

#### `cacheControl.cacheHintFromType`

This method enables you to get the default cache hint for a particular object type. This can be useful when resolving a union or interface field, which might return one of multiple object types.

### Calculating cache behavior

For security, each operation response's cache behavior is calculated based on the _most restrictive_ cache hints among the result's fields:

- The response's `maxAge` equals the lowest `maxAge` among all fields. If that value is `0`, the entire result is _not_ cached.
- The response's `scope` is `PRIVATE` if _any_ field's `scope` is `PRIVATE`.

### Default `maxAge`

By default, the following schema fields have a `maxAge` of `0` _if you don't specify one_:

- **Root fields** (i.e., the fields of the `Query`, `Mutation`, and `Subscription` types)
  - Because _every_ GraphQL operation includes a root field, this means that by default, **no operation results are cached unless you set cache hints!**
- **Fields that return a non-scalar type** (object, interface, or union) or a list of non-scalar types.

You can [customize this default](#setting-a-different-default-maxage).

All other schema fields (i.e., **non-root fields that return scalar types**) instead inherit their default `maxAge` from their parent field.

#### Why are these the `maxAge` defaults?

Our philosophy behind Apollo Server caching is that a response should only be considered cacheable if every part of that response _opts in_ to being cacheable. At the same time, we don't think developers should have to specify cache hints for every single field in their schema.

So, we follow these heuristics:

- Root field resolvers are extremely likely to fetch data (because these fields have no parent), so we set their default `maxAge` to `0` to avoid automatically caching data that _shouldn't_ be cached.
- Resolvers for other non-scalar fields (objects, interfaces, and unions) _also_ commonly fetch data because they contain arbitrarily many fields. Consequently, we also set their default `maxAge` to `0`.
- Resolvers for scalar, non-root fields _rarely_ fetch data and instead usually populate data via the `parent` argument. Consequently, these fields inherit their default `maxAge` from their parent to reduce schema clutter.

Of course, these heuristics aren't always correct! For example, the resolver for a non-root scalar field might indeed fetch remote data. You can always set your own cache hint for any field with an undesirable default behavior.

Ideally, you can provide a `maxAge` for every field with a resolver that actually fetches data from a data source (such as a database or REST API). _Most_ other fields can then inherit their cache hint from their parent (fields with resolvers that _don't_ fetch data less commonly have specific caching needs). For more on this, see [Recommended starting usage](#recommended-starting-usage).

#### Setting a different default `maxAge`

You can set a default `maxAge` that's applied to fields that otherwise receive the [default `maxAge` of `0`](#default-maxage).

> You should identify and address all exceptions to your default `maxAge` before you enable it in production, but this is a great way to get started with cache control.

Set your default `maxAge` by passing the cache control plugin to the `ApolloServer` constructor, like so:

```ts
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';

const server = new ApolloServer({
  // ...other options...
  plugins: [ApolloServerPluginCacheControl({ defaultMaxAge: 5 })],  // 5 seconds
});
```

### Recommended starting usage

You usually don't need to specify cache hints for every field in your schema. Instead, we recommend doing the following as a starting point:

- For fields that should _never_ be cached, explicitly set `maxAge` to `0`.

- Set a `maxAge` for every field with a resolver that _actually fetches data from a data source_ (such as a database or REST API). You can base the value of `maxAge` on the frequency of updates that are made to the relevant data.

- Set `inheritMaxAge: true` for each other non-root field that returns a non-scalar type.

  - Note that you can only set `inheritMaxAge` [statically](#in-your-schema-static).

### Example `maxAge` calculations

Consider the following schema:

```graphql
type Query {
  book: Book
  cachedBook: Book @cacheControl(maxAge: 60)
  reader: Reader @cacheControl(maxAge: 40)
}

type Book {
  title: String
  cachedTitle: String @cacheControl(maxAge: 30)
}

type Reader {
  book: Book @cacheControl(inheritMaxAge: true)
}
```

Let's look at some queries and their resulting `maxAge` values:

```graphql
# maxAge: 0
# Query.book doesn't set a maxAge and it's a root field (default 0).
query GetBookTitle {
  book { # 0
    cachedTitle # 30
  }
}

# maxAge: 60
# Query.cachedBook has a maxAge of 60, and Book.title is a scalar, so it
# inherits maxAge from its parent by default.
query GetCachedBookTitle {
  cachedBook { # 60
    title # inherits
  }
}

# maxAge: 30
# Query.cachedBook has a maxAge of 60, but Book.cachedTitle has
# a maxAge of 30.
query GetCachedBookCachedTitle {
  cachedBook { # 60
    cachedTitle # 30
  }
}

# maxAge: 40
# Query.reader has a maxAge of 40. Reader.Book is set to
# inheritMaxAge from its parent, and Book.title is a scalar
# that inherits maxAge from its parent by default.
query GetReaderBookTitle {
  reader { # 40
    book { # inherits
      title # inherits
    }
  }
}
```

## Using with Federation

> Using cache control with Apollo Federation requires v0.1.0 of `@apollo/subgraph` (previously v0.28 of `@apollo/federation`) in your subgraph, v0.36 of `@apollo/gateway` in your Gateway, and v3.0.2 of Apollo Server in both servers.

When using [Apollo Federation](/federation), the `@cacheControl` directive and `CacheControlScope` enum may be defined in a subgraph's schema. An Apollo Server-based subgraph will calculate and set the cache hint for the response that it sends to the gateway as it would for a non-federated Apollo Server sending a response to a client. The gateway will then calculate the cache hint for the overall response based on the most restrictive settings among all of the responses received from the subgraphs involved in query plan execution.

### Setting entity cache hints

Subgraph schemas contain an `_entities` root field on the `Query` type, so all query plans that require entity resolution will have a [`maxAge` of `0` set by default](#default-maxage). To override this default behavior, you can add a `@cacheControl` directive to an entity's definition:

```graphql
type Book @key(fields: "isbn") @cacheControl(maxAge: 30) {
  isbn: String!
  title: String
}
```

When the `_entities` field is resolved it will check the applicable concrete type for a cache hint (which would be the `Book` type in the example above) and apply that hint instead.

To set cache hints dynamically, the [`cacheControl` object and its methods](#in-your-resolvers-dynamic) are also available in the `info` parameter of the `__resolveReference` resolver.

### Overriding subgraph cache hints in the gateway

If a subgraph does not specify a `max-age`, the gateway will assume its response (and
in turn, the overall response) cannot be cached. To override this behavior, you can set the `Cache-Control` header in the `didReceiveResponse` method of a `RemoteGraphQLDataSource`.

Additionally, if the gateway should ignore `Cache-Control` response headers from subgraphs that will affect the operation's cache policy, then you can set the `honorSubgraphCacheControlHeader` property of a `RemoteGraphQLDataSource` to `false` (this value is `true` by default):

```ts
const gateway = new ApolloGateway({
  // ...
  buildService({ url }) {
    return new RemoteGraphQLDataSource({
      url,
      honorSubgraphCacheControlHeader: false;
    });
  }
});
```

The effect of setting `honorSubgraphCacheControlHeader` to `false` is to have no impact on the cacheability of the response in either direction. In other words, this property won’t determine whether the response can be cached, but it does exclude a subgraph's `Cache-Control` header from consideration in the gateway's calculation. If all subgraphs are excluded from consideration when calculating the overall `Cache-Control` header, the response sent to the client will not be cached.

## Caching with a CDN

By default, Apollo Server sends a `Cache-Control` header with all responses that describes the response's cache policy.

When the response is cacheable, the header has this format:

```
Cache-Control: max-age=60, private
```

When the response is not cacheable, the header has the value `Cache-Control: no-store`.

To be cacheable, all of the following must be true:
- The operation has a non-zero `maxAge`.
- The operation has a single response rather than an [incremental delivery](../workflow/requests#incremental-delivery-experimental) response.
- There are no errors in the response.

If you run Apollo Server behind a CDN or another caching proxy, you can configure it to use this header's value to cache responses appropriately. See your CDN's documentation for details (for example, here's the [documentation for Amazon CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html#expiration-individual-objects)).

Some CDNs require custom headers for caching or custom values in the `cache-control` header like `s-maxage`. You can configure your `ApolloServer` instance accordingly by telling the built-in cache control plugin to just calculate a policy without setting HTTP headers, and specifying your own [plugin](../integrations/plugins):

```ts
new ApolloServer({
  plugins: [
    ApolloServerPluginCacheControl({ calculateHttpHeaders: false }),
    {
      async requestDidStart() {
        return {
          async willSendResponse(requestContext) {
            const { response, overallCachePolicy } = requestContext;
            const policyIfCacheable = overallCachePolicy.policyIfCacheable();
            if (policyIfCacheable && !response.headers && response.http) {
              response.http.headers.set(
                'cache-control',
                // ... or the values your CDN recommends
                `max-age=0, s-maxage=${
                  overallCachePolicy.maxAge
                }, ${policyIfCacheable.scope.toLowerCase()}`,
              );
            }
          },
        };
      },
    },
  ],
});
```

### Using GET requests

Because CDNs and caching proxies only cache GET requests (not POST requests, which Apollo Client sends for all operations by default), we recommend enabling [automatic persisted queries](./apq/) and the [`useGETForHashedQueries` option](./apq/) in Apollo Client.

Alternatively, you can set the `useGETForQueries` option of [HttpLink](/react/api/link/apollo-link-http) in your `ApolloClient` instance. However, most browsers enforce a size limit on GET requests, and large query strings might exceed this limit.

## Disabling cache control

You can prevent Apollo Server from setting `Cache-Control` headers by installing the `ApolloServerPluginCacheControl` plugin yourself and setting `calculateHttpHeaders` to `false`:

```ts
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';

const server = new ApolloServer({
  // ...other options...
  plugins: [ApolloServerPluginCacheControl({ calculateHttpHeaders: false })],
});
```

If you do this, the cache control plugin still calculates caching behavior for each operation response. You can then use this information with other plugins (like the [response cache plugin](#caching-with-responsecacheplugin-advanced)).

To disable cache control calculations entirely, instead install the `ApolloServerPluginCacheControlDisabled` plugin (this plugin has no effect other than preventing the cache control plugin from being installed):

```ts
import { ApolloServerPluginCacheControlDisabled } from '@apollo/server/plugin/disabled';

const server = new ApolloServer({
  // ...other options...
  plugins: [ApolloServerPluginCacheControlDisabled()],
});
```

## Caching with `responseCachePlugin` (advanced)

You can cache Apollo Server query responses in stores like Redis, Memcached, or Apollo Server's default in-memory cache. For more information, see [Configuring cache backends](./cache-backends).

### In-memory cache setup

To set up your in-memory response cache, you first import the `responseCachePlugin` and provide it to the `ApolloServer` constructor:

```ts
import responseCachePlugin from '@apollo/server-plugin-response-cache';

const server = new ApolloServer({
  // ...other options...
  plugins: [responseCachePlugin()],
});
```

On initialization, this plugin automatically begins caching responses according to [field settings](#in-your-schema-static).

The plugin uses the same in-memory LRU cache as Apollo Server's other features. For environments with multiple server instances, you might instead want to use a shared cache backend, such as [Memcached or Redis](./cache-backends#configuring-external-caching).

> In addition to the [`Cache-Control` HTTP header](#caching-with-a-cdn), the `responseCachePlugin` also sets the `Age` HTTP header to the number of seconds the returned value has been in the cache.

### Memcached/Redis setup

See [Configuring external caching](./cache-backends#configuring-external-caching).

> You can also [implement your own cache backend](./cache-backends#implementing-your-own-cache-backend).

### Identifying users for `PRIVATE` responses

If a cached response has a [`PRIVATE` scope](#in-your-schema-static), its value is accessible by only a single user. To enforce this restriction, the cache needs to know how to _identify_ that user.

To enable this identification, you provide a `sessionId` function to your `responseCachePlugin`, like so:

```ts
import responseCachePlugin from '@apollo/server-plugin-response-cache';
const server = new ApolloServer({
  // ...other settings...
  plugins: [
    responseCachePlugin({
      sessionId: (requestContext) =>
        requestContext.request.http.headers.get('session-id') || null,
    }),
  ],
});
```

> **Important:** If you don't define a `sessionId` function, `PRIVATE` responses are not cached at all.

The cache uses the return value of this function to identify the user who can later access the cached `PRIVATE` response. In the example above, the function uses a `session-id` header from the original operation request.

If a client later executes the exact same query _and_ has the same identifier, Apollo Server returns the `PRIVATE` cached response if it's still available.

### Separating responses for logged-in and logged-out users

By default, `PUBLIC` cached responses are accessible by all users. However, if you define a `sessionId` function ([as shown above](#identifying-users-for-private-responses)), Apollo Server caches up to _two versions_ of each `PUBLIC` response:

- One version for users with a **null `sessionId`**
- One version for users with a **non-null `sessionId`**

This enables you to cache different responses for logged-in and logged-out users. For example, you might want your page header to display different menu items depending on a user's logged-in status.

### Configuring reads and writes

In addition to [the `sessionId` function](#identifying-users-for-private-responses), you can provide the following functions to your `responseCachePlugin` to configure cache reads and writes. Each of these functions takes a `GraphQLRequestContext` (representing the incoming operation) as a parameter.

| Function | Description |
|----------|-------------|
| `extraCacheKeyData` | This function's return value (any JSON-stringifiable object) is added to the key for the cached response. For example, if your API includes translatable text, this function can return a string derived from `requestContext.request.http.headers.get('accept-language')`. |
| `shouldReadFromCache` | If this function returns `false`, Apollo Server _skips_ the cache for the incoming operation, even if a valid response is available. |
| `shouldWriteToCache` | If this function returns `false`, Apollo Server doesn't cache its response for the incoming operation, even if the response's `maxAge` is greater than `0`. |
| `generateCacheKey` | Customize generation of the cache key. By default, this is the SHA256 hash of the JSON encoding of an object containing relevant data. |
