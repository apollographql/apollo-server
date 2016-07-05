# Changelog

### v0.2.0
* Complete refactor of Apollo Server using TypeScript. PR [#41](https://github.com/apollostack/apollo-server/pull/41) including the following changes:
* Dropped express-graphql dependency
* Dropped support for GET requests, only POST requests are allowed now
* Split GraphiQL into a separate middleware
* Factored out core to support HAPI, Koa and connect implementations
* Added support for query batching
* Added support for query whitelisting / stored queries
* Removed body parsing from express integration. Body must be parsed outside of apollo now
* Added `formatRequest` and `formatResponse` functions to apollo options.
* Removed support for shorthand schema definitions, connectors and mocks (use `graphql-tools` instead)


### v0.1.5
* BUG: Fixed a spelling error with `tracer.submit()` from PR [#26]((https://github.com/apollostack/apollo-server/pull/26)
 in PR [#31](https://github.com/apollostack/apollo-server/pull/31)

### v.0.1.4

* BUG: Fixed a bug with tracer mocks that would throw a TypeError when using Ava [#26](https://github.com/apollostack/apollo-server/pull/26)

### v0.1.3

* Updated graphql dependency to 0.6.0
