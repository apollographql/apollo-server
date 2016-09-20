# Changelog

### VNEXT

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
