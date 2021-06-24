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

```javascript
new ApolloServer({
  plugins: [
    require('apollo-tracing').plugin()
  ]
});
```

(This has not been tested. If you need this to work and it does not work, file an issue and we can try to publish bug fixes to this package to enable it to work with Apollo Server 3.)

### `cacheControl`

In Apollo Server 2, [cache policy support](../performance/caching/) was configured via the `cacheControl` constructor option. There are several improvements to the semantics of cache policies in Apollo Server 3, as well as changes to how caching is configured.

The `cacheControl` constructor option has been removed. This option controlled the arguments to the built-in [cache control plugin](FIXME link). This now functions like the other built-in plugins: Apollo Server may implicitly install it with default arguments, and if you want to pass non-default arguments, just install the plugin yourself.

If you used the `defaultMaxAge` and/or `calculateHttpHeaders` sub-options, pass them to the plugin instead. So replace:

```javascript
new ApolloServer({
  cacheControl: {
    defaultMaxAge,
    calculateHttpHeaders,
  },
});
```

with

```javascript
import { ApolloServerPluginCacheControl } from 'apollo-server-core';

new ApolloServer({
  plugins: [
    ApolloServerPluginCacheControl({
      defaultMaxAge,
      calculateHttpHeaders,
    }),
  ],
})
```

If you passed `cacheControl` false, use the disabling plugin instead. So replace:

```javascript
new ApolloServer({
  cacheControl: false,
});
```

with

```javascript
import { ApolloServerPluginCacheControlDisabled } from 'apollo-server-core';

new ApolloServer({
  plugins: [
    ApolloServerPluginCacheControlDisabled(),
  ],
})
```

In Apollo Server 2, `cacheControl: true` was a shorthand for setting `cacheControl: {stripFormattedExtensions: false, calculateHttpHeaders: false}`. If you either passed `cacheControl: true` or explicitly passed `stripFormattedExtensions: false`, Apollo Server 2 would include a `cacheControl` response extension inside your GraphQL response. This was used by the deprecated `engineproxy` server. Support for writing this response extension has been removed from Apollo Server 2. This allows for a more memory-efficient cache control plugin implementation.

In Apollo Server 2, definitions of the `@cacheControl` directive (and the `CacheControlScope` enum that it uses) were sometimes automatically inserted into your schema. (Specifically, they were added if you defined your schema with the `typeDefs` and `resolvers` options, but not if you used the `modules` or `schema` options or if you were a federated gateway. Passing `cacheControl: false` did not stop the definitions from being inserted!) In Apollo Server 3, these definitions are never automatically inserted.

So **if you use the `@cacheControl` directive in your schema, you should add these definitions to your schema**:

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

(You may add them to your schema in Apollo Server 2 before upgrading if you'd like.)

In Apollo Server 2, plugins that want to change the operation's overall cache policy can overwrite the field `requestContext.overallCachePolicy`. In Apollo Server 3, that field is considered read-only, but it does have new methods to mutate its state. So you should replace:

```javascript
requestContext.overallCachePolicy = { maxAge: 100 };
```

with:

```javascript
requestContext.overallCachePolicy.replace({ maxAge: 100 });
```

(You may also want to consider using `restrict` instead of `replace`; this method only allows `maxAge` to be reduced and only allows `scope` to change from `PUBLIC` to `PRIVATE`.)

In Apollo Server 2, fields returning a union type are treated similarly to fields returning a scalar type: `@cacheControl` on the type itself is ignored, and `maxAge` if unspecified is inherited from its parent in the operation (unless it is a root field) instead of defaulting to `defaultMaxAge` (which itself defaults to 0). In Apollo Server 3, fields returning a union type are treated similarly to fields returning an interface or object type: `@cacheControl` on the type itself is honored, and `maxAge` if unspecified defaults to `defaultMaxAge`. If you were relying on the inheritance behavior, you can specify `@cacheControl(maxAge: ...)` explicitly on your union types or union-returning fields, or you can use the new `@cacheControl(inheritMaxAge: true)` feature on the union-returning field to restore the Apollo Server 2 behavior. If your schema contained `union SomeUnion @cacheControl(...)`, that directive will start having an effect when you upgrade to Apollo Server 3.

In Apollo Server 2, the `@cacheControl` is honored on type definitions but not on type extensions. That is, if you write `type SomeType @cacheControl(maxAge: 123)` it takes effect but if you write `extend type SomeType @cacheControl(maxAge: 123)` it does not take effect. In Apollo Server 3, `@cacheControl` is honored on object, interface, and union extensions. If your schema accidentally contained `@cacheControl` on an `extend`, that directive will start having an effect when you upgrade to Apollo Server 3.

### `playground`

In Apollo Server 2, the only available landing page was the (now-[retired](https://github.com/graphql/graphql-playground/issues/1143)) [GraphQL Playground](https://github.com/graphql/graphql-playground). By default, it was enabled unless the `NODE_ENV` environment variable was set to `production`. You could pass the constructor option `playground: true` to enable it regardless of `NODE_ENV`, `playground: false` to disable it regardless of `NODE_ENV`, or `playground: {...}` to customize its settings more.

In Apollo Server 3, there is a [landing page API](../integrations/plugins-event-references/#renderlandingpage) which allows for multiple landing pages. The default landing page is a simple [splash page](FIXME link), which is always enabled but has a different appearance depending on the value of `NODE_ENV`. When `NODE_ENV` is not `production`, this splash page links to the Apollo Explorer GraphQL UI.

You can still use GraphQL Playground if you'd like by installing a different plugin. It is customized by passing options to the playground plugin, not by using the top-level `playground` constructor option.

If your code did not specify the `playground` constructor option and you'd like to keep the previous behavior instead of trying the new splash page, you can do that as follows:

```javascript
import { ApolloServerPluginLandingPageGraphQLPlayground,
         ApolloServerPluginLandingPageDisabled } from 'apollo-server-core';
new ApolloServer({
  plugins: [
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageDisabled()
      : ApolloServerPluginLandingPageGraphQLPlayground(),
  ],
});
```

If your code passed `new ApolloServer({playground: true})`, you can keep the previous behavior with:

```javascript
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
new ApolloServer({
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground(),
  ],
});
```

If your code passed `new ApolloServer({playground: false})` you can keep the previous behavior with:

```javascript
import { ApolloServerPluginLandingPageDisabled } from 'apollo-server-core';
new ApolloServer({
  plugins: [
    ApolloServerPluginLandingPageDisabled(),
  ],
});
```

If your code passed an options object like `new ApolloServer({playground: playgroundOptions})`, you can keep the previous behavior with:

```javascript
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
new ApolloServer({
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground(playgroundOptions),
  ],
});
```

In addition to moving the options from the top-level `playground` There are two changes to how passing options here works.

First, in Apollo Server 2, the default value of the `endpoint` option was determined in different ways by different framework integrations, and in many cases it was necessary to manually specify `playground: {endpoint}`. In Apollo Server 3, the default endpoint used by GraphQL Playground is the browser's current address. In many cases, this means that you don't have to specify `endpoint` any more. If your Apollo Server 2 app specified `playground: {endpoint}` (and you wish to continue using GraphQL Playground), try removing `endpoint` from the options passed to `ApolloServerPluginLandingPageGraphQLPlayground` and see if it works for you.

Second, in Apollo Server 2, the behavior of the `settings` sub-option was surprising. If you did not explicitly pass `{playground: {settings: {...}}}` then GraphQL Playground would always use a set of settings built into its React application (some of which could be adjusted by the user in their browser). However, if you passed any object as `playground: {settings: {...}}`, a [bunch of default settings value overrides] (https://github.com/apollographql/apollo-server/blob/70a431212bd2d07d68c962cb5ded63ecc6a21963/packages/apollo-server-core/src/playground.ts#L38-L46) would take effect. This confusing behavior is removed in Apollo Server 3; all `settings` use the default values from the GraphQL Playground React app if not specified in the `settings` option to `ApolloServerPluginLandingPageGraphQLPlayground`. If you did pass in `playground: {settings: {...}}` and you want to make sure the settings used in your GraphQL Playground do not change, you should copy any relevant settings from [the Apollo Server 2 code]([bunch of default settings value overrides] (https://github.com/apollographql/apollo-server/blob/70a431212bd2d07d68c962cb5ded63ecc6a21963/packages/apollo-server-core/src/playground.ts#L38-L46)) into your app. So for example, you could replace:

```javascript
new ApolloServer({playground: {settings: {'some.setting': true}}})
```

with:

```javascript
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
new ApolloServer({
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground({
      'some.setting': true,
      'general.betaUpdates': false,
      'editor.theme': 'dark' as Theme,
      'editor.cursorShape': 'line' as CursorShape,
      'editor.reuseHeaders': true,
      'tracing.hideTracingResponse': true,
      'queryPlan.hideQueryPlanResponse': true,
      'editor.fontSize': 14,
      'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
      'request.credentials': 'omit',
    }),
  ],
});
```

## Removed exports

In Apollo Server 2, `apollo-server` and framework integration packages such as `apollo-server-express` imported many symbols from third-party packages and re-exported them.  This effectively tied the API of Apollo Server to the specific version of those third-party packages and made it challenging for us to upgrade to a newer version or for you to upgrade those packages yourself.

In Apollo Server 3, most of these "re-exports" have been removed. If you want to use these exports, you should import them directly from the package they came from.

### Exports from `graphql-tools`

Apollo Server 2 exported every symbol exported by [`graphql-tools`](https://www.graphql-tools.com/) v4. If you are importing any of the following symbols from an Apollo Server package, you should instead run `npm install graphql-tools@4.x` and import the symbol from `graphql-tools` instead. Alternatively, read the [GraphQL Tools docs](https://www.graphql-tools.com/docs/introduction) and find out which `@graphql-tools/subpackage` the symbol is exported from in more modern versions of GraphQL Tools.

- `AddArgumentsAsVariables`
- `AddTypenameToAbstract`
- `CheckResultAndHandleErrors`
- `ExpandAbstractTypes`
- `ExtractField`
- `FilterRootFields`
- `FilterToSchema`
- `FilterTypes`
- `MockList`
- `RenameRootFields`
- `RenameTypes`
- `ReplaceFieldWithFragment`
- `SchemaDirectiveVisitor'
- `SchemaError`
- `TransformRootFields`
- `WrapQuery`
- `addCatchUndefinedToSchema`
- `addErrorLoggingToSchema`
- `addMockFunctionsToSchema`
- `addResolveFunctionsToSchema`
- `addSchemaLevelResolveFunction`
- `assertResolveFunctionsPresent`
- `attachConnectorsToContext`
- `attachDirectiveResolvers`
- `buildSchemaFromTypeDefinitions`
- `chainResolvers`
- `checkForResolveTypeResolver`
- `concatenateTypeDefs`
- `decorateWithLogger`
- `defaultCreateRemoteResolver`
- `defaultMergedResolver`
- `delegateToSchema`
- `extendResolversFromInterfaces`
- `extractExtensionDefinitions`
- `forEachField`
- `introspectSchema`
- `makeExecutableSchema`
- `makeRemoteExecutableSchema`
- `mergeSchemas`
- `mockServer`
- `transformSchema`

FIXME this is missing TS-only exports

### Exports from `graphql-subscriptions`

Apollo Server 2 exported every symbol exported by [`graphql-subscriptions`](https://www.npmjs.com/package/graphql-subscriptions). If you are importing any of the following symbols from an Apollo Server package, you should instead run `npm install graphql-subscriptions` and import the symbol from `graphql-subscriptions` instead.

- `FilterFn`
- `PubSub`
- `PubSubEngine`
- `PubSubOptions`
- `ResolverFn`
- `withFilter`

### Exports from `graphql-upload`

Apollo Server 2 exported the `GraphQLUpload` symbol from (our fork of) `graphql-upload`. Apollo Server 3 no longer has built-in `graphql-upload` integration. See [../data/file-uploads/](the documentation on how to enable file uploads in Apollo Server 3).

### Exports related to GraphQL Playground

Apollo Server 2 exported a `defaultPlaygroundOptions` object and `PlaygroundConfig` and `PlaygroundRenderPageOptions` types to support the `playground` top-level constructor argument. In Apollo Server 3, GraphQL Playground is one of several landing pages implemented via plugins, and there are no default options for it. The `ApolloServerPluginLandingPageGraphQLPlaygroundOptions` type exported from `apollo-server-core` plays a similar role to `PlaygroundConfig` and `PlaygroundRenderPageOptions`. See [the section on `playground` above](#playground) for more details on configuring GraphQL Playground in Apollo Server 3.

## Removed features

Several small features have been removed from Apollo Server 3.

FIXME this is where I got to

### `ApolloServer.schema` field

### `apollo-server-testing`

### `apollo-datasource-rest`: `baseURL` override change




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
