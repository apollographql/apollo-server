---
title: Server-side caching
sidebar_title: Caching
description: Configure caching behavior on a per-field basis
---

> **New in Apollo Server 3**: You must manually define the `@cacheControl` directive in your schema to use static cache hints. [See below.](#in-your-schema-static)

> Note: Apollo Federation doesn't currently support @cacheControl out-of-the-box. There is [an issue](https://github.com/apollographql/federation/issues/356) on the Federation repo which discusses this and proposes possible workarounds.

Apollo Server enables you to define cache control settings (`maxAge` and `scope`) for each field in your schema:

```graphql{5,7}
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

You can define field-level cache hints [statically](#in-your-schema-static)  in your schema definition or [dynamically](#in-your-resolvers-dynamic) in your resolvers (or both).

Note that when setting cache hints, it's important to understand:

* Which fields of your schema can be cached safely
* How long a cached value should remain valid
* Whether a cached value is global or user-specific

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

```graphql{5,7}:title=schema.graphql
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

* The value of the `votes` field is cached for a maximum of 30 seconds.
* The value of the `readByCurrentUser` field is cached for a maximum of 10 seconds, and its visibility is restricted to a single user.

#### Type-level definitions

This example defines cache control settings for _all_ schema fields that return a `Post` object:

```graphql{1}:title=schema.graphql
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

```graphql:title=schema.graphql
type Comment {
  post: Post! # Cached for up to 240 seconds
  body: String!
}
```

**Note that [field-level settings](#field-level-definitions) override type-level settings.** In the following case, `Comment.post` is cached for a maximum of 120 seconds, _not_ 240 seconds:

```graphql:title=schema.graphql
type Comment {
  post: Post! @cacheControl(maxAge: 120)
  body: String!
}
```

### In your resolvers (dynamic)

You can decide how to cache a particular field's result _while_ you're resolving it. To support this, Apollo Server provides a `cacheControl` object in the [`info` parameter](../data/resolvers/#resolver-arguments) that's passed to every resolver.

> If you set a field's cache hint in its resolver, it **overrides** any cache hint you [provided in your schema](#in-your-schema-static).

#### `cacheControl.setCacheHint`

The `cacheControl` object includes a `setCacheHint` method, which you call like so:


```js{4}
const resolvers = {
  Query: {
    post: (_, { id }, _, info) => {
      info.cacheControl.setCacheHint({ maxAge: 60, scope: 'PRIVATE' });
      return find(posts, { id });
    }
  }
}
```

The `setCacheHint` method accepts an object with `maxAge` and `scope` fields.

#### `cacheControl.cacheHint`

This object represents the field's current cache hint. Its fields include the following:

* The field's current `maxAge` and `scope` (which might have been set [statically](#in-your-schema-static))
* A `restrict` method, which is similar to `setCacheHint` but it can't _relax_ existing hint settings:

    ```js
    // If we call this first...
    info.cacheControl.setCacheHint({ maxAge: 60, scope: 'PRIVATE' });

    // ...then this changes maxAge (more restrictive) but NOT scope (less restrictive)
    info.cacheControl.cacheHint.restrict({ maxAge: 30, scope: 'PUBLIC'});
    ```

#### `cacheControl.cacheHintFromType`

This method enables you to get the default cache hint for a particular object type. This can be useful when resolving a union or interface field, which might return one of multiple object types.

### Calculating cache behavior

For security, each operation response's cache behavior is calculated based on the _most restrictive_ cache hints among the result's fields:

* The response's `maxAge` equals the lowest `maxAge` among all fields. If that value is `0`, the entire result is _not_ cached.
* The response's `scope` is `PRIVATE` if _any_ field's `scope` is `PRIVATE`.

### Default `maxAge`

By default, the following schema fields have a `maxAge` of `0` _if you don't specify one_:

* **Root fields** (i.e., the fields of the `Query`, `Mutation`, and `Subscription` types)
  * Because _every_ GraphQL operation includes a root field, this means that by default, **no operation results are cached unless you set cache hints!**
* **Fields that return a non-scalar type** (object, interface, or union) or a list of non-scalar types.

You can [customize this default](#setting-a-different-default-maxage).

All other schema fields (i.e., **non-root fields that return scalar types**) instead inherit their default `maxAge` from their parent field.

#### Why are these the `maxAge` defaults?

Our philosophy behind Apollo Server caching is that a response should only be considered cacheable if every part of that response _opts in_ to being cacheable. At the same time, we don't think developers should have to specify cache hints for every single field in their schema.

So, we follow these heuristics:

* Root field resolvers are extremely likely to fetch data (because these fields have no parent), so we set their default `maxAge` to `0` to avoid automatically caching data that _shouldn't_ be cached.
* Resolvers for other non-scalar fields (objects, interfaces, and unions) _also_ commonly fetch data because they contain arbitrarily many fields. Consequently, we also set their default `maxAge` to `0`.
* Resolvers for scalar, non-root fields _rarely_ fetch data and instead usually populate data via the `parent` argument. Consequently, these fields inherit their default `maxAge` from their parent to reduce schema clutter.

Of course, these heuristics aren't always correct! For example, the resolver for a non-root scalar field might indeed fetch remote data. You can always set your own cache hint for any field with an undesirable default behavior.

Ideally, you can provide a `maxAge` for every field with a resolver that actually fetches data from a data source (such as a database or REST API). _Most_ other fields can then inherit their cache hint from their parent (fields with resolvers that _don't_ fetch data less commonly have specific caching needs). For more on this, see [Recommended starting usage](#recommended-starting-usage).

#### Setting a different default `maxAge`

You can set a default `maxAge` that's applied to fields that otherwise receive the [default `maxAge` of `0`](#default-maxage).

> You should identify and address all exceptions to your default `maxAge` before you enable it in production, but this is a great way to get started with cache control.

Set your default `maxAge` by passing the cache control plugin to the `ApolloServer` constructor, like so:

```javascript
import { ApolloServerPluginCacheControl } from 'apollo-server-core';

const server = new ApolloServer({
  // ...other options...
  plugins: [ApolloServerPluginCacheControl({ defaultMaxAge: 5 })],  // 5 seconds
}));
```

### Recommended starting usage

You usually don't need to specify cache hints for every field in your schema. Instead, we recommend doing the following as a starting point:

* For fields that should _never_ be cached, explicitly set `maxAge` to `0`.

* Set a `maxAge` for every field with a resolver that _actually fetches data from a data source_ (such as a database or REST API). You can base the value of `maxAge` on the frequency of updates that are made to the relevant data.

* Set `inheritMaxAge: true` for each other non-root field that returns a non-scalar type.

    * Note that you can only set `inheritMaxAge` [statically](#in-your-schema-static).

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
  book {        # 0
    cachedTitle # 30
  }
}

# maxAge: 60
# Query.cachedBook has a maxAge of 60, and Book.title is a scalar, so it
# inherits maxAge from its parent by default.
query GetCachedBookTitle {
  cachedBook { # 60
    title      # inherits
  }
}

# maxAge: 30
# Query.cachedBook has a maxAge of 60, but Book.cachedTitle has
# a maxAge of 30.
query GetCachedBookCachedTitle {
  cachedBook {  # 60
    cachedTitle # 30
  }
}

# maxAge: 40
# Query.reader has a maxAge of 40. Reader.Book is set to
# inheritMaxAge from its parent, and Book.title is a scalar
# that inherits maxAge from its parent by default.
query GetReaderBookTitle {
  reader {  # 40
    book {  # inherits
      title # inherits
    }
  }
}
```

## Caching with a CDN

Whenever Apollo Server sends an operation response that has a non-zero `maxAge`, it includes a `Cache-Control` HTTP header that describes the response's cache policy.

The header has this format:

```
Cache-Control: max-age=60, private
```

If you run Apollo Server behind a CDN or another caching proxy, you can configure it to use this header's value to cache responses appropriately. See your CDN's documentation for details (for example, here's the [documentation for Amazon CloudFront](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html#expiration-individual-objects)).

### Using GET requests

Because CDNs and caching proxies only cache GET requests (not POST requests, which Apollo Client sends for all operations by default), we recommend enabling [automatic persisted queries](./apq/) and the [`useGETForHashedQueries` option](./apq/) in Apollo Client.

Alternatively, you can set the `useGETForQueries` option of [HttpLink](https://www.apollographql.com/docs/react/api/link/apollo-link-http) in your `ApolloClient` instance, but **this may be less secure** because your query string and GraphQL variables are sent as plaintext URL query parameters which are more likely to be saved in logs by some server or proxy between the user and your GraphQL server.  FIXME I tried to improve this but it still doesn't make that much sense because `useGETForHashedQueries` certainly puts variables in the URL... I think the real reason to avoid useGETForQueries is that GETs have a length limit!

## Disabling cache control

You can prevent Apollo Server from setting `Cache-Control` headers by installing the `ApolloServerPluginCacheControl` plugin yourself and setting `calculateHttpHeaders` to `false`:

```js
import { ApolloServerPluginCacheControl } from 'apollo-server-core';

const server = new ApolloServer({
  // ...other options...
  plugins: [ApolloServerPluginCacheControl({ calculateHttpHeaders: false })],
}));
```

If you do this, the cache control plugin still calculates caching behavior for each operation response. You can then use this information with other plugins (like the [response cache plugin](#caching-with-responsecacheplugin-advanced)).

To disable cache control calculations entirely, instead install the `ApolloServerPluginCacheControlDisabled` plugin (this plugin has no effect other than preventing the cache control plugin from being installed):

```js
import { ApolloServerPluginCacheControlDisabled } from 'apollo-server-core';

const server = new ApolloServer({
  // ...other options...
  plugins: [ApolloServerPluginCacheControlDisabled()],
}));
```
## Caching with `responseCachePlugin` (advanced)

You can cache Apollo Server query responses in stores like Redis, Memcached, or Apollo Server's in-memory cache.

### In-memory cache setup

To set up your in-memory response cache, you first import the `responseCachePlugin` and provide it to the `ApolloServer` constructor:

```javascript
import responseCachePlugin from 'apollo-server-plugin-response-cache';

const server = new ApolloServer({
  // ...other options...
  plugins: [responseCachePlugin()],
});
```

On initialization, this plugin automatically begins caching responses according to [field settings](#in-your-schema-static).

The plugin uses the same in-memory LRU cache as Apollo Server's other features. For environments with multiple server instances, you might instead want to use a shared cache backend, such as [Memcached or Redis](#memcachedredis-setup).

>In addition to the [`Cache-Control` HTTP header](#caching-with-a-cdn), the `responseCachePlugin` also sets the `Age` HTTP header to the number of seconds the returned value has been in the cache.

### Memcached/Redis setup

See [Using Memcached/Redis as a cache storage backend](../data/data-sources/#using-memcachedredis-as-a-cache-storage-backend).

> You can also [implement your own cache backend](../data/data-sources/#implementing-your-own-cache-backend).


### Identifying users for `PRIVATE` responses

If a cached response has a [`PRIVATE` scope](#in-your-schema-static), its value is accessible by only a single user. To enforce this restriction, the cache needs to know how to _identify_ that user.

To enable this identification, you provide a `sessionId` function to your `responseCachePlugin`, like so:

```javascript
import responseCachePlugin from 'apollo-server-plugin-response-cache';
const server = new ApolloServer({
  // ...other settings...
  plugins: [responseCachePlugin({
    sessionId: (requestContext) => (requestContext.request.http.headers.get('sessionid') || null),
  })],
});
```

> **Important:** If you don't define a `sessionId` function, `PRIVATE` responses are not cached at all.

The cache uses the return value of this function to identify the user who can later access the cached `PRIVATE` response. In the example above, the function uses a `sessionid` header from the original operation request.

If a client later executes the exact same query _and_ has the same identifier, Apollo Server returns the `PRIVATE` cached response if it's still available.

### Separating responses for logged-in and logged-out users

By default, `PUBLIC` cached responses are accessible by all users. However, if you define a `sessionId` function ([as shown above](#identifying-users-for-private-responses)), Apollo Server caches up to _two versions_ of each `PUBLIC` response:

* One version for users with a **null `sessionId`**
* One version for users with a **non-null `sessionId`**

This enables you to cache different responses for logged-in and logged-out users. For example, you might want your page header to display different menu items depending on a user's logged-in status.

### Configuring reads and writes

In addition to [the `sessionId` function](#identifying-users-for-private-responses), you can provide the following functions to your `responseCachePlugin` to configure cache reads and writes. Each of these functions takes a `GraphQLRequestContext` (representing the incoming operation) as a parameter.

| Function | Description |
|----------|-------------|
| `extraCacheKeyData` | This function's return value (any JSON-stringifiable object) is added to the key for the cached response. For example, if your API includes translatable text, this function can return a string derived from `requestContext.request.http.headers.get('Accept-Language')`. |
| `shouldReadFromCache` | If this function returns `false`, Apollo Server _skips_ the cache for the incoming operation, even if a valid response is available. |
| `shouldWriteToCache` | If this function returns `false`, Apollo Server doesn't cache its response for the incoming operation, even if the response's `maxAge` is greater than `0`. |
