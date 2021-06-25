---
title: Migrating to Apollo Server 3
---

**Apollo Server 3 is generally available.** The focus of this major-version release is to provide a lighter, nimbler core library as a foundation for future features and improved extensibility.

**Many Apollo Server 2 users don't need to make any code changes to upgrade to Apollo Server 3**, especially if you use the "batteries-included" `apollo-server` library (as opposed to a [middleware-specific library](./integrations/middleware/)).

This document explains which features _do_ require code changes and how to make them.

> For a list of all breaking changes, [see the changelog](https://github.com/apollographql/apollo-server/blob/main/CHANGELOG.md).



## Bumped dependencies

### Node.js 

**Apollo Server 3 supports Node.js 12 and later.** (Apollo Server 2 supports back to Node.js 6.) This includes [all LTS and Current versions at the time of release](https://nodejs.org/about/releases/).

If you're using an older version of Node, you should upgrade your Node runtime before upgrading to Apollo Server 3.

### `graphql`

Apollo Server has a peer dependency on [`graphql`](https://www.npmjs.com/package/graphql) (the core JS GraphQL implementation), which means you are responsible for choosing the version installed in your app.

**Apollo Server 3 supports `graphql` v15.3.0 and later.** (Apollo Server 2 supported `graphql` v0.12 through v15.)

If you're using an older version of `graphql`, you should upgrade it to the latest version before upgrading to Apollo Server 3.

## Removed integrations

Apollo Server 2 provides built-in support for subscriptions and file uploads via the `subscriptions-transport-ws` and `graphql-upload` packages, respectively. It also serves GraphQL Playground from its base URL by default.

Apollo Server 3 removes these built-in integrations, in favor of enabling users to provide their own mechanisms for these features. 

You can reenable all of these integrations as they exist in Apollo Server 2.

### Subscriptions

Apollo Server 2 provides limited, built-in support for WebSocket-based GraphQL subscriptions via the `subscriptions-transport-ws` package. This integration is incompatible with Apollo Server's plugin system and Apollo Studio usage reporting.

Apollo Server 3 no longer contains this built-in integration. However, you can still use `subscriptions-transport-ws` for subscriptions if you depend on this implementation. Note that as with Apollo Server 2, this integration won't work with the plugin system or Studio usage reporting.

We hope to add more fully-integrated subscription support to Apollo Server in a future version.

#### Reenabling subscriptions

> **The `subscriptions-transport-ws` library is not actively maintained.** We recommend instead implementing subscriptions with the newer [`graphql-ws`](https://www.npmjs.com/package/graphql-ws) package (as described in [the subscriptions docs](../data/subscriptions/)).
>
> The steps below assume you want to continue using `subscriptions-transport-ws`, which requires fewer changes to existing code.

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

Apollo Server 2 provides built-in support for file uploads via an outdated version of the `graphql-upload` library. Using an updated version of `graphql-upload` required you to disable this built-in support due to backward incompatible changes.

This built-in support is removed in Apollo Server 3. To use `graphql-upload`, you can choose an appropriate version and integrate it yourself. Note that `graphql-upload` does not support federation or every Node.js framework supported by Apollo Server.

To use `graphql-upload` with Apollo Server 3, see the [documentation on enabling file uploads in Apollo Server](../data/file-uploads/). Note that if you were using uploads with the  "batteries-included" `apollo-server` package, you must first [eject to `apollo-server-express`](FIXME link).

### GraphQL Playground

By default, Apollo Server 2 serves the (now-[retired](https://github.com/graphql/graphql-playground/issues/1143)) [GraphQL Playground](https://github.com/graphql/graphql-playground) IDE from its base URL (unless it's running in production). You can override this default behavior with the `playground` option (for example, `playground:true` enables GraphQL Playground even in production).

Apollo Server 3 removes this option in favor of a new [landing page API](../integrations/plugins-event-references/#renderlandingpage), which enables you to serve a custom landing page (or multiple landing pages). The default landing page is a [splash page](FIXME link), which is served in every environment but has a different appearance depending on the value of `NODE_ENV`. When `NODE_ENV` is not `production`, this splash page links to the Apollo Sandbox IDE.

#### Reenabling GraphQL Playground

You can continue to use GraphQL Playground by installing its associated plugin. You customize its behavior by passing options to the plugin instead of via the `playground` constructor option.

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

#### Additional changes to GraphQL Playground

##### Specifying an `endpoint`

In Apollo Server 2, the default value of GraphQL Playground's `endpoint` option is determined in different ways by different Node.js framework integrations. In many cases, it's necessary to manually specify `playground: {endpoint}`.

In Apollo Server 3, the default endpoint used by GraphQL Playground is the browser's current URL. In many cases, this means that you don't have to specify `endpoint` any more. If your Apollo Server 2 app specified `playground: {endpoint}` (and you wish to continue using GraphQL Playground), try removing `endpoint` from the options passed to `ApolloServerPluginLandingPageGraphQLPlayground` and see if it works for you.

##### Specifying `settings`

In Apollo Server 2, the behavior of the `settings` GraphQL Playground option is surprising. If you don't explicitly pass `{playground: {settings: {...}}}` then GraphQL Playground always uses settings that are built into its React application (some of which can be adjusted by the user in their browser). However, if you pass _any object_ as `playground: {settings: {...}}`, [several default value overrides](https://github.com/apollographql/apollo-server/blob/70a431212bd2d07d68c962cb5ded63ecc6a21963/packages/apollo-server-core/src/playground.ts#L38-L46) take effect. 

This confusing behavior is removed in Apollo Server 3. All `settings` use default values from the GraphQL Playground React app if they aren't specified in the `settings` option to `ApolloServerPluginLandingPageGraphQLPlayground`.

If your app does pass in `playground: {settings: {...}}` and you want to make sure the settings used in your GraphQL Playground do not change, you should copy any relevant settings from [the Apollo Server 2 code]([bunch of default settings value overrides] (https://github.com/apollographql/apollo-server/blob/70a431212bd2d07d68c962cb5ded63ecc6a21963/packages/apollo-server-core/src/playground.ts#L38-L46)) into your app. 

For example, you could replace:

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


## Removed constructor options

The following `ApolloServer` constructor options have been removed in favor of other features or configuration methods.

### `extensions`

Apollo Server 3 removes support for the `graphql-extensions` API, which was used to extend Apollo Server's functionality. This API has numerous limitations relative to the [plugins API](./integrations/plugins/) introduced in Apollo Server v2.2.0.

Unlike `graphql-extensions`, the plugins API enables cross-request state, and its hooks virtually all interact with the same `GraphQLRequestContext` object.

If you've written your own extensions (passed to `new ApolloServer({extensions: ...})`), you should [rewrite them as plugins](./integrations/plugins/) before upgrading to Apollo Server 3.


### `engine` 

"Engine" is a previous name of [Apollo Studio](https://www.apollographql.com/docs/studio/). Prior to Apollo Server v2.18.0, you passed the `engine` constructor option to configure how Apollo Server communicates with Studio.

In later versions of Apollo Server (including Apollo Server 3), you instead provide this configuration via a combination of the `apollo` constructor option, plugins, and `APOLLO_`-prefixed environment variables.

If your project still uses the `engine` option, see [Migrating from the `engine` option](../v2/migration-engine-plugins) before upgrading to Apollo Server 3.

### `schemaDirectives`

In Apollo Server 2, you can pass `schemaDirectives` to `new ApolloServer` alongside `typeDefs` and `resolvers`. These arguments are all passed through to the [`makeExecutableSchema` function](https://www.graphql-tools.com/docs/generate-schema/#makeexecutableschemaoptions)  from the `graphql-tools` package. `graphql-tools` now considers `schemaDirectives` to be a [legacy feature](https://www.graphql-tools.com/docs/legacy-schema-directives/).

In Apollo Server 3, the `ApolloServer` constructor now only passes `typeDefs`, `resolvers`, and `parseOptions` through to `makeExecutableSchema`.

To provide other arguments to `makeExecutableSchema` (such as `schemaDirectives` or its replacement `schemaTransforms`), you can call `makeExecutableSchema` yourself and pass its returned schema as the `schema` constructor option.

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

> In Apollo Server 2, there are subtle differences between providing a schema with `schema` versus providing it with `typeDefs` and `resolvers`. For example, the automatic definition of the `@cacheControl` directive is added only in the latter case. These differences are removed in Apollo Server 3 (for example, the definition of the `@cacheControl` directive is _never_ automatically added).

### `tracing`

In Apollo Server 2, the `tracing` constructor option enables a trace mechanism implemented in the `apollo-tracing` package. This package uses a comparatively inefficient JSON format for execution traces returned via the `tracing` GraphQL response extension. The format is consumed only by the deprecated `engineproxy` and GraphQL Playground. It is _not_ the tracing format used for Apollo Studio usage reporting or federated inline traces.

The `tracing` constructor option is removed in Apollo Server 3. The `apollo-tracing` package has been deprecated and is no longer being published.

If you rely on this deprecated trace format, you might be able to use the old version of `apollo-server-tracing` directly:

```javascript
new ApolloServer({
  plugins: [
    require('apollo-tracing').plugin()
  ]
});
```

> This workaround has not been tested! If you need this to work and it doesn't, please file an issue and we will investigate a fix to enable support in Apollo Server 3.

### `cacheControl`

In Apollo Server 2, [cache policy support](../performance/caching/) is configured via the `cacheControl` constructor option. There are several improvements to the semantics of cache policies in Apollo Server 3, as well as changes to how caching is configured.

The `cacheControl` constructor option is removed in Apollo Server 3. To customize cache control, you instead manually install the [cache control plugin](FIXME link) and provide custom options to it. 

For example, if you currently provide `defaultMaxAge` and/or `calculateHttpHeaders` to `cacheControl` like so:

```javascript
new ApolloServer({
  cacheControl: {
    defaultMaxAge,
    calculateHttpHeaders,
  },
});
```

You now provide them like so:

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

If you currently pass `cacheControl: false` like so:

```javascript
new ApolloServer({
  cacheControl: false,
});
```

You now install the disabling plugin like so:

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

See [GraphQL Playground](#graphql-playground).

## Removed exports

In Apollo Server 2, `apollo-server` and framework integration packages such as `apollo-server-express` import many symbols from third-party packages and re-export them. This effectively ties the API of Apollo Server to a specific version of those third-party packages and makes it challenging to upgrade to a newer version or for you to upgrade those packages yourself.

In Apollo Server 3, most of these "re-exports" are removed. If you want to use these exports, you should import them directly from their originating package

### Exports from `graphql-tools`

Apollo Server 2 exported every symbol exported by [`graphql-tools`](https://www.graphql-tools.com/) v4. If you're importing any of the following symbols from an Apollo Server package, you should instead run `npm install graphql-tools@4.x` and import the symbol from `graphql-tools` instead. Alternatively, read the [GraphQL Tools docs](https://www.graphql-tools.com/docs/introduction) and find out which `@graphql-tools/subpackage` the symbol is exported from in more modern versions of GraphQL Tools.

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

Apollo Server 2 exports every symbol exported by [`graphql-subscriptions`](https://www.npmjs.com/package/graphql-subscriptions). If you are importing any of the following symbols from an Apollo Server package, you should instead run `npm install graphql-subscriptions` and import the symbol from `graphql-subscriptions` instead.

- `FilterFn`
- `PubSub`
- `PubSubEngine`
- `PubSubOptions`
- `ResolverFn`
- `withFilter`

### Exports from `graphql-upload`

Apollo Server 2 exports the `GraphQLUpload` symbol from (our fork of) `graphql-upload`. Apollo Server 3 no longer has built-in `graphql-upload` integration. See [the documentation on how to enable file uploads in Apollo Server 3](../data/file-uploads/).

### Exports related to GraphQL Playground

Apollo Server 2 exported a `defaultPlaygroundOptions` object, along with `PlaygroundConfig` and `PlaygroundRenderPageOptions` types to support the `playground` top-level constructor argument.

In Apollo Server 3, GraphQL Playground is one of several landing pages implemented via plugins, and there are no default options for it. The `ApolloServerPluginLandingPageGraphQLPlaygroundOptions` type exported from `apollo-server-core` plays a similar role to `PlaygroundConfig` and `PlaygroundRenderPageOptions`. See [the section on `playground` above](#graphql-playground) for more details on configuring GraphQL Playground in Apollo Server 3.

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
