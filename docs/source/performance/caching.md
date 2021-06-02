---
title: Server-side caching
sidebar_title: Caching
description: Configure caching behavior on a per-field basis
---

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

 When Apollo Server resolves an operation, it calculates the result's correct cache behavior based on the _most restrictive_ settings among the result's fields. You can then use this calculation to support any form of cache implementation you want, such as by providing it to your CDN via a `Cache-Control` header.

You can define field-level cache settings [statically in your schema definition](#in-your-schema-static) (as shown above) or [dynamically in your resolvers](#in-your-resolvers-dynamic).

## Field settings

When caching operation results, it's important to understand:

* Which fields of your schema can be cached safely
* How long a cached value should remain valid
* Whether a cached value is global or user-specific

These details can vary significantly, even among the fields of a single object type. You can specify these details statically in your schema definition or dynamically in your resolvers.

### In your schema (static)

Apollo Server recognizes the `@cacheControl` directive, which you can use in your schema to define caching behavior either for a [single field](#field-level-definitions), or for _all_ fields that return a particular [type](#type-level-definitions).

In order to use the directive in your schema, you need to define it, as well as the enum that is used for one of its arguments; otherwise you will get an error like `Unknown directive "@cacheControl"`. (Older versions of Apollo Server used to automatically insert the definitions in some inconsistent situations; Apollo Server 3 consistently expects you to define them yourself.) Just include the following in your schema file:

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

The `@cacheControl` directive accepts the following arguments:

| Name | Description |
|------|-------------|
| `maxAge` | The maximum amount of time the field's cached value is valid, in seconds. The default value is `0`, but you can [set a different default](#setting-the-default-maxage). |
| `scope` | If `PRIVATE`, the field's value is specific to a single user. The default value is `PUBLIC`. See also [Identifying users for `PRIVATE` responses](#identifying-users-for-private-responses). |
| `inheritMaxAge` | If `true`, inherits the `maxAge` from its parent field. This means that non-root fields returning objects, interfaces, or unions that do not specify `maxAge` in some other way does not have the [default `maxAge`](#setting-the-default-maxage) applied. Do not combine this with `maxAge` in the same directive. |

Use `@cacheControl` for fields that should always be cached with the same settings. If caching settings might change at runtime, instead use the [dynamic method](#in-your-resolvers-dynamic).

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

* The value of a `Post`'s `votes` field is cached for a maximum of 30 seconds.
* The value of a `Post`'s `readByCurrentUser` field is cached for a maximum of 10 seconds, and its visibility is restricted to a single user.

#### Type-level definitions

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

**Note that [field-level settings](#field-level-definitions) override type-level settings.** In the following case, `Comment.post` is cached for a maximum of 120 seconds, _not_ 240 seconds:

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

The `cacheControl` object also has a `cacheHint` field which returns the field's current hint. This object also has a few other helpful methods, such as `info.cacheControl.cacheHint.restrict({ maxAge, scope })` which is similar to `setCacheHint` but it will never make `maxAge` larger or change `scope` from `PRIVATE` to `PUBLIC`. There is also a function `info.cacheControl.cacheHintFromType()` which takes an object type from a GraphQL AST and returns a cache hint which can be passed to `setCacheHint` or `restrict`; it may be useful for implementing resolvers that return unions or interfaces.

### Root and composite-type fields are not cachable by default

The general philosophy behind `@cacheControl` is that we should only consider a response to be cachable if we have been told that each piece of it is cachable; we never assume that anything is cachable by default. However, we don't want you to have to specify cache hints for every single field in your entire schema. Ideally, you would specify a cache hint on every field whose resolver reads from a data source such as a database or REST API, based on how long you'd like to cache that particular read operation; fields whose resolvers just read in-memory data fetched by a parent resolver (including the default resolver) don't have a particularly interesting cache policy.

So we follow the following heuristic. By default, the following schema fields have a `maxAge` of `0` (meaning their values are _not_ cached unless you specify otherwise):

* All **root fields** (i.e., the fields of the `Query` and `Mutation` objects). Because their parent objects have no data, we guess that they are likely to be doing some sort of non-trivial read operation.
* Fields that **return a composite type** (object, interface, or union), possibly wrapped inside one or more layers of "list of" and "non-null". Our heuristic assumes that these fields (fields with their own sub-fields) are likely to involve a non-trivial read operation, whereas scalar fields are more likely to contain data read in a parent resolver.

Non-root scalar fields inherit their default cache behavior (including `maxAge`) from their parent object type. This enables you to define cache behavior for _most_ scalars at the [type level](#type-level-definitions), while overriding that behavior in individual cases at the [field level](#field-level-definitions).

As a result of these defaults, **no schema fields are cached by default**.

These heuristics aren't always correct. If a (non-root) scalar field does actually perform a read operation with a different cachability from its parent, you can specify a cache hint on it to override the default assumption that non-root scalar fields inherit their parent's cache policy. And if a field returns an object type just as a way of organizing data and not because it's performing a read operation, you can set `@cacheControl(inheritMaxAge: true)` on the field or its return type; in this case, the default `maxAge` of 0 will not be applied. (Setting `@cacheControl(inheritMaxAge: true)` on a root field has no effect. `inheritMaxAge: true` cannot be specified via `info.cacheControl`.) Note that if you specify `@cacheControl(inheritMaxAge: true)` on a type, you may still specify `maxAge` on a field returning that type, which will take effect; and you can specify `maxAge` via `info.cacheControl` even on fields/types with `inheritMaxAge: true`.

For example, given the following schema:

```graphql
type Query {
  foo: Foo
  cachedFoo: @cacheControl(maxAge: 60)
  intermediate: Intermediate @cacheControl(maxAge: 40)
}
type Foo {
  inheritingField: String
  cachedField: String @cacheControl(maxAge: 30)
}
type Intermediate {
  foo: Foo @cacheControl(inheritMaxAge: true)
}
```

Then the following queries will have the given `maxAge` values:

| Query | `maxAge` | Explanation |
|-------|----------|-------------|
|`{foo{cachedField}}`|0|is a root field (and an object-typed field) with no `maxAge` and it does not set `maxAge` dynamically, so it defaults to 0. It does not matter that `cachedField` has a `maxAge`.|
|`{cachedFoo{inheritingField}}`|60|`cachedFoo` has a `maxAge` of 60; this means `inheritingField` can follow the normal scalar field rules and not affect `maxAge`.|
|`{cachedFoo{cachedField}}`|30|`cachedFoo` has a `maxAge` of 60 and `cachedField` has a `maxAge` of 30; we take the most restrictive value, 30.|
|`{intermediate{foo{inheritingField}}}`|40|`intermediate` sets its `maxAge` to 40. `Intermediate.foo` has `inheritMaxAge` so it does not affect the cache policy. `Foo.uncachedField` is a scalar so it inherits the `maxAge` from its parent, and thus indirectly from its grandparent: 40.|


#### Setting the default `maxAge`

You can set a default `maxAge` that's applied to the fields that would otherwise receive the default `maxAge` of `0`. That is: fields that don't explicitly specify `maxAge` via `@cacheControl` on the field or the type they return or via `info.cacheControl`, and which are either root fields, or fields that return a composite (object, interface, or union) type and do not have `@cacheControl(inheritMaxAge: true)`.

> You should identify and address all exceptions to your default `maxAge` before you enable it in production, but this is a great way to get started with cache control.

Set your default `maxAge` by passing the cache control plugin to the `ApolloServer` constructor, like so:

```javascript
import { ApolloServerPluginCacheControl } from 'apollo-server-core';

const server = new ApolloServer({
  // ...other options...
  plugins: [ApolloServerPluginCacheControl({ defaultMaxAge: 5 })],  // 5 seconds
}));
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

Alternatively, you can set the `useGETForQueries` option of [HttpLink](https://www.apollographql.com/docs/react/api/link/apollo-link-http) in your `ApolloClient` instance, but **this is less secure** because your query string and GraphQL variables are sent as plaintext URL query parameters.

### Disabling `Cache-Control`

You can prevent Apollo Server from setting `Cache-Control` headers by setting up the `ApolloServerPluginCacheControl` yourself and setting `calculateHttpHeaders` to `false`:

```js
import { ApolloServerPluginCacheControl } from 'apollo-server-core';

const server = new ApolloServer({
  // ...other options...
  plugins: [ApolloServerPluginCacheControl({ calculateHttpHeaders: false })],
}));
```

If you do this, the cache control plugin will still calculate an overall cache policy for your operations, which can be used by other plugins like the response cache plugin. If you want to entirely disable cache control calculations, use the `ApolloServerPluginCacheControlDisabled` plugin (which has no effect other than preventing the cache control plugin from being installed):

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
