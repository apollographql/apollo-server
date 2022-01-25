# Apollo Server Roadmap

*Last updated: January 2022*

> **Please note:** This is an approximation of **larger effort** work planned for the next 3 - 6 months. It does not cover all new functionality that will be added, and nothing here is set in stone. Also note that each of these releases, and several patch/minor releases in-between, will include bug fixes (based on issue triaging) and community submitted PRs.

## 4.0

**Estimated release:** Q2 2022

We are now actively working on Apollo Server 4. This project consists of a number of refactors focused on making Apollo Server simpler to use, maintain, document, and extend. Much of this builds on proposals that were originally part of the Apollo Server 3 plan which we removed from that release due to scope.  Much of the below is based on a [proposal from 2019](https://github.com/apollographql/apollo-server/issues/3184) which is one of the most up-voted issues in our repository.

### Replace 9 core-maintained bindings with a stable HTTP abstraction

Currently, Apollo Server has core-maintained bindings to a large number of web frameworks and serverless environments. There is no stable, easy API to allow you to write your own binding to a new framework. These bindings are all maintained by the Apollo Server core team, but we do not have practical experience running servers that use most of these frameworks.  Adding new features to Apollo Server often requires making very similar changes in every binding package, which is a big barrier to making real improvements. The different bindings are implemented as separate npm packages which subclass the core `ApolloServer` package, which means that the API for `ApolloServer` is [different for different packages](https://www.apollographql.com/docs/apollo-server/api/apollo-server/#framework-specific-middleware-function), which is challenging to document and understand.

In Apollo Server 4, we will follow the 2019 proposal to add a well-defined API for processing an HTTP request to `ApolloServer`. `ApolloServer` will have a single documentable API rather than being extended via subclasses. Framework integration packages can export functions or classes that take in `ApolloServer` and call its methods appropriately instead of adding their own methods to the object.

As part of the main Apollo Server package, we will maintain integrations that work on Node's built-in `http` request and response types. You will be able to use these directly with `http.createServer` or with Express (whose request and response types extend Node's).

Currently, the `apollo-server` package exports a "batteries-included" version of `ApolloServer` with a very different API: it has a `listen` method instead of a framework integration method, and various aspects of it cannot be configured.  The fact that the package whose name is closest to the name of the project exports a class with the same name as every other `ApolloServer` but has different behavior may in some ways be "convenient" but it makes it challenging to document; we have recently started taking the verbose approach of always referring to `apollo-server` as "the batteries-included `apollo-server` package". In Apollo Server 4, we plan to introduce an `ApolloServerStandalone` class in the main Apollo Server package which is similar in concept to remove ambiguity and make the name more easily reference-able.

The Apollo Server core team will no longer try to maintain integrations for which we have no hands-on operational experience. **This is where the larger community can help!** During the development process of Apollo Server 4, we'd like to find community members who are excited to maintain the integrations for most of the web frameworks (Fastify, Hapi, Koa, Micro, Lambda, Google Cloud Functions, Azure Functions, and Cloudflare). Writing these integrations should be much easier in the new model, because the only responsibility of these packages will be translating requests and responses between the framework's native format and the types used by `ApolloServer`'s API.  We will add more direct support to the `ApolloServer` API for the patterns that are repeated across the serverless integration packages today.

Separating these packages from the Apollo Server release cycle will have many advantages:

- Users of these integration packages will depend directly on the main Apollo Server package as well as on the integration package, instead of only depending transitively on the main Apollo Server package. This makes it easier to understand exactly what version of Apollo Server you are using.
- Separating the versioning of the integration packages from the main Apollo Server package makes it easier for integration packages to make backwards-incompatible changes to their integration-specific APIs without requiring a full Apollo Server major version bump.
- If the underlying web framework makes backwards-incompatible changes, it will be easier to split the integration package in two or find another way of handling those changes.

We are looking for volunteers to maintain these integrations! See [the issues with the 'integration-collaborators' label](https://github.com/apollographql/apollo-server/labels/integration-collaborators) to find the discussion about your favorite web framework today.

### Combine many packages into `@apollo/server`

You may have noticed the recurring phrase "the main Apollo Server package" above.  Another challenge of maintaining and using Apollo Server is how many separate npm packages are in the project! Most of the core logic is in `apollo-server-core`, but this isn't the package that users interact most directly with. There isn't much value provided by the separation into many classes, but it does add a lot of complexity to maintaining and using the package.

We believe we can combine the following packages into a single `@apollo/server` package:
- `apollo-server-core`
- `apollo-server` (the "batteries-included" package --- we are looking forward to never having to type this phrase again)
- `apollo-server-plugin-base`
- `apollo-server-types`
- `apollo-server-express`
- `apollo-server-errors`
- `apollo-reporting-protobuf`

The `@apollo/server` naming matches how Apollo's other actively maintained npm packages such as `@apollo/client` and `@apollo/gateway` are named. After Apollo Server 4 is released, all actively maintained Apollo packages will start with `@apollo/`; this leaves the `apollo-` "namespace" for community packages such as integration packages like `apollo-server-fastify`.

In order to implement the standalone server with minimal `npm install`s required, this package will have a dependency on `body-parser` (and perhaps `cors` if we want to allow CORS handling to be configurable); we believe this dependency is small enough that it will be acceptable to include it even for folks who use a different web framework that has its own body parsing solution.

This package will be the only package in the `apollo-server` repository. We can stop using Lerna; we are considering using [Changesets](https://github.com/changesets/changesets/) to make releases and changelog management more straightforward. (Right now our CHANGELOG.md is written manually and assumes inaccurately that all Apollo Server packages use the same version numbers; after this we will have a precise CHANGELOG.md for any package we publish.)

(Some aspects of `apollo-server-errors` will ideally be folded into `graphql-js` instead.)

### Remove features that wrap framework-specific libraries

Some parts of Apollo Server take parameters that are passed directly to framework-specific libraries. These libraries are ones that most users of the framework already know how to use, and they vary across frameworks making our APIs challenging to document.  This specifically includes body-parsing and CORS-handling packages.

In Apollo Server 4, framework integration functions won't try to wrap these basic framework-specific libraries. If you want to use our Express middleware, you'll be required to use the standard `body-parser` middleware yourself. (We'll have good error handling to help you figure out if you forgot to do this.) This means we won't have to have a special option just for passing options through to `body-parser`.

`ApolloServerStandalone` (our replacement for the batteries-included `apollo-server` package) will still link in `body-parser` and parse bodies for you. Any integration maintainer who thinks their package would work better if it had a more standalone/batteries-included API should feel free to add that as well, but the main building block exported by an integration should probably just handle GraphQL requests without linking in other middleware.

### Remove health checks and path parsing

The “health check” feature is just "an HTTP path which always returns 200 and which allows you to pass in a handler to run arbitrary code instead". It’s notably not actually connected to the state of the ApolloServer object itself (eg, if something is broken that prevents operations from executing then health checks can still pass). Our docs (https://www.apollographql.com/docs/apollo-server/monitoring/health-checks/) no longer actively encourage the use of this feature and instead recommend running a trivial GraphQL query over GET. If for some reason running this query is not an acceptable health check, folks integrating Apollo Server into a web framework can define their own health check via their web framework directly.

This feature is the main remaining reason that ApolloServer needs to know about and parse URI paths.  This leads to a bunch of confusing complexity: there’s a concept of `server.graphqlPath` which middleware uses to decide whether or not to process a request as GraphQL, but you can also use your web framework itself to specify directly what path middleware is mounted at.  (This flexibility is not provided to the batteries-included server, which always has a `graphqlPath` of `/`.) Path parsing has been a challenge for many integrations; for example, when running in AWS Lambda, the full path at which your function is invoked generally contains some extra components which need to be ignored to figure out if the request is a health check.

So if we’re removing health checks from Apollo Server, we can also remove path parsing; if you want to mount your GraphQL server at `/api/graphql`, you should do that via `app.use('/api/graphql', apolloServer.getMiddleware())` rather than via `app.use(apolloServer.getMiddleware({ graphqlPath: '/api/graphql' }))` (both of which currently work with slightly and confusingly different semantics).

We may consider leaving health check support in `ApolloServerStandalone` (where you can't easily add your own HTTP path handlers), if compelling arguments for why it's superior to using `?query=%7B__typename%7D` as health check are provided.

### Replace `apollo-server-caching` with an existing key/value cache abstraction

The Apollo Server project includes the `apollo-server-caching` package, which defines an abstraction over key/value data stores like Redis and Memcached. This abstraction is used as a building block for several features such as the full-response cache implemented in `apollo-server-plugin-response-cache` and the caching HTTP client implemented in `apollo-datasource-rest`.  The Apollo Server project maintains implementations of this interface for Redis and Memcached; the broader community has implemented the interface for several additional backends.

However, there's really nothing GraphQL-specific about this interface. We've discovered that the [`keyv`](https://www.npmjs.com/package/keyv) project defines a nearly-identical interface. This project has support for many backends including Redis and Memcached. If there are any backends that have an `apollo-server-caching` implementation and no `keyv` implementation, it's very easy to write your own `keyv` implementation, or one could easily write a tiny class to wrap any existing `apollo-server-caching` implementation as a `keyv` implementation.

In Apollo Server 4 we will stop maintaining `apollo-server-caching` and change Apollo Server to use `keyv` instead. This will allow us to focus on what we're best at (building tools for working with GraphQL) rather than the relatively unrelated project of building an abstract key-value cache API, and will immediately enable Apollo Server's caching features to work with any backend supported by `keyv`.

### Replace `apollo-server-env` with some `fetch` API typing package

While the `apollo-server-env` package used to provide a bunch of different polyfills, it now just provides TypeScript typings and polyfills for `fetch` and `URL` APIs. It seems very likely that we can use some maintained third-party package to provide these typings in a way that continues to be flexible enough to allow for multiple `fetch` implementations.

In the off-chance that such a package does not exist, we could maintain one ourselves, but with a more specific name like `@apollo/fetch-typings` and published from its own repository on a lifecycle not strictly tied to Apollo Server releases.

(One very possible answer would be to be all-in on `node-fetch`, in the sense that packages that want to run `fetch` directly depend on `node-fetch` and allow you to override the fetcher with fetcher options whose TypeScript types depend on those defined in `@types/node-fetch`.   `apollo-server-env` depends on `node-fetch` today so it seems likely that this will work. We should verify that this continues to support swapping in certain popular fetch replacements such as `make-fetch-happen`. (One odd bit is that `node-fetch` v3 only supports being used from ESM so we are sticking to v2 for now and probably should for AS4 as well.)

### Replace top-level `dataSources` option with a data sources plugin

The Data Sources and Plugins APIs were added to Apollo Server around the same time. With the benefit of hindsight, it does not appear that `dataSources` needs to be its own top-level option, as the plugin API provides a strict superset of the functionality available via the `dataSources` option.

The `apollo-datasource` package will move to its own repository and will continue to export its DataSource API, but also export a `dataSourcePlugin` function. Code that currently looks like:

```
const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      moviesAPI: new MoviesAPI(),
      personalizationAPI: new PersonalizationAPI(),
    };
  },
});
```

could be replaced by

```
import { dataSourcePlugin } from 'apollo-datasource';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [dataSourcePlugin(() => {
    return {
      moviesAPI: new MoviesAPI(),
      personalizationAPI: new PersonalizationAPI(),
    };
  })],
});
```

This could provide exactly the same functionality to data source implementations without `@apollo/server` needing to know anything about the `DataSource` interface.

### Move `apollo-datasource-rest` to its own repository

`apollo-datasource-rest` is a caching HTTP client for Node which uses our `apollo-server-caching` interface to talk to a cache.  Other than the fact that it implements the `DataSource` interface, its code is pretty unrelated to the rest of Apollo Server, and the current Apollo Server team has not been actively maintaining it, despite the fact that it's a nice piece of software that many find valuable.

Its version numbering is not particularly related to Apollo Server’s version number (as it is essentially unrelated code and backwards-incompatible changes to one package generally won’t cause backwards-incompatible changes to the other) but it is currently coupled to the Apollo Server release process: we can’t easily release it without releasing AS and vice versa, and its CHANGELOG is confusingly intermingled with Apollo Server changes. (These are certainly fixable problems if we wanted.)

Because it is semantically pretty independent from Apollo Server, we will move it to its own repository with its own CHANGELOG and issue tracker. We will also start actively maintaining it again, in collaboration with community members who use it more than we do internally at Apollo.

(Like the rest of Apollo Server, we will change it to use `keyv` instead of `apollo-server-caching`.)

### Move plugins which have their own package to their own repositories

Some plugins, like the usage reporting plugin, are built in to Apollo Server; they currently live in `apollo-server-core` and will live in `@apollo/server` in AS4. Other plugins live in their own packages.  These plugins will move to their own repositories. Specifically, this includes `apollo-server-plugin-operation-registry` and `apollo-server-plugin-response-cache`.

(Because `apollo-server-plugin-response-cache` will have no dependencies other than `@apollo/server` and `graphql`, it might be reasonable to merge it into `@apollo/server` as well. That said, keeping it as a separate package means we can make interface improvements to it on a versioning lifecycle that doesn't have to be strictly synchronized with the main Apollo Server API, so a separate package and repository is probably best.)


### Change usage reporting defaults backwards-incompatibly to send less data

In order to make usage reporting have better performance and less potential PII leakage by default, we should change the default usage reporting to send even less information by default.  We previously changed usage reporting to make variable and HTTP header reporting opt-in.  We should continue down this path to make sending error bodies in traces opt-in (though we should still probably track the number of errors by default). Furthermore, now that the [Unified Reporting](https://github.com/apollographql/apollo-server/pull/4142) and [referenced field usage](https://github.com/apollographql/apollo-server/issues/5708) projects are done, we can change the defaults to make *traces* be an opt-in feature (which gives you access to traces on the Operations page, field execution counts on the Fields page, and field latencies in Explorer and VSCode timing hints) that isn’t on by default.  This would mean that by default we would only send summarized statistics of operations, not any data about individual requests, and the only user-provided strings would be operation signatures (with literals removed as always).

### Set the stage for GraphQL modes other than "one response per request"

The current `ApolloServer` API makes it very challenging to change the fundamental model where web framework integrations ask `apollo-server-core` to process a request and receive a single response back. This means that it is challenging to implement features such as `@defer` and `@stream` directives or subscriptions.

When designing the new HTTP abstraction, we will ensure that it can support these features of the GraphQL spec. This does not necessarily mean we will ship support for `@defer` in `@apollo/server@4.0.0`; this roadmap is pretty long already, and so implementing these features are not currently in scope for the initial release. But a major goal of this release is to make implementing these features (in a way that works with all web framework integrations) easier.
