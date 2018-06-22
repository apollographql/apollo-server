# Changelog

All of the packages in the `apollo-server` repo are released with the same version numbers, so a new version of a particular package might not represent an actual change to that package. We generally try to mark changes that affect only one web server integration package with that package name, and don't specify package names for changes that affect most of the packages or which affect shared core packages.

### vNEXT

* Upgrade `subscription-transport-ws` to 0.9.9 for Graphiql
* Remove tests and guaranteed support for Node 4 [PR #1024](https://github.com/apollographql/apollo-server/pull/1024)
* Cleanup docs [PR #1233](https://github.com/apollographql/apollo-server/pull/1233/files)

### v1.3.6

* Recognize requests with Apollo Persisted Queries and return `PersistedQueryNotSupported` to the client instead of a confusing error. [PR #982](https://github.com/apollographql/apollo-server/pull/982)

### v1.3.5

* `apollo-server-adonis`: The `Content-type` of an operation response will now be correctly set to `application/json`. [PR #842](https://github.com/apollographql/apollo-server/pull/842) [PR #910](https://github.com/apollographql/apollo-server/pull/910)
* `apollo-server-azure-functions`: Fix non-functional Azure Functions implementation and update examples in Azure Functions' `README.md`. [PR #753](https://github.com/apollographql/apollo-server/pull/753) [Issue #684](https://github.com/apollographql/apollo-server/issues/684)
* Fix `TypeError` on GET requests with missing `query` parameter. [PR #964](https://github.com/apollographql/apollo-server/pull/964)
* The typing on the context of `GraphQLServerOptions` now matches the equivilent type used by `graphql-tools`. [PR #919](https://github.com/apollographql/apollo-server/pull/919)
* Middleware handlers now used named (rather than anonymous) functions to enable easier identification during debugging/profiling. [PR #827](https://github.com/apollographql/apollo-server/pull/827)
* The `npm-check-updates` package has been removed as a "dev dependency" which was resulting in an _older_ version of `npm` being used during testing. [PR #959](https://github.com/apollographql/apollo-server/pull/959)
* The typing on `HttpQueryRequest`'s `query` attribute now enforces that its object properties' keys be `String`s. [PR #834](https://github.com/apollographql/apollo-server/pull/834)
* TypeScript types have been updated via updates to `@types/node`, `@types/connect`, `@types/koa` and `@types/aws-lambda`.

### v1.3.4

* Upgrade to `apollo-cache-control@0.1.0` and allow you to specify options to it (such as the new `defaultMaxAge`) by passing `cacheControl: {defaultMaxAge: 5}` instead of `cacheControl: true`.

### v1.3.3

* Updated peer dependencies to support `graphql@0.13.x`.
* `apollo-server-express`: The `GraphQLOptions` type is now exported from `apollo-server-express` in order to facilitate type checking when utilizing `graphqlExpress`, `graphiqlExpress`, `graphqlConnect` and `graphiqlConnect`. [PR #871](https://github.com/apollographql/apollo-server/pull/871)
* Update GraphiQL version to 0.11.11. [PR #914](https://github.com/apollographql/apollo-server/pull/914)

### v1.3.2

* Updated peer dependencies and tests to support `graphql@0.12`.
* Fix issue where the core `runQuery` method broke the ability to use the Node `async_hooks` feature's call stack. [PR #733](https://github.com/apollographql/apollo-server/pull/733)
* Hoist declarations of rarely used functions out of `doRunQuery` to improve performance. [PR# 821](https://github.com/apollographql/apollo-server/pull/821)

### v1.3.1

* Fixed a fatal execution error with the new `graphql@0.12`.

### v1.3.0

* **Breaking:** `apollo-server-hapi`: now supports Hapi v17, and no longer supports Hapi v16. (We intend to release a new `apollo-server-hapi16` for users still on Hapi v16.)
* **New package**: `apollo-server-adonis` supporting the Adonis framework!
* The `graphqlOptions` parameter to server GraphQL integration functions now accepts context as a function and as an object with a prototype. [PR #679](https://github.com/apollographql/apollo-server/pull/679)
* `apollo-server-express`: Send Content-Length header.
* `apollo-server-micro`: Allow Micro 9 in `peerDependencies`. [PR #671](https://github.com/apollographql/apollo-server/pull/671)
* GraphiQL integration:
  * Recognize Websocket endpoints with secure `wss://` URLs.
  * Only include truthy values in GraphiQL URL.

### v1.2.0

* **New feature**: Add support for Apollo Cache Control. Enable `apollo-cache-control` by passing `cacheControl: true` to your server's GraphQL integration function.
* Include README.md in published npm packages.

### v1.1.7

* Added support for the vhost option for Hapi [PR #611](https://github.com/apollographql/apollo-server/pull/611)
* Fix dependency on `apollo-tracing` to be less strict.

### v1.1.6

* GraphiQL integration: add support for `websocketConnectionParams` for subscriptions. [#452](https://github.com/apollographql/apollo-server/issues/452) [PR 548](https://github.com/apollographql/apollo-server/pull/548)

(v1.1.4 had a major bug and was immediately unpublished. v1.1.5 was identical to v1.1.6.)

### v1.1.3

* GraphiQL integration: Fixes bug where CORS would not allow `Access-Control-Allow-Origin: *` with credential 'include', changed to 'same-origin' [Issue #514](https://github.com/apollographql/apollo-server/issues/514)
* Updated peer dependencies to support `graphql@0.11`.

### v1.1.2

* Fixed bug with no URL query params with GraphiQL on Lambda [Issue #504](https://github.com/apollographql/apollo-server/issues/504) [PR #512](https://github.com/apollographql/apollo-server/pull/503)

### v1.1.1

* Added support for Azure Functions [#503](https://github.com/apollographql/apollo-server/pull/503)

### v1.1.0

* Added ability to provide custom default field resolvers [#482](https://github.com/apollographql/apollo-server/pull/482)
* Add `tracing` option to collect and expose trace data in the [Apollo Tracing format](https://github.com/apollographql/apollo-tracing)
* Add support for GraphiQL editor themes in [#484](https://github.com/apollographql/apollo-server/pull/484) as requested in [#444](https://github.com/apollographql/apollo-server/issues/444)
* Add support for full websocket using GraphiQL [#491](https://github.com/apollographql/graphql-server/pull/491)
* Updated restify lib ([@yucun](https://github.com/liyucun/)) in [#472](https://github.com/apollographql/apollo-server/issues/472)
* Updated package apollo-server-micro, updated micro in devDependencies and peerDependencies to ^8.0.1

### v1.0.3

* Revert [#463](https://github.com/apollographql/graphql-server/pull/463),
  because it's a breaking change that shouldn't have been a patch update.

### v1.0.2

* Rename packages from graphql-server- to apollo-server- [#465](https://github.com/apollographql/apollo-server/pull/465). We'll continue to publish `graphql-server-` packages that depend on the renamed `apollo-server-` packages for the time being, to ensure backwards compatibility.

### v1.0.1

* Fix Express package not calling the callback on completion ([@chemdrew](https://github.com/chemdrew)) in [#463](https://github.com/apollographql/graphql-server/pull/463)

### v1.0.0

* Add package readmes for Express, Hapi, Koa, Restify ([@helfer](https://github.com/helfer)) in [#442](https://github.com/apollographql/graphql-server/pull/442)
* Updated & fixed typescript typings ([@helfer](https://github.com/helfer)) in [#440](https://github.com/apollographql/graphql-server/pull/440)

### v0.9.0

* Allow GraphiQLOptions to be a function ([@NeoPhi](https://github.com/NeoPhi)) on [#426](https://github.com/apollographql/graphql-server/pull/426)

### v0.8.5

* Fix: graphql-server-micro now properly returns response promises [#401](https://github.com/apollographql/graphql-server/pull/401)

### v0.8.4

### v0.8.3

### v0.8.2

* Fix issue with auto-updating dependencies that caused fibers to update accidentally ([@helfer](https://github.com/helfer)) on [#425](https://github.com/apollographql/graphql-server/pull/425)

### v0.8.1

* **Security Fix** Ensure queries submitted via HTTP GET run through validation ([@DxCx](https://github.com/DxCx)) on [#424](https://github.com/apollographql/graphql-server/pull/424)

### v0.8.0

* Persist `window.location.hash` on URL updates [#386](https://github.com/apollographql/graphql-server/issues/386)
* Added support for `graphql-js` > 0.10.0 [#407](https://github.com/apollographql/graphql-server/pull/407)
* Updated `subscriptions-transport-ws` for GraphiQL with subscriptions [#407](https://github.com/apollographql/graphql-server/pull/407)

### v0.7.2

* Fix include passHeader field that was accidentally removed

### v0.7.1

* Fix graphiql fetcher to use endpointURL parameter instead of hardcoded URI.[#365](https://github.com/apollographql/graphql-server/issues/356)

### v0.7.0

* Add Zeit Micro Integration [#324](https://github.com/apollographql/graphql-server/issues/324)
* add support for subscriptionURL to GraphiQL ([@urigo](https://github.com/urigo) on [#320](https://github.com/apollostack/graphql-server/pull/320)
* Restify: Fix for calling next() ([@jadkap](https://github.com/jadkap)) on [#285](https://github.com/apollostack/graphql-server/pull/285)
* **Breaking:** Update all dependencies [#329](https://github.com/apollographql/graphql-server/issues/329)

### v0.6.0

* Add AWS Lambda Integration [PR #247](https://github.com/apollostack/graphql-server/pull/247)
* Update GraphiQL to version 0.9.1 ([@ephemer](https://github.com/ephemer)) on [#293](https://github.com/apollostack/graphql-server/pull/293)
* **Restify integration** ([@joelgriffith](https://github.com/joelgriffith)) on [#189](https://github.com/apollostack/graphql-server/pull/189)
* run batched requests in parallel ([@DxCx](https://github.com/DxCx)) on [#273](https://github.com/apollostack/graphql-server/pull/273)
* Fix GraphiQL options variables. Issue #193. ([@alanchristensen](https://github.com/alanchristensen)) on
  [PR #255](https://github.com/apollostack/apollo-server/pull/255)
* Allow graphql@0.9.0 as peerDependency ([@Chris-R3](https://github.com/Chris-R3)) on [PR #278](https://github.com/apollostack/graphql-server/pull/278)

### v0.5.1

* add support for HTTP GET Method ([@DxCx](https://github.com/DxCx)) on [#180](https://github.com/apollostack/graphql-server/pull/180)

### v0.5.0

* Switch graphql typings for typescript to @types/graphql [#260](https://github.com/apollostack/graphql-server/pull/260)

### v0.4.4

* Update GraphiQL to version 0.8.0 ([@DxCx](https://github.com/DxCx)) on [#192](https://github.com/apollostack/graphql-server/pull/192)
* Upgrade to GraphQL-js 0.8.1.

### v0.4.2

* **Restructure Apollo Server into 6 new packages, and rename to GraphQL Server** ([@DxCx](https://github.com/DxCx)) and ([@stubailo](https://github.com/stubailo)) in [#183](https://github.com/apollostack/graphql-server/pull/183) and [#164](https://github.com/apollostack/graphql-server/pull/183).
* There are now 6 packages that make up the GraphQL server family:
  * `graphql-server-core`
  * `graphql-module-graphiql`
  * `graphql-module-operation-store`
  * `graphql-server-express`
  * `graphql-server-hapi`
  * `graphql-server-koa`
* Exports have been renamed. Everything that used to export `apollo*` now exports `graphql*`, for example `apolloExpress` has become `graphqlExpress`.
* The repository is now managed using [Lerna](https://github.com/lerna/lerna).

### v0.3.3

* Fix passHeader option in GraphiQL (Both Hapi and Koa)
* Pass `ctx` instead of `ctx.request` to options function in Koa integration ([@HriBB](https://github.com/HriBB)) in [PR #154](https://github.com/apollostack/apollo-server/pull/154)
* Manage TypeScript declaration files using npm. ([@od1k](https:/github.com/od1k) in [#162](https://github.com/apollostack/apollo-server/pull/162))
* Fix connect example in readme. ([@conrad-vanl](https://github.com/conrad-vanl) in [#165](https://github.com/apollostack/apollo-server/pull/165))
* Add try/catch to formatError. ([@nicolaslopezj](https://github.com/nicolaslopezj) in [#174](https://github.com/apollostack/apollo-server/pull/174))
* Clone context object for each query in a batch.

### v0.3.2

* Added missing exports for hapi integration ([@nnance](https://github.com/nnance)) in [PR #152](https://github.com/apollostack/apollo-server/pull/152)

### v0.3.1

* Fixed dependency issue with boom package that affected the hapi integration. ([@sammkj](https://github.com/sammkj) in [#150](https://github.com/apollostack/apollo-server/pull/150))

### v0.3.0

* Refactor Hapi integration to improve the API and make the plugins more idiomatic. ([@nnance](https://github.com/nnance)) in
  [PR #127](https://github.com/apollostack/apollo-server/pull/127)
* Fixed query batching with Hapi integration. Issue #123 ([@nnance](https://github.com/nnance)) in
  [PR #127](https://github.com/apollostack/apollo-server/pull/127)
* Add support for route options in Hapi integration. Issue #97. ([@nnance](https://github.com/nnance)) in
  [PR #127](https://github.com/apollostack/apollo-server/pull/127)
* Camelcase Hapi. Issue #129. ([@nnance](https://github.com/nnance)) in
  [PR #132](https://github.com/apollostack/apollo-server/pull/132)
* Fix error handling when parsing variables parameter. Issue #130. ([@nnance](https://github.com/nnance)) in
  [PR #131](https://github.com/apollostack/apollo-server/pull/131)
* Improve logging function. Issue #79. ([@nnance](https://github.com/nnance)) in
  [PR #136](https://github.com/apollostack/apollo-server/pull/136)
* Output stack trace for errors in debug mode. Issue #111. ([@nnance](https://github.com/nnance)) in
  [PR #137](https://github.com/apollostack/apollo-server/pull/137)
* Allow to pass custom headers in GraphiQL ([@nicolaslopezj](https://github.com/nicolaslopezj) in [#133](https://github.com/apollostack/apollo-server/pull/133)).

### v0.2.6

* Expose the OperationStore as part of the public API. ([@nnance](https://github.com/nnance))
* Support adding parsed operations to the OperationStore. ([@nnance](https://github.com/nnance))
* Expose ApolloOptions as part of the public API.

### v0.2.5

* Made promise compatible with fibers ([@benjamn](https://github.com/benjamn) in [#92](https://github.com/apollostack/apollo-server/pull/92))

### v0.2.2

* Log server events such as request start etc. with logFunction ([@helfer](https://github.com/helfer) in [#78](https://github.com/apollostack/apollo-server/pull/78))

### v0.2.1

* Complete refactor of Apollo Server using TypeScript. PR [#41](https://github.com/apollostack/apollo-server/pull/41)
* Added Hapi integration ([@nnance](https://github.com/nnance) in [#46](https://github.com/apollostack/apollo-server/pull/46))
* Added Koa integration ([@HriBB](https://github.com/HriBB) in [#59](https://github.com/apollostack/apollo-server/pull/59))
* Changed express integration to support connect as well ([@helfer](https://github.com/helfer) in [#58](https://github.com/apollostack/apollo-server/pull/58))
* Dropped express-graphql dependency
* Dropped support for GET requests, only POST requests are allowed now
* Split GraphiQL into a separate middleware
* Factored out core to support Hapi, Koa and connect implementations
* Added support for query batching
* Added support for query whitelisting / stored queries
* Removed body parsing from express integration. Body must be parsed outside of apollo now
* Added `formatRequest` and `formatResponse` functions to apollo options.
* Removed support for shorthand schema definitions, connectors and mocks (use `graphql-tools` instead)

### v0.1.5

* BUG: Fixed a spelling error with `tracer.submit()` from PR [#26](https://github.com/apollostack/apollo-server/pull/26)
  in PR [#31](https://github.com/apollostack/apollo-server/pull/31)

### v.0.1.4

* BUG: Fixed a bug with tracer mocks that would throw a TypeError when using Ava [#26](https://github.com/apollostack/apollo-server/pull/26)

### v0.1.3

* Updated graphql dependency to 0.6.0
