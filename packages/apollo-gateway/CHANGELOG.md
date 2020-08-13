# CHANGELOG for `@apollo/gateway`

## vNEXT

> The changes noted within this `vNEXT` section have not been released yet.  New PRs and commits which introduce changes should include an entry in this `vNEXT` section as part of their development.  When a release is being prepared, a new header will be (manually) created below and the appropriate changes within that release will be moved into the new section.

- _Nothing yet! Stay tuned!_

## v0.19.0

- Only changes in the similarly versioned `@apollo/federation` package.

## v0.18.1

- __FIX__: Pass null required fields correctly within the parent object to resolvers. When a composite field was null, it would sometimes be expanded into an object with all null subfields and passed to the resolver. This fix prevents this expansion and sets the field to null, as originally intended. [PR #4157](https://github.com/apollographql/apollo-server/pull/4157)
- __FIX__: Prevent gateway from entering an inoperable state after an initial configuration load failure. [PR #4277](https://github.com/apollographql/apollo-server/pull/4277)

## v0.18.0

- The `RemoteGraphQLDataSource`'s `didEncounterError` method will now receive [`Response`](https://github.com/apollographql/apollo-server/blob/43470d6561bee31101f3afc56bdd154db3f92b30/packages/apollo-server-env/src/fetch.d.ts#L98-L111) as the third argument when it is available, making its signature `(error: Error, fetchRequest: Request, fetchResponse?: Response)`.  This compliments the existing [`Request`](https://github.com/apollographql/apollo-server/blob/43470d6561bee31101f3afc56bdd154db3f92b30/packages/apollo-server-env/src/fetch.d.ts#L37-L45) type it was already receiving.  Both of these types are [HTTP WHATWG Fetch API](https://fetch.spec.whatwg.org/) types, not `GraphQLRequest`, `GraphQLResponse` types.

## v0.17.0

- __BREAKING__: Move federation metadata from custom objects on schema nodes over to the `extensions` field on schema nodes which are intended for metadata. This is a breaking change because it narrows the `graphql` peer dependency from `^14.0.2` to `^14.5.0` which is when [`extensions` were introduced](https://github.com/graphql/graphql-js/pull/2097) for all Type System objects. [PR #4313](https://github.com/apollographql/apollo-server/pull/4313)

## v0.16.11

- Only changes in the similarly versioned `@apollo/federation` package.

## v0.16.10

- The default branch of the repository has been changed to `main`.  As this changed a number of references in the repository's `package.json` and `README.md` files (e.g., for badges, links, etc.), this necessitates a release to publish those changes to npm. [PR #4302](https://github.com/apollographql/apollo-server/pull/4302)
- __FIX__: The cache implementation for the HTTP-fetcher which is used when communicating with the Apollo Registry when the gateway is configured to use [managed federation](https://www.apollographql.com/docs/graph-manager/managed-federation/overview/) will no longer write to its cache when it receives a 304 response.  This is necessary since such a response indicates that the cache used to conditionally make the request must already be present.  This does not affect GraphQL requests at runtime, only the polling and fetching mechanism for retrieving composed schemas under manged federation. [PR #4325](https://github.com/apollographql/apollo-server/pull/4325)
- __FIX__: The `mergeFieldNodeSelectionSets` method no longer mutates original FieldNode objects. Before, it was updating the selection set of the original object, corrupting the data accross requests.

## v0.16.9

- Only changes in the similarly versioned `@apollo/federation` package.

## v0.16.7

- Bumped the version of `apollo-server-core`, but no other changes!

## v0.16.6

- Only changes in the similarly versioned `@apollo/federation` package.

## v0.16.5

- Only changes in the similarly versioned `@apollo/federation` package.

## v0.16.4

- __NEW__: Provide the `requestContext` as an argument to the experimental callback function `experimental_didResolveQueryPlan`. [#4173](https://github.com/apollographql/apollo-server/pull/4173)

## v0.16.3

- This updates a dependency of `apollo-server-core` that is only used for its TypeScript typings, not for any runtime dependencies.  The reason for the upgrade is that the `apollo-server-core` package (again, used only for types!) was affected by a GitHub Security Advisory.  [See the related `CHANGELOG.md` for Apollo Server for more details, including a link to the advisory](https://github.com/apollographql/apollo-server/blob/354d9910e1c87af93c7d50263a28554b449e48db/CHANGELOG.md#v2142).

## v0.16.2

- __FIX__: Collapse nested required fields into a single body in the query plan. Before, some nested fields' selection sets were getting split, causing some of their subfields to be dropped when executing the query. This fix collapses the split selection sets into one. [#4064](https://github.com/apollographql/apollo-server/pull/4064)

## v0.16.1

- __NEW__: Provide the ability to pass a custom `fetcher` during `RemoteGraphQLDataSource` construction to be used when executing operations against downstream services.  Providing a custom `fetcher` may be necessary to accommodate more advanced needs, e.g., configuring custom TLS certificates for internal services.  [PR #4149](https://github.com/apollographql/apollo-server/pull/4149)

  The `fetcher` specified should be a compliant implementor of the [Fetch API standard](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).  This addition compliments, though is still orthognonal to, similar behavior originally introduced in [#3783](https://github.com/apollographql/apollo-server/pull/3783), which allowed customization of the implementation used to fetch _gateway configuration and federated SDL from services_ in managed and unmanaged modes, but didn't affect the communication that takes place during _operation execution_.

  For now, the default `fetcher` will remain the same ([`node-fetch`](https://npm.im/node-fetch)) implementation.  A future major-version bump will update it to be consistent with other feature-rich implementations of the Fetch API which are used elsewhere in the Apollo Server stack where we use [`make-fetch-happen`](https://npm.im/make-fetch-happen).  In all likelihood, `ApolloGateway` will pass its own `fetcher` to the `RemoteGraphQLDataSource` during service initialization.

## v0.16.0

- __BREAKING__: Use a content delivery network for managed configuration, fetch storage secrets and composition configuration from different domains: https://storage-secrets.api.apollographql.com and https://federation.api.apollographql.com. Please mind any firewall for outgoing traffic. [#4080](https://github.com/apollographql/apollo-server/pull/4080)

## v0.15.1

- __FIX__: Correctly handle unions with nested conditions that have no `possibleTypes` [#4071](https://github.com/apollographql/apollo-server/pull/4071)
- __FIX__: Normalize root operation types when reporting to Apollo Graph Manager. Federation always uses the default names `Query`, `Mutation`, and `Subscription` for root operation types even if downstream services choose different names; now we properly normalize traces received from downstream services in the same way. [#4100](https://github.com/apollographql/apollo-server/pull/4100)

## v0.15.0

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/e37384a49b2bf474eed0de3e9f4a1bebaeee64c7)

- __BREAKING__: Drop support for Node.js 8 and Node.js 10.  This is being done primarily for performance gains which stand to be seen by transpiling to a newer ECMAScript target.  For more details, see the related PR.  [#4031](https://github.com/apollographql/apollo-server/pull/4031)
- __Performance:__ Cache stringified representations of downstream query bodies within the query plan to address performance cost incurred by repeatedly `print`ing the same`DocumentNode`s with the `graphql` printer.  This improvement is more pronounced on larger documents.  [PR #4018](https://github.com/apollographql/apollo-server/pull/4018)
- __Deprecation:__ Deprecated the `ENGINE_API_KEY` environment variable in favor of its new name, `APOLLO_KEY`.  The new name mirrors the name used within Apollo Graph Manager.  Aside from the rename, the functionality remains otherwise identical.  Continued use of `ENGINE_API_KEY` will result in deprecation warnings being printed to the server console.  Support for `ENGINE_API_KEY` will be removed in a future, major update.  [#3923](https://github.com/apollographql/apollo-server/pull/3923)
- __Deprecation:__ Deprecated the `APOLLO_SCHEMA_TAG` environment variable in favor of its new name, `APOLLO_GRAPH_VARIANT`.  The new name mirrors the name used within Apollo Graph Manager.  Aside from the rename, the functionality remains otherwise identical.  Use of the now-deprecated name will result in a deprecation warning being printed to the server console.  Support will be removed entirely in a future, major update.  To avoid misconfiguration, runtime errors will be thrown if the new and deprecated versions are _both_ set. [#3855](https://github.com/apollographql/apollo-server/pull/3855)
- Add inadvertently excluded `apollo-server-errors` runtime dependency. [#3927](https://github.com/apollographql/apollo-server/pull/3927)

## v0.14.1

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/b898396e9fcd3b9092b168f9aac8466ca186fa6b)

- __FIX__: Resolve condition which surfaced in `0.14.0` which prevented loading the configuration using managed federation. [PR #3979](https://github.com/apollographql/apollo-server/pull/3979)

## v0.14.0

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/71a3863f59f4ab2c9052c316479d94c6708c4309)

- Several previously unhandled Promise rejection errors stemming from, e.g. connectivity, failures when communicating with Apollo Graph Manager within asynchronous code are now handled. [PR #3811](https://github.com/apollographql/apollo-server/pull/3811)
- Provide a more helpful error message when encountering expected errors. [PR #3811](https://github.com/apollographql/apollo-server/pull/3811)
- General improvements and clarity to error messages and logging. [PR #3811](https://github.com/apollographql/apollo-server/pull/3811)
- Warn of a possible misconfiguration when local service configuration is provided (via `serviceList` or `localServiceList`) and a remote Apollo Graph Manager configuration is subsequently found as well. [PR #3868](https://github.com/apollographql/apollo-server/pull/3868)
- During composition, the unavailability of a downstream service in unmanaged federation mode will no longer result in a partially composed schema which merely lacks the types provided by the downed service.  This prevents unexpected validation errors for clients querying a graph which lacks types which were merely unavailable during the initial composition but were intended to be part of the graph. [PR #3867](https://github.com/apollographql/apollo-server/pull/3867)
- Support providing a custom logger implementation (e.g. [`winston`](https://npm.im/winston), [`bunyan`](https://npm.im/bunyan), etc.) to capture gateway-sourced console output.  This allows the use of existing, production logging facilities or the possibiltiy to use advanced structure in logging, such as console output which is encapsulated in JSON.  The same PR that introduces this support also introduces a `logger` property to the `GraphQLRequestContext` that is exposed to `GraphQLDataSource`s and Apollo Server plugins, making it possible to attach additional properties (as supported by the logger implementation) to specific requests, if desired, by leveraging custom implementations in those components respectively.  When not provided, these will still output to `console`. [PR #3894](https://github.com/apollographql/apollo-server/pull/3894)
- Drop use of `loglevel-debug`.  This removes the very long date and time prefix in front of each log line and also the support for the `DEBUG=apollo-gateway:` environment variable.  Both of these were uncommonly necessary or seldom used (with the environment variable also being undocumented).  The existing behavior can be preserved by providing a `logger` that uses `loglevel-debug`, if desired, and more details can be found in the PR.  [PR #3896](https://github.com/apollographql/apollo-server/pull/3896)
- Fix Typescript generic typing for datasource contexts [#3865](https://github.com/apollographql/apollo-server/pull/3865) This is a fix for the `TContext` typings of the gateway's exposed `GraphQLDataSource` implementations. In their current form, they don't work as intended, or in any manner that's useful for typing the `context` property throughout the class methods. This introduces a type argument `TContext` to the class itself (which defaults to `Record<string, any>` for existing implementations) and removes the non-operational type arguments on the class methods themselves.
- Implement retry logic for requests to GCS [PR #3836](https://github.com/apollographql/apollo-server/pull/3836) Note: coupled with this change is a small alteration in how the gateway polls GCS for updates in managed mode. Previously, the tick was on a specific interval. Now, every tick starts after the round of fetches to GCS completes. For more details, see the linked PR.
- Gateway issues health checks to downstream services via `serviceHealthCheck` configuration option. Note: expected behavior differs between managed and unmanaged federation. See PR for new test cases and documentation. [#3930](https://github.com/apollographql/apollo-server/pull/3930)


## v0.13.2

- __BREAKING__: The behavior and signature of `RemoteGraphQLDataSource`'s `didReceiveResponse` method has been changed.  No changes are necessary _unless_ your implementation has overridden the default behavior of this method by either extending the class and overriding the method or by providing `didReceiveResponse` as a parameter to the `RemoteGraphQLDataSource`'s constructor options.  Implementations which have provided their own `didReceiveResponse` using either of these methods should view the PR linked here for details on what has changed.  [PR #3743](https://github.com/apollographql/apollo-server/pull/3743)
- __NEW__: Setting the `apq` option to `true` on the `RemoteGraphQLDataSource` will enable the use of [automated persisted queries (APQ)](https://www.apollographql.com/docs/apollo-server/performance/apq/) when sending queries to downstream services.  Depending on the complexity of queries sent to downstream services, this technique can greatly reduce the size of the payloads being transmitted over the network.  Downstream implementing services must also support APQ functionality to participate in this feature (Apollo Server does by default unless it has been explicitly disabled).  As with normal APQ behavior, a downstream server must have received and registered a query once before it will be able to serve an APQ request. [#3744](https://github.com/apollographql/apollo-server/pull/3744)
- __NEW__: Experimental feature: compress downstream requests via generated fragments [#3791](https://github.com/apollographql/apollo-server/pull/3791) This feature enables the gateway to generate fragments for queries to downstream services in order to minimize bytes over the wire and parse time. This can be enabled via the gateway config by setting `experimental_autoFragmentization: true`. It is currently disabled by default.
- Introduce `make-fetch-happen` package. Remove `cachedFetcher` in favor of the caching implementation provided by this package. [#3783](https://github.com/apollographql/apollo-server/pull/3783/files)

## v0.12.1

- Update to include [fixes from `@apollo/federation`](https://github.com/apollographql/apollo-server/blob/main/packages/apollo-federation/CHANGELOG.md).

## v0.12.0

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/9c0aa1e661ccc2c5a1471b781102637dd47e21b1)

- Reduce interface expansion for types contained to a single service [#3582](https://github.com/apollographql/apollo-server/pull/3582)
- Instantiate one `CachedFetcher` per gateway instance.  This resolves a condition where multiple federated gateways would utilize the same cache store could result in an `Expected undefined to be a GraphQLSchema` error. [#3704](https://github.com/apollographql/apollo-server/pull/3704)
- Gateway: minimize downstream request size [#3737](https://github.com/apollographql/apollo-server/pull/3737)
- experimental: Allow configuration of the query plan store by introducing an `experimental_approximateQueryPlanStoreMiB` property to the `ApolloGateway` constructor options which overrides the default cache size of 30MiB. [#3755](https://github.com/apollographql/apollo-server/pull/3755)

## v0.11.6

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/0743d6b2f1737758cf09e80d2086917772bc00c9)

- Fix onSchemaChange callbacks for unmanaged configs [#3605](https://github.com/apollographql/apollo-server/pull/3605)

## v0.11.4

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/a0a60e73e04e913d388de8324f7d17e4406deea2)

 * Gateway over-merging fields of unioned types [#3581](https://github.com/apollographql/apollo-server/pull/3581)

## v0.11.0

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/93002737d53dd9a50b473ab9cef14849b3e539aa)

- Begin supporting executable directives in federation [#3464](https://github.com/apollographql/apollo-server/pull/3464)

## v0.10.8

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/5d94e986f04457ec17114791ee6db3ece4213dd8)

- Fix Gateway / Playground Query Plan view [#3418](https://github.com/apollographql/apollo-server/pull/3418)
- Gateway schema change listener bug + refactor [#3411](https://github.com/apollographql/apollo-server/pull/3411) introduces a change to the `experimental_didUpdateComposition` hook and `experimental_pollInterval` configuration behavior.
  1. Previously, the `experimental_didUpdateComposition` hook wouldn't be reliably called unless the `experimental_pollInterval` was set. If it _was_ called, it was sporadic and didn't necessarily mark the timing of an actual composition update. After this change, the hook is called on a successful composition update.
  2. The `experimental_pollInterval` configuration option now affects both the GCS polling interval when gateway is configured for managed federation, as well as the polling interval of services. The former being newly introduced behavior.
- Gateway cached DataSource bug [#3412](https://github.com/apollographql/apollo-server/pull/3412) introduces a fix for managed federation users where `DataSource`s wouldn't update correctly if a service's url changed. This bug was introduced with heavier DataSource caching in [#3388](https://github.com/apollographql/apollo-server/pull/3388). By inspecting the `url` as well, `DataSource`s will now update correctly when a composition update occurs.
- Gateway - don't log updates on startup [#3421](https://github.com/apollographql/apollo-server/pull/3421) Fine tune gateway startup logging - on load, instead of logging an "update", log the service id, variant, and mode in which gateway is running.

## v0.10.7

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/fc7462ec5f8604bd6cba99aa9a377a9b8e045566)

- Add export for experimental observability functions types. [#3371](https://github.com/apollographql/apollo-server/pull/3371)
- Fix double instantiation of DataSources [#3388](https://github.com/apollographql/apollo-server/pull/3388)

## v0.10.6

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/aa200ce24b834320fc79d2605dac340b37d3e434)

- Fix debug query plan logging [#3376](https://github.com/apollographql/apollo-server/pull/3376)
- Add `context` object to `GraphQLDataSource.didReceiveResponse` arguments [#3360](https://github.com/apollographql/apollo-server/pull/3360)

## v0.10.1

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/029c8dca3af812ee70589cdb6de749df3d2843d8)

- Make service definition cache local to ApolloGateway object [#3191](https://github.com/apollographql/apollo-server/pull/3191)
- Fix value type behavior within composition and execution [#3182](https://github.com/apollographql/apollo-server/pull/3182)
- Validate variables at the gateway level [#3213](https://github.com/apollographql/apollo-server/pull/3213)

## v0.9.1

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/a1c41152a35c837af27d1dee081fc273de07a28e)

- Optimize buildQueryPlan when two FetchGroups are on the same service [#3135](https://github.com/apollographql/apollo-server/pull/3135)
- Construct and use RemoteGraphQLDataSource to issue introspection query to Federated Services [#3120](https://github.com/apollographql/apollo-server/pull/3120)

## v0.9.0

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/99f78c6782bce170186ba6ef311182a8c9f281b7)

- Add experimental observability functions [#3110](https://github.com/apollographql/apollo-server/pull/3110)

## v0.8.2

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/b0a9ce0615d19b7241e64883b5d5d7730cc13fcb)

- Handle `null` @requires selections correctly during execution [#3138](https://github.com/apollographql/apollo-server/pull/3138)

## v0.6.13

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/a06594117dbbf1e8abdb7b366b69a94ab808b065)

- Proxy errors from downstream services [#3019](https://github.com/apollographql/apollo-server/pull/3019)
- Handle schema defaultVariables correctly within downstream fetches [#2963](https://github.com/apollographql/apollo-server/pull/2963)

## v0.6.12

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/5974b2ce405a06bc331230400b9073f6381738d3)

- Fix `@requires` bug preventing array and null values. [PR #2928](https://github.com/apollographql/apollo-server/pull/2928)

## v0.6.5

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/9dcfe6f91fa7b4187a644efe1522cf444ffc1251)

- Relax constraints of root operation type names in validation [#2783](ttps://github.com/apollographql/apollo-server/pull/2783)

## v0.6.2

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/e113127b1ff9802de3bc5574bcae55256f0ef656)

- Resolve an issue with \__proto__ pollution in deepMerge() [#2779](https://github.com/apollographql/apollo-server/pull/2779)
