# Changelog

### vNEXT

### v2.3.3

- `apollo-server` (only): Stop double-invocation of `serverWillStart` life-cycle event.  (More specific integrations - e.g. Express, Koa, Hapi, etc. - were unaffected.) [PR #2239](https://github.com/apollographql/apollo-server/pull/2239)
- Avoid traversing `graphql-upload` module tree in run-time environments which aren't Node.js. [PR #2235](https://github.com/apollographql/apollo-server/pull/2235)

### v2.3.2

- Switch from `json-stable-stringify` to `fast-json-stable-stringify`. [PR #2065](https://github.com/apollographql/apollo-server/pull/2065)
- Fix cache hints of `maxAge: 0` to mean "uncachable". [#2197](https://github.com/apollographql/apollo-server/pull/2197)
- Apply `defaultMaxAge` to scalar fields on the root object. [#2210](https://github.com/apollographql/apollo-server/pull/2210)
- Don't write to the persisted query cache until execution will begin. [PR #2227](https://github.com/apollographql/apollo-server/pull/2227)

### v2.3.1

- Provide types for `graphql-upload` in a location where they can be accessed by TypeScript consumers of `apollo-server` packages. [ccf935f9](https://github.com/apollographql/apollo-server/commit/ccf935f9) [Issue #2092](https://github.com/apollographql/apollo-server/issues/2092)

### v2.3.0

- **BREAKING FOR NODE.JS <= 8.5.0 ONLY**: To continue using Apollo Server 2.x in versions of Node.js prior to v8.5.0, file uploads must be disabled by setting `uploads: false` on the `ApolloServer` constructor options.  Without explicitly disabling file-uploads, the server will `throw` at launch (with instructions and a link to our documentation).

  This early deprecation is due to changes in the third-party `graphql-upload` package which Apollo Server utilizes to implement out-of-the-box file upload functionality.  While, in general, Apollo Server 2.x aims to support all Node.js versions which were under an LTS policy at the time of its release, we felt this required an exception.  By `throw`-ing when `uploads` is not explicitly set to `false`, we aim to make it clear immediately (rather than surprisingly) that this deprecation has taken effect.

  While Node.js 6.x is covered by a [Long Term Support agreement by the Node.js Foundation](https://github.com/nodejs/Release#release-schedule) until April 2019, there are substantial performance (e.g. [V8](https://v8.dev/) improvements) and language changes (e.g. "modern" ECMAScript support) offered by newer Node.js engines (e.g. 8.x, 10.x).  We encourage _all users_ of Apollo Server to update to newer LTS versions of Node.js prior to the "end-of-life" dates for their current server version.

  **We intend to drop support for Node.js 6.x in the next major version of Apollo Server.**
  
  For more information, see [PR #2054](https://github.com/apollographql/apollo-server/pull/2054) and [our documentation](https://www.apollographql.com/docs/apollo-server/v2/migration-file-uploads.html).
  
### v2.2.7

- `apollo-engine-reporting`: When multiple instances of `apollo-engine-reporting` are loaded (an uncommon edge case), ensure that `encodedTraces` are handled only once rather than once per loaded instance. [PR #2040](https://github.com/apollographql/apollo-server/pull/2040)

### v2.2.6

- `apollo-server-micro`: Set the `Content-type` to `text/html` for GraphQL Playground. [PR #2026](https://github.com/apollographql/apollo-server/pull/2026)

### v2.2.5

- Follow-up on the update to `graphql-playground-html` in previous release by also bumping the minor version of the `graphql-playground-react` dependency to `1.7.10` — which is the version requested from the from the CDN bundle by `graphql-playground-html`. [PR #2037](https://github.com/apollographql/apollo-server/pull/2037)

### v2.2.4

- Fix GraphQL Playground documentation scrolling bug in Safari by updating to latest (rebased) fork of `graphql-playground-html`. [PR #2037](https://github.com/apollographql/apollo-server/pull/2037)

### v2.2.3

- When `generateClientInfo` is not used to define the client name, client version and
client reference ID, Apollo Server will now default to the values present in the HTTP headers
of the request (`apollographql-client-name`, `apollographql-client-reference-id` and
`apollographql-client-version` respectively).  As a last resort, when those headers are not set,
the query extensions' `clientInfo` values will be used. [PR #1960](https://github.com/apollographql/apollo-server/pull/1960)

### v2.2.2

- Fixed TypeScript 2.2 compatibility via updated `apollo-tooling` dependency. [Issue #1951](https://github.com/apollographql/apollo-server/issues/1951) [`26d6c739`](https://github.com/apollographql/apollo-server/commit/26d6c739505b3112694e641c272c748ce38ba86b)
- Throw a more specific error when asynchronous introspection query behavior is detected. [PR #1955](https://github.com/apollographql/apollo-server/pull/1955)

### v2.2.1

- Added support for an array of `modules` on the `ApolloServer` constructor options.  Each element of the `modules` can point to a module which exports `typeDefs` and `resolvers`.  These modules can be used in lieu of, or in combination with, directly specifying `schema` or `typeDefs`/`resolvers` on the constructor options.  This provides greater modularity and improved organization for logic which might be limited to a specific service. [`8f6481e6`](https://github.com/apollographql/apollo-server/commit/8f6481e60f8418738f9ebbe9d5ab5e7e2ce4d319).
- Added `resolveObject` support to query execution.  [`bb67584`](https://github.com/apollographql/apollo-server/commit/bb67584a224843a5b2509c2ebdd94e616fe6227c).
- Fix broken `apollo-server-cloud-functions` in 2.2.0 caused by missing TypeScript project references which resulted in the package not being published to npm in compiled form. [PR #1948](https://github.com/apollographql/apollo-server/pull/1948)

### v2.2.0

- New request pipeline, including support for plugins which can implement lifecycle hooks at various stages of a request. [PR #1795](https://github.com/apollographql/apollo-server/pull/1795).
- Introduce new `apollo-server-testing` utilities. [PR #1909](https://github.com/apollographql/apollo-server/pull/1909)
- Fix mocks configuration to allow disabling of mocks by using `mocks: false`, even if `mockEntireSchema` is `true`. [PR #1835](https://github.com/apollographql/apollo-server/pull/1835)
- Update `graphql-playground-html` to 1.7.8. [PR #1855](https://github.com/apollographql/apollo-server/pull/1855)
- Bring back Azure functions support [Issue #1752](https://github.com/apollographql/apollo-server/issue/1752) [PR #1753](https://github.com/apollographql/apollo-server/pull/1753)
- Allow an optional function to resolve the `rootValue`, passing the `DocumentNode` AST to determine the value. [PR #1555](https://github.com/apollographql/apollo-server/pull/1555)
- Follow-up on the work in [PR #1516](https://github.com/apollographql/apollo-server/pull/1516) to also fix missing insertion cursor/caret when a custom GraphQL configuration is specified which doesn't specify its own `cursorShape` property. [PR #1607](https://github.com/apollographql/apollo-server/pull/1607)
- Azure functions support [Issue #1752](https://github.com/apollographql/apollo-server/issue/1752) [PR #1753](https://github.com/apollographql/apollo-server/pull/1753) [PR #1948](https://github.com/apollographql/apollo-server/pull/1948)
- Allow JSON parsing in `RESTDataSource` of Content Type `application/hal+json`. [PR #185](https://github.com/apollographql/apollo-server/pull/1853)
- Add support for a `requestAgent` configuration parameter within the `engine` configuration.  This can be utilized when a proxy is necessary to transmit tracing and metrics data to Apollo Engine.  It accepts either an [`http.Agent`](https://nodejs.org/docs/latest-v8.x/api/http.html#http_class_http_agent) or [`https.Agent`](https://nodejs.org/docs/latest-v8.x/api/https.html#https_class_https_agent) and behaves the same as the `agent` parameter to Node.js' [`http.request`](https://nodejs.org/docs/latest-v8.x/api/http.html#http_http_request_options_callback). [PR #1879](https://github.com/apollographql/apollo-server/pull/1879)

### v2.1.0

- Updated the google-cloud-functions package to handle null paths [PR #1674](https://github.com/apollographql/apollo-server/pull/1674)
- Update link inside Authentication Docs [PR #1682](https://github.com/apollographql/apollo-server/pull/1682)
- Fix making sure all headers are getting reported to Engine properly when using `privateHeaders` [PR #1689](https://github.com/apollographql/apollo-server/pull/1689)
- _(experimental, subject to change/removal)_ Provide ability to specify client info in traces [#1631](https://github.com/apollographql/apollo-server/pull/1631)

### v2.0.8

- Reporting: Catch Error if JSON.Stringify Fails for Engine Trace [PR #1668](https://github.com/apollographql/apollo-server/pull/1668)
- Core: Allow context to be passed to all GraphQLExtension methods. [PR #1547](https://github.com/apollographql/apollo-server/pull/1547)

### v2.0.7

- Fix [#1581](https://github.com/apollographql/apollo-server/issues/1581) `apollo-server-micro` top level error response [#1619](https://github.com/apollographql/apollo-server/pull/1619)
- Switch `ApolloServerBase.schema` from private access to protected access. [#1610](https://github.com/apollographql/apollo-server/pull/1610)
- Add toggle for including error messages in reports [#1615](https://github.com/apollographql/apollo-server/pull/1615)
- Fix `apollo-server-cloud-functions` tests [#1611](https://github.com/apollographql/apollo-server/pull/1611/)

### v2.0.6

- Update `graphql-playground-html` to 1.7.4 [#1586](https://github.com/apollographql/apollo-server/pull/1586)
- Add support for `graphql-js` v14 by augmenting typeDefs with the `@cacheControl` directive so SDL validation doesn't fail [#1595](https://github.com/apollographql/apollo-server/pull/1595)
- Add `node-fetch` extensions typing to `RequestInit` [#1602](https://github.com/apollographql/apollo-server/pull/1602)

### v2.0.5

- Google Cloud Function support [#1402](https://github.com/apollographql/apollo-server/issues/1402) [#1446](https://github.com/apollographql/apollo-server/pull/1446)
- Switch to a fork of `apollo-upload-server` to fix missing `core-js` dependency. [#1556](https://github.com/apollographql/apollo-server/pull/1556)

### v2.0.4

- apollo-server: Release due to failed build and install

### v2.0.3

- apollo-server: failed publish
- pass payload into context function for subscriptions [#1513](https://github.com/apollographql/apollo-server/pull/1513)
- Add option to mock the entire schema(i.e. sets preserveResolvers) [PR #1546](https://github.com/apollographql/apollo-server/pull/1546)

### v2.0.2

- Release with Lerna 3 due
- Hapi: Allow additional route options to be passed to Hapi.js plugin. [PR #1384](https://github.com/apollographql/apollo-server/pull/1384)
- express, koa: remove next after playground [#1436](https://github.com/apollographql/apollo-server/pull/1436)
- Hapi: Pass the response toolkit to the context function. [#1407](https://github.com/apollographql/apollo-server/pull/1407)
- update apollo-engine-reporting-protobuf to non-beta [#1429](https://github.com/apollographql/apollo-server/pull/1429)
- playground would use its own settings as default [#1516](https://github.com/apollographql/apollo-server/pull/1516)
- Lambda: Look in event.path first when picking endpoint for GraphQL Playground [#1527](https://github.com/apollographql/apollo-server/pull/1527)
- Fix to allow enabling GraphQL Playground in production with custom config [#1495](https://github.com/apollographql/apollo-server/pull/1495)

### v2.0.1

- This version failed to publish fully/correctly and should not be used.

### v2.0.0-rc.10

- Fix and Export Extension and Playground Types [#1360](https://github.com/apollographql/apollo-server/pull/1360)
- Pin internal dependencies [#1361](https://github.com/apollographql/apollo-server/pull/1361)

### v2.0.0-rc.9

- This version failed to publish fully/correctly and should not be used.

### v2.0.0-rc.8

- export GraphQLUpload from integrations [#1322](https://github.com/apollographql/apollo-server/pull/1322)
- add `cors` to vanilla [#1335](https://github.com/apollographql/apollo-server/pull/1335)
- export `bodyParser.Options` to koa [#1334](https://github.com/apollographql/apollo-server/pull/1334)
- add and use playground in ApolloServer constructor [#1297](https://github.com/apollographql/apollo-server/pull/1297)
- **breaking**: remove calculate headers as function [#1337](https://github.com/apollographql/apollo-server/pull/1337)
- **breaking**: remove `formatParams` [#1331](https://github.com/apollographql/apollo-server/pull/1331)

### v2.0.0-rc.7

- enable engine reporting from lambda [#1313](https://github.com/apollographql/apollo-server/pull/1313)
- remove flattening of errors [#1288](https://github.com/apollographql/apollo-server/pull/1288)
- dynamic url in datasourece ([#1277](https://github.com/apollographql/apollo-server/pull/1277))

### v2.0.0-rc.6

- BREAKING: errors are passed to user extensions, then engine reporting, and finally `formatError` ([#1272](https://github.com/apollographql/apollo-server/pull/1272))
- `formatError` only called once on validation errors ([#1272](https://github.com/apollographql/apollo-server/pull/1272))
- BREAKING: apollo-server-env does place types in global namespace ([#1259](https://github.com/apollographql/apollo-server/pull/1259))
- export Request from apollo-datasource-rest and graphql-extensions (53d7a75 c525818)
- Use scoped graphql-playground and centralize version (8ea36d8, 84233d2)
- fix dependencies + exports ([#1257](https://github.com/apollographql/apollo-server/pull/1257))
- fix data source + context cloning (7e35305)
- use fetch instead of Node request for engine-reporting ([#1274](https://github.com/apollographql/apollo-server/pull/1274))

### v2.0.0-rc.5

- fix formatError to keep prototype of Error ([#1235](https://github.com/apollographql/apollo-server/pull/1235))

### v2.0.0-rc.4

- Add trailing slash to data source
- allow body passed to data source
- new apollo-engine-reporting agent

### v2.0.0-rc.3

- graphql as peerDependency ([#1232](https://github.com/apollographql/apollo-server/pull/1232))
- APQ in batches ([#1234](https://github.com/apollographql/apollo-server/pull/1234))
- APQ hits/misses in traces

### v2.0.0-rc.2

- Missing apollo-upload-server dependency ([#1221](https://github.com/apollographql/apollo-server/pull/1221))
- encode trace report over each request in apollo-engine-reporting

### v2.0.0-rc.1

- BREAKING: remove logFunction ([71a403d](https://github.com/apollographql/apollo-server/pull/1125/commits/71a403dfa38ee050606d3fa32630005e0a98016f)), see [this commit](https://github.com/apollographql/apollo-server/blob/8914b135df9840051fe81cc9224b444cfc5b61ab/packages/apollo-server-core/src/logging.ts) for an implementation
- move upload option to constructor ([#1204](https://github.com/apollographql/apollo-server/pull/1204))
- fixed hapi gui bugs ([#1211](https://github.com/apollographql/apollo-server/pull/1211))
- remove requirement for exModuleInterop ([#1210](https://github.com/apollographql/apollo-server/pull/1210))
- change BadUserInputError to UserInputError ([#1208](https://github.com/apollographql/apollo-server/pull/1208))
- add cache-control headers for CDN integration ([#1138](https://github.com/apollographql/apollo-server/pull/1138))
- Lambda support (thanks to @adnsio, @bwlt, and @gragio [#1138](https://github.com/apollographql/apollo-server/pull/1138))

Data sources

- add memcache and redis support ([#1191](https://github.com/apollographql/apollo-server/pull/1191))
- add patch method ([#1190](https://github.com/apollographql/apollo-server/pull/1190))

### v2.0.0-rc.0

- Breaking: `registerServer` changed to `server.applyMiddleware` ([3279991](https://github.com/apollographql/apollo-server/pull/1125/commits/327999174cfbcecaa4e401ffd7b2d7148ba0fd65))
- Breaking: subscriptions enabled with `installSubscriptionHandlers`
- Add Data Sources ([#1163](https://github.com/apollographql/apollo-server/pull/1163))

### v2.0.0-beta.4

- Bug fix to allow async context ([#1129](https://github.com/apollographql/apollo-server/pull/1129))
- logFunction is now an extension ([#1128](https://github.com/apollographql/apollo-server/pull/1128))
- Allow user defined extensions and include engine reporting ([#1105](https://github.com/apollographql/apollo-server/pull/#105))

### v2.0.0-beta.3

- remove registerServer configuration from `apollo-server`'s listen ([#1090](https://github.com/apollographql/apollo-server/pull/1090))
- move healthcheck into variants ([#1086](https://github.com/apollographql/apollo-server/pull/1086))
- Add file uploads, **breaking** requires removing `scalar Upload` from the typeDefs ([#1071](https://github.com/apollographql/apollo-server/pull/1071))
- Add reporting to Engine as apollo-engine-reporting ([#1105](https://github.com/apollographql/apollo-server/pull/1105))
- Allow users to define extensions ([#1105](https://github.com/apollographql/apollo-server/pull/1105))

### v2.0.0-beta.2

ListenOptions:

- `engine` -> `engineProxy`
- `port`, `host`, and other http options moved under `http` key ([#1080](https://github.com/apollographql/apollo-server/pull/1080))

- `subscriptions` moved to `server.listen` ([#1059](https://github.com/apollographql/apollo-server/pull/1059))
- Add mocks to server constructor ([#1017](https://github.com/apollographql/apollo-server/pull/1017))
- Add `bodyParserConfig` parameter to `registerServer` in apollo-server ([#1059](https://github.com/apollographql/apollo-server/pull/1059)) [commit](https://github.com/apollographql/apollo-server/pull/1063/commits/d08f862063b60f35d92f903c9ac52702150c10f6)
- Hapi variant ([#1058](https://github.com/apollographql/apollo-server/pull/1058)) ([#1082](https://github.com/apollographql/apollo-server/pull/1082))
- Remove tests and guaranteed support for Node 4 [PR #1024](https://github.com/apollographql/apollo-server/pull/1024)
- Cleanup docs [PR #1233](https://github.com/apollographql/apollo-server/pull/1233/files)

### 1.4.0

- [Issue #626] Integrate apollo-fastify plugin. [PR #1013](https://github.com/apollographql/apollo-server/pull/1013)
- add hapi 16 next() invocation [PR #743](https://github.com/apollographql/apollo-server/pull/743)
- Add skipValidation option [PR #839](https://github.com/apollographql/apollo-server/pull/839)
- `apollo-server-module-graphiql`: adds an option to the constructor to disable url rewriting when editing a query [PR #1047](https://github.com/apollographql/apollo-server/pull/1047)
- Upgrade `subscription-transport-ws` to 0.9.9 for Graphiql

### v1.3.6

- Recognize requests with Apollo Persisted Queries and return `PersistedQueryNotSupported` to the client instead of a confusing error. [PR #982](https://github.com/apollographql/apollo-server/pull/982)

### v1.3.5

- `apollo-server-adonis`: The `Content-type` of an operation response will now be correctly set to `application/json`. [PR #842](https://github.com/apollographql/apollo-server/pull/842) [PR #910](https://github.com/apollographql/apollo-server/pull/910)
- `apollo-server-azure-functions`: Fix non-functional Azure Functions implementation and update examples in Azure Functions' `README.md`. [PR #753](https://github.com/apollographql/apollo-server/pull/753) [Issue #684](https://github.com/apollographql/apollo-server/issues/684)
- Fix `TypeError` on GET requests with missing `query` parameter. [PR #964](https://github.com/apollographql/apollo-server/pull/964)
- The typing on the context of `GraphQLServerOptions` now matches the equivilent type used by `graphql-tools`. [PR #919](https://github.com/apollographql/apollo-server/pull/919)
- Middleware handlers now used named (rather than anonymous) functions to enable easier identification during debugging/profiling. [PR #827](https://github.com/apollographql/apollo-server/pull/827)
- The `npm-check-updates` package has been removed as a "dev dependency" which was resulting in an _older_ version of `npm` being used during testing. [PR #959](https://github.com/apollographql/apollo-server/pull/959)
- The typing on `HttpQueryRequest`'s `query` attribute now enforces that its object properties' keys be `String`s. [PR #834](https://github.com/apollographql/apollo-server/pull/834)
- TypeScript types have been updated via updates to `@types/node`, `@types/connect`, `@types/koa` and `@types/aws-lambda`.

### v1.3.4

- Upgrade to `apollo-cache-control@0.1.0` and allow you to specify options to it (such as the new `defaultMaxAge`) by passing `cacheControl: {defaultMaxAge: 5}` instead of `cacheControl: true`.

### v1.3.3

- Updated peer dependencies to support `graphql@0.13.x`.
- `apollo-server-express`: The `GraphQLOptions` type is now exported from `apollo-server-express` in order to facilitate type checking when utilizing `graphqlExpress`, `graphiqlExpress`, `graphqlConnect` and `graphiqlConnect`. [PR #871](https://github.com/apollographql/apollo-server/pull/871)
- Update GraphiQL version to 0.11.11. [PR #914](https://github.com/apollographql/apollo-server/pull/914)

### v1.3.2

- Updated peer dependencies and tests to support `graphql@0.12`.
- Fix issue where the core `runQuery` method broke the ability to use the Node `async_hooks` feature's call stack. [PR #733](https://github.com/apollographql/apollo-server/pull/733)
- Hoist declarations of rarely used functions out of `doRunQuery` to improve performance. [PR# 821](https://github.com/apollographql/apollo-server/pull/821)

### v1.3.1

- Fixed a fatal execution error with the new `graphql@0.12`.

### v1.3.0

- **Breaking:** `apollo-server-hapi`: now supports Hapi v17, and no longer supports Hapi v16.  For information on running Apollo Server 1.x with Hapi v16, [check this documentation](https://www.apollographql.com/docs/apollo-server/v1/servers/hapi.html#Hapi-16).
- **New package**: `apollo-server-adonis` supporting the Adonis framework!
- The `graphqlOptions` parameter to server GraphQL integration functions now accepts context as a function and as an object with a prototype. [PR #679](https://github.com/apollographql/apollo-server/pull/679)
- `apollo-server-express`: Send Content-Length header.
- `apollo-server-micro`: Allow Micro 9 in `peerDependencies`. [PR #671](https://github.com/apollographql/apollo-server/pull/671)
- GraphiQL integration:
  - Recognize Websocket endpoints with secure `wss://` URLs.
  - Only include truthy values in GraphiQL URL.

### v1.2.0

- **New feature**: Add support for Apollo Cache Control. Enable `apollo-cache-control` by passing `cacheControl: true` to your server's GraphQL integration function.
- Include README.md in published npm packages.

### v1.1.7

- Added support for the vhost option for Hapi [PR #611](https://github.com/apollographql/apollo-server/pull/611)
- Fix dependency on `apollo-tracing` to be less strict.

### v1.1.6

- GraphiQL integration: add support for `websocketConnectionParams` for subscriptions. [#452](https://github.com/apollographql/apollo-server/issues/452) [PR 548](https://github.com/apollographql/apollo-server/pull/548)

(v1.1.4 had a major bug and was immediately unpublished. v1.1.5 was identical to v1.1.6.)

### v1.1.3

- GraphiQL integration: Fixes bug where CORS would not allow `Access-Control-Allow-Origin: *` with credential 'include', changed to 'same-origin' [Issue #514](https://github.com/apollographql/apollo-server/issues/514)
- Updated peer dependencies to support `graphql@0.11`.

### v1.1.2

- Fixed bug with no URL query params with GraphiQL on Lambda [Issue #504](https://github.com/apollographql/apollo-server/issues/504) [PR #512](https://github.com/apollographql/apollo-server/pull/503)

### v1.1.1

- Added support for Azure Functions [#503](https://github.com/apollographql/apollo-server/pull/503)

### v1.1.0

- Added ability to provide custom default field resolvers [#482](https://github.com/apollographql/apollo-server/pull/482)
- Add `tracing` option to collect and expose trace data in the [Apollo Tracing format](https://github.com/apollographql/apollo-tracing)
- Add support for GraphiQL editor themes in [#484](https://github.com/apollographql/apollo-server/pull/484) as requested in [#444](https://github.com/apollographql/apollo-server/issues/444)
- Add support for full websocket using GraphiQL [#491](https://github.com/apollographql/graphql-server/pull/491)
- Updated restify lib ([@yucun](https://github.com/liyucun/)) in [#472](https://github.com/apollographql/apollo-server/issues/472)
- Updated package apollo-server-micro, updated micro in devDependencies and peerDependencies to ^8.0.1

### v1.0.3

- Revert [#463](https://github.com/apollographql/graphql-server/pull/463),
  because it's a breaking change that shouldn't have been a patch update.

### v1.0.2

- Rename packages from graphql-server- to apollo-server- [#465](https://github.com/apollographql/apollo-server/pull/465). We'll continue to publish `graphql-server-` packages that depend on the renamed `apollo-server-` packages for the time being, to ensure backwards compatibility.

### v1.0.1

- Fix Express package not calling the callback on completion ([@chemdrew](https://github.com/chemdrew)) in [#463](https://github.com/apollographql/graphql-server/pull/463)

### v1.0.0

- Add package readmes for Express, Hapi, Koa, Restify ([@helfer](https://github.com/helfer)) in [#442](https://github.com/apollographql/graphql-server/pull/442)
- Updated & fixed typescript typings ([@helfer](https://github.com/helfer)) in [#440](https://github.com/apollographql/graphql-server/pull/440)

### v0.9.0

- Allow GraphiQLOptions to be a function ([@NeoPhi](https://github.com/NeoPhi)) on [#426](https://github.com/apollographql/graphql-server/pull/426)

### v0.8.5

- Fix: graphql-server-micro now properly returns response promises [#401](https://github.com/apollographql/graphql-server/pull/401)

### v0.8.4

### v0.8.3

### v0.8.2

- Fix issue with auto-updating dependencies that caused fibers to update accidentally ([@helfer](https://github.com/helfer)) on [#425](https://github.com/apollographql/graphql-server/pull/425)

### v0.8.1

- **Security Fix** Ensure queries submitted via HTTP GET run through validation ([@DxCx](https://github.com/DxCx)) on [#424](https://github.com/apollographql/graphql-server/pull/424)

### v0.8.0

- Persist `window.location.hash` on URL updates [#386](https://github.com/apollographql/graphql-server/issues/386)
- Added support for `graphql-js` > 0.10.0 [#407](https://github.com/apollographql/graphql-server/pull/407)
- Updated `subscriptions-transport-ws` for GraphiQL with subscriptions [#407](https://github.com/apollographql/graphql-server/pull/407)

### v0.7.2

- Fix include passHeader field that was accidentally removed

### v0.7.1

- Fix graphiql fetcher to use endpointURL parameter instead of hardcoded URI.[#365](https://github.com/apollographql/graphql-server/issues/356)

### v0.7.0

- Add Zeit Micro Integration [#324](https://github.com/apollographql/graphql-server/issues/324)
- add support for subscriptionURL to GraphiQL ([@urigo](https://github.com/urigo) on [#320](https://github.com/apollostack/graphql-server/pull/320)
- Restify: Fix for calling next() ([@jadkap](https://github.com/jadkap)) on [#285](https://github.com/apollostack/graphql-server/pull/285)
- **Breaking:** Update all dependencies [#329](https://github.com/apollographql/graphql-server/issues/329)

### v0.6.0

- Add AWS Lambda Integration [PR #247](https://github.com/apollostack/graphql-server/pull/247)
- Update GraphiQL to version 0.9.1 ([@ephemer](https://github.com/ephemer)) on [#293](https://github.com/apollostack/graphql-server/pull/293)
- **Restify integration** ([@joelgriffith](https://github.com/joelgriffith)) on [#189](https://github.com/apollostack/graphql-server/pull/189)
- run batched requests in parallel ([@DxCx](https://github.com/DxCx)) on [#273](https://github.com/apollostack/graphql-server/pull/273)
- Fix GraphiQL options variables. Issue #193. ([@alanchristensen](https://github.com/alanchristensen)) on
  [PR #255](https://github.com/apollostack/apollo-server/pull/255)
- Allow graphql@0.9.0 as peerDependency ([@Chris-R3](https://github.com/Chris-R3)) on [PR #278](https://github.com/apollostack/graphql-server/pull/278)

### v0.5.1

- add support for HTTP GET Method ([@DxCx](https://github.com/DxCx)) on [#180](https://github.com/apollostack/graphql-server/pull/180)

### v0.5.0

- Switch graphql typings for typescript to @types/graphql [#260](https://github.com/apollostack/graphql-server/pull/260)

### v0.4.4

- Update GraphiQL to version 0.8.0 ([@DxCx](https://github.com/DxCx)) on [#192](https://github.com/apollostack/graphql-server/pull/192)
- Upgrade to GraphQL-js 0.8.1.

### v0.4.2

- **Restructure Apollo Server into 6 new packages, and rename to GraphQL Server** ([@DxCx](https://github.com/DxCx)) and ([@stubailo](https://github.com/stubailo)) in [#183](https://github.com/apollostack/graphql-server/pull/183) and [#164](https://github.com/apollostack/graphql-server/pull/183).
- There are now 6 packages that make up the GraphQL server family:
  - `graphql-server-core`
  - `graphql-module-graphiql`
  - `graphql-module-operation-store`
  - `graphql-server-express`
  - `graphql-server-hapi`
  - `graphql-server-koa`
- Exports have been renamed. Everything that used to export `apollo*` now exports `graphql*`, for example `apolloExpress` has become `graphqlExpress`.
- The repository is now managed using [Lerna](https://github.com/lerna/lerna).

### v0.3.3

- Fix passHeader option in GraphiQL (Both Hapi and Koa)
- Pass `ctx` instead of `ctx.request` to options function in Koa integration ([@HriBB](https://github.com/HriBB)) in [PR #154](https://github.com/apollostack/apollo-server/pull/154)
- Manage TypeScript declaration files using npm. ([@od1k](https:/github.com/od1k) in [#162](https://github.com/apollostack/apollo-server/pull/162))
- Fix connect example in readme. ([@conrad-vanl](https://github.com/conrad-vanl) in [#165](https://github.com/apollostack/apollo-server/pull/165))
- Add try/catch to formatError. ([@nicolaslopezj](https://github.com/nicolaslopezj) in [#174](https://github.com/apollostack/apollo-server/pull/174))
- Clone context object for each query in a batch.

### v0.3.2

- Added missing exports for hapi integration ([@nnance](https://github.com/nnance)) in [PR #152](https://github.com/apollostack/apollo-server/pull/152)

### v0.3.1

- Fixed dependency issue with boom package that affected the hapi integration. ([@sammkj](https://github.com/sammkj) in [#150](https://github.com/apollostack/apollo-server/pull/150))

### v0.3.0

- Refactor Hapi integration to improve the API and make the plugins more idiomatic. ([@nnance](https://github.com/nnance)) in
  [PR #127](https://github.com/apollostack/apollo-server/pull/127)
- Fixed query batching with Hapi integration. Issue #123 ([@nnance](https://github.com/nnance)) in
  [PR #127](https://github.com/apollostack/apollo-server/pull/127)
- Add support for route options in Hapi integration. Issue #97. ([@nnance](https://github.com/nnance)) in
  [PR #127](https://github.com/apollostack/apollo-server/pull/127)
- Camelcase Hapi. Issue #129. ([@nnance](https://github.com/nnance)) in
  [PR #132](https://github.com/apollostack/apollo-server/pull/132)
- Fix error handling when parsing variables parameter. Issue #130. ([@nnance](https://github.com/nnance)) in
  [PR #131](https://github.com/apollostack/apollo-server/pull/131)
- Improve logging function. Issue #79. ([@nnance](https://github.com/nnance)) in
  [PR #136](https://github.com/apollostack/apollo-server/pull/136)
- Output stack trace for errors in debug mode. Issue #111. ([@nnance](https://github.com/nnance)) in
  [PR #137](https://github.com/apollostack/apollo-server/pull/137)
- Allow to pass custom headers in GraphiQL ([@nicolaslopezj](https://github.com/nicolaslopezj) in [#133](https://github.com/apollostack/apollo-server/pull/133)).

### v0.2.6

- Expose the OperationStore as part of the public API. ([@nnance](https://github.com/nnance))
- Support adding parsed operations to the OperationStore. ([@nnance](https://github.com/nnance))
- Expose ApolloOptions as part of the public API.

### v0.2.5

- Made promise compatible with fibers ([@benjamn](https://github.com/benjamn) in [#92](https://github.com/apollostack/apollo-server/pull/92))

### v0.2.2

- Log server events such as request start etc. with logFunction ([@helfer](https://github.com/helfer) in [#78](https://github.com/apollostack/apollo-server/pull/78))

### v0.2.1

- Complete refactor of Apollo Server using TypeScript. PR [#41](https://github.com/apollostack/apollo-server/pull/41)
- Added Hapi integration ([@nnance](https://github.com/nnance) in [#46](https://github.com/apollostack/apollo-server/pull/46))
- Added Koa integration ([@HriBB](https://github.com/HriBB) in [#59](https://github.com/apollostack/apollo-server/pull/59))
- Changed express integration to support connect as well ([@helfer](https://github.com/helfer) in [#58](https://github.com/apollostack/apollo-server/pull/58))
- Dropped express-graphql dependency
- Dropped support for GET requests, only POST requests are allowed now
- Split GraphiQL into a separate middleware
- Factored out core to support Hapi, Koa and connect implementations
- Added support for query batching
- Added support for query whitelisting / stored queries
- Removed body parsing from express integration. Body must be parsed outside of apollo now
- Added `formatRequest` and `formatResponse` functions to apollo options.
- Removed support for shorthand schema definitions, connectors and mocks (use `graphql-tools` instead)

### v0.1.5

- BUG: Fixed a spelling error with `tracer.submit()` from PR [#26](https://github.com/apollostack/apollo-server/pull/26)
  in PR [#31](https://github.com/apollostack/apollo-server/pull/31)

### v.0.1.4

- BUG: Fixed a bug with tracer mocks that would throw a TypeError when using Ava [#26](https://github.com/apollostack/apollo-server/pull/26)

### v0.1.3

- Updated graphql dependency to 0.6.0
