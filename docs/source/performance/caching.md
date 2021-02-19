---
title: Caching
description: Control server-side caching behavior on a per-field basis
---

Caching query results in Apollo Server can significantly improve response times for commonly executed queries.

However, when caching results, it's important to understand:

* Which fields of your schema can be cached
* How long a cached value should remain valid
* Whether a cached value is global or user-specific

These details can vary significantly, even between fields of a single type.

Apollo Server enables you to define cache control settings _per schema field_. You can do this [statically in your schema definition](#in-your-schema-static), or [dynamically in your resolvers](#in-your-resolvers-dynamic). Apollo Server combines _all_ of your defined settings to power its caching features, including:

* HTTP caching headers for CDNs and browsers
* A GraphQL full responses cache

## Control settings

### In your schema (static)

Apollo Server defines the `@cacheControl` directive, which you can use in your schema to define caching behavior for a single field, or for _all_ fields that return a particular _type_.

This directive accepts the following arguments:

| Name | Description |
|------|-------------|
| `maxAge` | The maximum amount of time the field's cached value is valid, in seconds. The default value is `0`, but you can [set a different default](#setting-a-default-maxage). |
| `scope` | If `PRIVATE`, cached values are specific to a single user. The default value is `PUBLIC`. |

Use `@cacheControl` for fields that should always be cached with the same settings. If caching settings might change at runtime, instead use the [dynamic method](#in-your-resolvers-dynamic).

#### Field-level settings

This example defines cache control settings for two fields of the `Post` type: `votes` and `readByCurrentUser`:

```graphql{5,7}:title=schema.graphql
type Post {
  id: ID!
  title: String
  author: Author
  votes: Int @cacheControl(maxAge: 30)
  comments: [Comment]
  readByCurrentUser: Boolean! @cacheControl(scope: PRIVATE)
}
```

In this example:

* The value of a `Post`'s `votes` field is cached for a maximum of 30 seconds.
* The value of a `Post`'s `readByCurrentUser` field can be cached _indefinitely_, but its visibility is limited to a single user.

#### Type-level settings

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

If this schema also defines a type with a field that returns a `Post` (or a list of `Post`s), that field's value is cached for a maximum of 240 seconds:

```graphql:title=schema.graphql
type Comment {
  post: Post! # Cached for up to 240 seconds
  body: String!
}
```

**Note that [field-level settings](#field-level-settings) override type-level settings.** In the following case, `Comment.post` is cached for 120 seconds, _not_ 240 seconds:

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

### Default behavior

By default, the following schema fields have a `maxAge` of `0` (meaning they are _not_ cached unless you specify otherwise):

* All root fields (i.e., the fields of the `Query` and `Mutation` objects)
* Fields that return an object or interface type

Scalar fields inherit their default cache behavior (including `maxAge`) from their parent object type. This enables you to define cache behavior for _most_ scalars at the [type level](#type-level-settings), while overriding that behavior in individual cases at the [field level](#field-level-settings).

#### Setting a default `maxAge`

The power of cache hints comes from being able to set them precisely to different values on different types and fields based on your understanding of your implementation's semantics. But when getting started with the cache control API, you might just want to apply the same `maxAge` to most of your resolvers.

You can achieve this by specifying a default max age when you create your `ApolloServer`. This max age will be used instead of 0 for root, object, and interface fields which don't explicitly set `maxAge` via schema hints (including schema hints on the type that they return) or the dynamic API. You can override this for a particular resolver or type by setting `@cacheControl(maxAge: 0)`. For example:

```javascript
const server = new ApolloServer({
  // ...
  cacheControl: {
    defaultMaxAge: 5,
  },
}));
```

### The overall cache policy

Apollo Server's cache API lets you declare fine-grained cache hints on specific resolvers. Apollo Server then combines these hints into an overall cache policy for the response. The `maxAge` of this policy is the minimum `maxAge` across all fields in your request. As [described above](#setting-a-default-maxage), the default `maxAge` of all root fields and non-scalar fields is 0, so the overall cache policy for a response will have `maxAge` 0 (ie, uncacheable) unless all root and non-scalar fields in the response have cache hints (or if `defaultMaxAge` is specified).

If the overall cache policy has a non-zero `maxAge`, its scope is `PRIVATE` if any hints have scope `PRIVATE`, and `PUBLIC` otherwise.

## Serving HTTP cache headers

For any response whose overall cache policy has a non-zero `maxAge`, Apollo Server will automatically set the `Cache-Control` HTTP response header to an appropriate value describing the `maxAge` and scope, such as `Cache-Control: max-age=60, private`.  If you run your Apollo Server instance behind a [CDN](https://en.wikipedia.org/wiki/Content_delivery_network) or other caching proxy, it can use this header's value to know how to cache your GraphQL responses.

As many CDNs and caching proxies only cache GET requests (not POST requests) and may have a limit on the size of a GET URL, you may find it helpful to use [automatic persisted queries](https://github.com/apollographql/apollo-link-persisted-queries), especially with the `useGETForHashedQueries` option to `apollo-link-persisted-queries`.

If you don't want to set HTTP cache headers, pass `cacheControl: {calculateHttpHeaders: false}` to `new ApolloServer()`.

## Saving full responses to a cache

Apollo Server lets you save cacheable responses to a Redis, Memcached, or in-process cache. Cached responses respect the `maxAge` cache hint.

To use the response cache, you need to install its plugin when you create your `ApolloServer`:

```javascript
import responseCachePlugin from 'apollo-server-plugin-response-cache';
const server = new ApolloServer({
  // ...
  plugins: [responseCachePlugin()],
});
```

By default, the response cache plugin will use the same cache used by other Apollo Server features, which defaults to an in-memory LRU cache. When running multiple server instances, you’ll want to use a shared cache backend such as Memcached or Redis instead.  See [the data sources documentation](/data/data-sources/#using-memcachedredis-as-a-cache-storage-backend) for details on how to customize Apollo Server's cache.  If you want to use a different cache backend for the response cache than for other Apollo Server caching features, just pass a `KeyValueCache` as the `cache` option to the `responseCachePlugin` function.

If you have data whose response should be cached separately for different users, set `@cacheControl(scope: PRIVATE)` hints on the data, and teach the cache control plugin how to tell your users apart by defining a `sessionId` hook:

```javascript
import responseCachePlugin from 'apollo-server-plugin-response-cache';
const server = new ApolloServer({
  // ...
  plugins: [responseCachePlugin({
    sessionId: (requestContext) => (requestContext.request.http.headers.get('sessionid') || null),
  })],
});
```

Responses whose overall cache policy scope is `PRIVATE` are shared only among sessions with the same session ID. Private responses are not cached if the `sessionId` hook is not defined or returns null.

Responses whose overall cache policy scope is `PUBLIC` are shared separately among all sessions with `sessionId` null and among all sessions with non-null `sessionId`.  Caching these separately allows you to have different caches for all logged-in users vs all logged-out users, if there is easily cacheable data that should only be visible to logged-in users.

Responses containing GraphQL errors or no data are never cached.

The plugin allows you to define a few more hooks to affect cache behavior for a specific request. All hooks take in a `GraphQLRequestContext`.

- `extraCacheKeyData`: this hook can return any JSON-stringifiable object which is added to the cache key. For example, if your API includes translatable text, this hook can return a string derived from `requestContext.request.http.headers.get('Accept-Language')`.
- `shouldReadFromCache`: if this hook returns false, the plugin will not read responses from the cache.
- `shouldWriteToCache`: if this hook returns false, the plugin will not write responses to the cache.

In addition to the [`Cache-Control` HTTP header](#serving-http-cache-headers), the response cache plugin will also set the `Age` HTTP header to the number of seconds the value has been sitting in the cache.
