---
title: Server-side caching
sidebar_title: Caching
description: Configure caching behavior on a per-field basis
---

You can cache Apollo Server query results in stores like Redis, Memcached, or an in-process cache. This can significantly improve response times for commonly executed queries.

However, when caching results, it's important to understand:

* Which fields of your schema can be cached safely
* How long a cached value should remain valid
* Whether a cached value is global or user-specific

These details can vary significantly, even among the fields of a single object type.

Apollo Server enables you to define cache control settings _per schema field_. You can do this [statically in your schema definition](#in-your-schema-static), or [dynamically in your resolvers](#in-your-resolvers-dynamic).

After you define these settings, Apollo Server can use them to [cache results in stores](#caching-a-response) like Redis or Memcached, or to [provide `Cache-Control` headers to your CDN](#serving-http-cache-headers-for-cdns).

> Apollo Server never caches empty responses or responses that contain GraphQL errors.


## Field settings

### In your schema (static)

Apollo Server defines the `@cacheControl` directive, which you can use in your schema to define caching behavior either for a single field, or for _all_ fields that return a particular type.

This directive accepts the following arguments:

| Name | Description |
|------|-------------|
| `maxAge` | The maximum amount of time the field's cached value is valid, in seconds. The default value is `0`, but you can [set a different default](#setting-the-default-maxage). |
| `scope` | If `PRIVATE`, the field's value is specific to a single user. The default value is `PUBLIC`. See also [Identifying users for `PRIVATE` responses](#identifying-users-for-private-responses). |

Use `@cacheControl` for fields that should always be cached with the same settings. If caching settings might change at runtime, instead use the [dynamic method](#in-your-resolvers-dynamic).

> **Important:** Apollo Server assigns each GraphQL response a `maxAge` according to the _lowest_ `maxAge` among included fields. For details, see [Response-level caching](#response-level-caching).

#### Field-level

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

* The value of a `Post`'s `votes` field is cached for a maximum of 30 seconds.
* The value of a `Post`'s `readByCurrentUser` field is cached for a maximum of 10 seconds, and its visibility is restricted to a single user.

#### Type-level

This example defines cache control settings for _all_ schema fields that return a `Post` object:

```graphql:title=schema.graphql
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

**Note that [field-level settings](#field-level-settings) override type-level settings.** In the following case, `Comment.post` is cached for a maximum of 120 seconds, _not_ 240 seconds:

```graphql:title=schema.graphql
type Comment {
  post: Post! @cacheControl(maxAge: 120)
  body: String!
}
```

### In your resolvers (dynamic)

You can decide how to cache a particular field's result _while_ you're resolving it. To support this, Apollo Server provides a `cacheControl` object in the [`info` parameter](../data/resolvers/#resolver-arguments) that's passed to every resolver.

The `cacheControl` object includes a `setCacheHint` method, which you call like so:


```javascript
const resolvers = {
  Query: {
    post: (_, { id }, _, info) => {
      info.cacheControl.setCacheHint({ maxAge: 60, scope: 'PRIVATE' });
      return find(posts, { id });
    }
  }
}
```

The `setCacheHint` method accepts an object with the same fields as [the `@cacheControl` directive](#in-your-schema-static).

> **If you're using TypeScript,** you need to add the following `import` statement to indicate that the `info` parameter includes a `cacheControl` field:
>
> ```javascript
> import 'apollo-cache-control';
> ```

### Default `maxAge`

By default, the following schema fields have a `maxAge` of `0` (meaning their values are _not_ cached unless you specify otherwise):

* All **root fields** (i.e., the fields of the `Query` and `Mutation` objects)
* Fields that return an object or interface type

Scalar fields inherit their default cache behavior (including `maxAge`) from their parent object type. This enables you to define cache behavior for _most_ scalars at the [type level](#type-level-settings), while overriding that behavior in individual cases at the [field level](#field-level-settings).

As a result of these defaults, **no schema fields are cached by default**.

#### Setting the default `maxAge`

You can set a default `maxAge` (instead of `0`) that's applied to every field that doesn't specify a different value.

> You should identify and address all exceptions to your default `maxAge` before you enable it in production, but this is a great way to get started with cache control.

Set your default `maxAge` in the `ApolloServer` constructor, like so:

```javascript
const server = new ApolloServer({
  // ...other options...
  cacheControl: {
    defaultMaxAge: 5, // 5 seconds
  },
}));
```

## Response-level caching

Although you configure caching behavior per _schema field_, Apollo Server caches data per _operation response_. In other words, the entirety of a GraphQL operation's response is cached as a single entity.

Because of this, Apollo Server uses the following logic to calculate a response's cache behavior:

* The response's `maxAge` is equal to the _lowest_ `maxAge` among _all_ fields included in the response.
    * Consequently, if _any_ queried field has a `maxAge` of `0`, the entire response is _not cached_.
* If _any_ queried field has a `scope` of `PRIVATE`, the _entire response_ is considered `PRIVATE` (i.e., restricted to a single user). Otherwise, it's considered `PUBLIC`.

## Setting up the cache

To set up your cache, you first import the `responseCachePlugin` and provide it to the `ApolloServer` constructor:

```javascript
import responseCachePlugin from 'apollo-server-plugin-response-cache';

const server = new ApolloServer({
  // ...other options...
  plugins: [responseCachePlugin()],
});
```

This plugin uses the same in-memory LRU cache as Apollo Server's other features. For environments with multiple server instances, you should instead use a shared cache backend, such as Memcached or Redis. For details, see [Using Memcached/Redis as a cache storage backend](../data/data-sources/#using-memcachedredis-as-a-cache-storage-backend).

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

In addition to the [`Cache-Control` HTTP header](#serving-http-cache-headers), the response cache plugin will also set the `Age` HTTP header to the number of seconds the value has been sitting in the cache.


## HTTP response headers

### `Age`

When Apollo Server returns a cached response to a client, the `responseCachePlugin` adds an `Age` header to the response. The header's value is the number of seconds the response has been in the cache.

### `Cache-Control` (for CDNs)

Whenever Apollo Server sends an operation response that has a non-zero `maxAge`, it includes a `Cache-Control` HTTP header that describes the response's cache policy. For example:

```
Cache-Control: max-age=60, private
```

If you run Apollo Server behind a CDN or another caching proxy, it can use this header's value to cache responses appropriately.

> Because CDNs and caching proxies only cache GET requests (not POST requests), we recommend using [automatic persisted queries](./apq/) with the [`useGETForHashedQueries` option](./apq/#) enabled.

#### Disabling `Cache-Control`

You can prevent Apollo Server from setting `Cache-Control` headers by setting `calculateHttpHeaders` to `false` in the `ApolloServer` constructor:

```js
const server = new ApolloServer({
  // ...other options...
  cacheControl: {
    calculateHttpHeaders: false,
  },
}));
```
