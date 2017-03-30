# Changelog

### VNEXT

* Restify: Fix for calling next() ([@jadkap](https://github.com/jadkap)) on [#285](https://github.com/apollostack/graphql-server/pull/285)
* Update GraphiQL to version 0.9.1 ([@ephemer](https://github.com/ephemer)) on [#293](https://github.com/apollostack/graphql-server/pull/293)
* Add AWS Lambda Integration [#101](https://github.com/apollostack/graphql-server/issues/101)

### v0.5.2
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
* Fixed query batching with Hapi integration.  Issue #123 ([@nnance](https://github.com/nnance)) in
[PR #127](https://github.com/apollostack/apollo-server/pull/127)
* Add support for route options in Hapi integration.  Issue #97. ([@nnance](https://github.com/nnance)) in
[PR #127](https://github.com/apollostack/apollo-server/pull/127)
* Camelcase Hapi.  Issue #129. ([@nnance](https://github.com/nnance)) in
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
