---
title: Migrating to v3.0
description: How to migrate to Apollo Server 3.0
---

Apollo Server 3.0 is our first major-version release in three years. The theme of Apollo Server 3 is a lighter, nimbler core. We've dropped compatibility with old versions of Node and `graphql-js`, replaced hard-coded integrations with specific versions of third-party library with more flexible approaches, and moved feature configuration from top-level `new ApolloServer` constructor arguments with plugins.

Many Apollo Server users won't have to make any changes to upgrade to Apollo Server 3, especially if you use the "batteries-included" `apollo-server` package. This document explains which features do require code changes and shows what changes are necessary.

## Bumped dependencies

Apollo Server 3 only supports Node 12 or newer. (Apollo Server 2 supported Node v6.) This includes [all LTS and Current versions at the time of release](https://nodejs.org/en/about/releases/). If you are using an older version of Node, you should upgrade your Node runtime before upgrading to Apollo Server 3.

Apollo Server has a peer dependency on [`graphql`](https://www.npmjs.com/package/graphql) (the core JS GraphQL implementation), which means that you are responsible for choosing the version installed in your app. In Apollo Server 3, the minimum supported version of `graphql` is v15.3.0. (Apollo Server 2 supported `graphql` v0.12 through v15.) If you are using an older version of `graphql`, you should upgrade it to the latest version before upgrading to Apollo Server 3.

## Removed integrations

Apollo Server 2 had built-in enabled-by-default integrations with the `subscriptions-transport-ws` and `graphql-upload` packages. These integrations are not part of Apollo Server 3, but you can integrate them directly in your app instead.
### Subscriptions

Apollo Server 2 had a superficial integration with the `subscriptions-transport-ws` package. This allowed you to add a WebSocket-based GraphQL subscriptions server alongside Apollo Server's HTTP-based GraphQL query and mutation server. This integration didn't work with Apollo Server's plugin system, Studio usage reporting, or federation.

Apollo Server 3 no longer contains this integration. (We hope to add a more fully-integrated subscription server to Apollo Server in a future version.) However, you can still integrate directly with `subscriptions-transport-ws` if you depend on the existing implementation. (Just like in Apollo Server 2, this integration won't work with Apollo Server's plugin system, Studio usage reporting, or federation.)

(Note that `subscriptions-transport-ws` has not been actively maintained. You may want to implement subscriptions using the newer [`graphql-ws`](https://www.npmjs.com/package/graphql-ws) package instead; this is what we describe in [the subscriptions docs](../data/subscriptions/). But if you're already using subscriptions with Apollo Server 2, continuing to use `subscriptions-transport-ws` requires fewer changes to your code.)

You cannot integrate the batteries-included `apollo-server` package with `subscriptions-transport-ws`; if you were using `apollo-server` with subscriptions, first [eject to `apollo-server-express`](FIXME link).

> *Note:* Currently, these instructions are only for the Express integration. It is likely possible to integrate `subscriptions-transport-ws` with other integrations. PRs to this migration guide are certainly welcome!

 1. Install `subscriptions-transport-ws` and `@graphql-tools/schema`.

        npm install subscriptions-transport-ws @graphql-tools/schema

 2. Import `SubscriptionServer` from `subscriptions-transport-ws`.

    ```javascript
    import { SubscriptionServer } from 'subscriptions-transport-ws';
    ```

 3. Import `makeExecutableSchema` from `@graphql-tools/schema`.

    > Your server may already be using `makeExecutableSchema`, so adding this
    > import may not be necessary.  More on why and how in the next step!

    ```javascript
    import { makeExecutableSchema } from '@graphql-tools/schema';
    ```

 4. Import the `execute` and `subscribe` functions from `graphql`.

    The `graphql` package should already be installed, so simply import them for
    usage:

    ```javascript
    import { execute, subscribe } from 'graphql';
    ```

    We will pass these to the creation of the `SubscriptionServer` in Step 9.

 5. Have an instance of `GraphQLSchema` available.

    The `SubscriptionServer` (which we'll initiate in a later step) doesn't
    accept `typeDefs` and `resolvers` directly; it instead only accepts
    an executable `GraphQLSchema` as `schema`. So we need to make one of those.
    We can then pass the same object to `new ApolloServer` instead of `typeDefs`
    and `resolvers` so it's clear that the same schema is being used in both
    places.

    > Your server may already pass a `schema` to `new ApolloServer`.  If it
    > does, this step can be skipped.  You'll use the your existing schema in
    > Step 8 below.

    ```javascript
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    ```

    > While not necessary, this `schema` can be passed into the `ApolloServer`
    > constructor options, rather than `typeDefs` and `resolvers`:
    >
    > ```javascript
    > const server = new ApolloServer({
    >   schema,
    > });
    > ```

 6. Import Node.js's `createServer` from the `http` module.

    ```javascript
    import { createServer } from 'http';
    ```


7. Get an `http.Server` instance with the Express app, prior to `listen`-ing.

     In order to setup both the HTTP and WebSocket servers prior to listening,
     we'll need to get the `http.Server`.  Do this by passing the Express `app`
     to the `createServer` we imported from Node.js' `http` module.

     ```javascript
     // This `app` is the returned value from `express()`.
     const httpServer = createServer(app);
     ```

8. Create the `SubscriptionsServer`.

    ```javascript
    SubscriptionServer.create({
       // This is the `schema` created in Step 6 above.
       schema,

       // These were imported from `graphql` in Step 5 above.
       execute,
       subscribe,
    }, {
       // This is the `httpServer` created in Step 9 above.
       server: httpServer,

       // This `server` is the instance returned from `new ApolloServer`.
       path: server.graphqlPath,
    });
    ```

9. Finally, adjust the existing `listen`.

    Previously, most applications will be doing `app.listen(...)`.

    **This should be changed to `httpServer.listen(...)`** (same arguments) to
    start listening on the HTTP and WebSocket transports simultaneously.

### File uploads

Apollo Server 2 had a built-in integration with a particular old version of `graphql-upload`, which was enabled by default. Using updated versions (which had backwards-incompatible changes) required you to disable Apollo Server's integration and integrate the newer version yourself. In Apollo Server 3, the integration has been removed; if you want to use `graphql-upload`, you can choose an appropriate version and integrate it yourself. Note that `graphql-upload` does not support federation or every web framework supported by Apollo Server.

To use `graphql-upload` with Apollo Server 3, see the [documentation on enabling file uploads in Apollo Server](../data/file-uploads/). Note that if you were using uploads with the batteries-included `apollo-server` package, you must first [eject to `apollo-server-express`](FIXME link).


## Removed constructor options

### `extensions`

Apollo Server v1.2.0 introduced the `graphql-extensions` API for extending your Apollo Server. This extension framework was never fully documented, had no way of representing cross-request state, and each of its hooks took ad hoc unrelated arguments. Apollo Server v2.2.0 added the documented [plugins API](FIXME link), which allows your plugin to have cross-request state and whose hooks mostly take the same `GraphQLRequestContext` object. The `graphql-extensions` API was mostly used to implement built-in extensions like usage reporting and cache control, and these have been ported to plugins since Apollo Server v2.14.0.

If you have written your own extensions (passed to `new ApolloServer({extensions: ...})`), you should rewrite them to be [plugins](FIXME link) before upgrading to Apollo Server 3.


### `engine` (and `ENGINE_API_KEY` and `ENGINE_SCHEMA_TAG` environment variables)

Engine is an old name for [Apollo Studio](https://www.apollographql.com/docs/studio/). Before Apollo Server v2.18.0, you configured how Apollo Server talks to Studio using the `engine` constructor option and environment variables including `ENGINE_API_KEY` and `ENGINE_SCHEMA_TAG`. Starting with Apollo Server v2.18.0, you can configure the same behavior using a combination of the `apollo` constructor option, built-in plugins such as the usage reporting plugin, and other environment variables. The old constructor option and environment variables continued to work in Apollo Server 2 but no longer are supported in Apollo Server 3.

If your project passes `engine` to `new ApolloServer`, or sets the `ENGINE_API_KEY` or `ENGINE_SCHEMA_TAG` environment variables, you should first follow the instructions in the [Apollo Server 2 'migrating from the "engine" option'](../v2/migration-engine-plugins/) documentation page before upgrading to Apollo Server 3. FIXME make sure link works

### `schemaDirectives`

In Apollo Server 2, you could pass `schemaDirectives` to `new ApolloServer` alongside `typeDefs` and `resolvers`. These were all passed through to the [`makeExecutableSchema` function from the `graphql-tools` package](https://www.graphql-tools.com/docs/generate-schema/#makeexecutableschemaoptions). `graphql-tools` now considers `schemaDirectives` to be a [legacy feature](https://www.graphql-tools.com/docs/legacy-schema-directives/).

Apollo Server 3 now only passes `typeDefs`, `resolvers`, and `parseOptions` through to `makeExecutableSchema`. If you'd like to use other features of `makeExecutableSchema` such as `schemaDirectives` or its replacement `schemaTransforms`, you can call `makeExecutableSchema` itself and pass the schema it returns as the `schema` constructor options.

That is, you can replace:

```javascript
new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives,
});
```

with:

```javascript
import { makeExecutableSchema } from '@graphql-tools/schema';

new ApolloServer({
  schema: makeExecutableSchema({
    typeDefs,
    resolvers,
    schemaDirectives,
  }),
});
```

(In Apollo Server 2 there were some subtle differences between providing a schema with `schema` and providing it with `typeDefs` and `resolvers`; for example, the definition of the `@cacheControl` directive was added only in the latter case. These distinctions are removed in Apollo Server 3; for example, the definition of the `@cacheControl` directive is never automatically added.)

### `tracing`

In Apollo Server 2, the `tracing` constructor option enabled a trace mechanism implemented in the `apollo-tracing` package. This package implements an inefficient JSON format for execution traces returned via the `tracing` GraphQL response extension. This format was only consumed by the deprecated `engineproxy` and GraphQL Playground; it is not the tracing format used for Studio usage reporting or Federation inline traces. FIXME add some links

In Apollo Server 3, the `tracing` constructor option has been removed. The `apollo-tracing` package has been deprecated and is no longer being published.

If you rely on this old trace format, you may be able to still use the old version of `apollo-server-tracing` directly:

```
new ApolloServer({
  plugins: [
    require('apollo-tracing').plugin()
  ]
});
```

(This has not been tested. If you need this to work and it does not work, file an issue and we can try to publish bug fixes to this package to enable it to work with Apollo Server 3.)

### `cacheControl`

FIXME this is where I got up to

- configured via plugin
- cannot overwrite requestContext.overallCachePolicy
- `@cacheControl` respected on extensions and fields returning union types
- need to declare `@cacheControl` yourself

### `playground`


## Removed features

Several small features have been removed from Apollo Server 3.


### `ApolloServer.schema` field

### `apollo-server-testing`

### `apollo-datasource-rest`: `baseURL` override change



## Removed exports

- all of `graphql-tools`
- all of `graphql-subscriptions`
- `Upload`
- playground
- check for more?


## Changed features

### Plugin API

- Almost all plugin methods are now async
- willSendResponse always fired after didEncounterError
- GatewayInterface is the new name for GraphQLService

### Default landing page

- how to go back to playground

### Bad request errors more consistently 4xx

### `ApolloError`

- don't pass `extensions:`
- `extensions` show up differently

### `apollo-server-caching` test suite


## Changes to framework integrations

### `start()` now mandatory for non-serverless framework integrations

Express, Fastify, Hapi, Koa, Micro, CloudFlare

### Peer deps rather than direct deps

### cors `*` is now the default

- lambda, cloud func, azure func does had no CORS
- koa had reflection
- micro/cloudflare don't have ways of setting cors headers

### Express

#### No longer officially supports using with connect


### Lambda

- now a wrapper
- createHandler has different options
- context gets express too
- can only be called as async

### Fastify

v3 instead of v2

### Hapi

- `apollo-server-hapi` is now only tested with Hapi v20.1.2 and higher (the minimum version that supports Node 16).
