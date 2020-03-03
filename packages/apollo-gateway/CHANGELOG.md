# CHANGELOG for `@apollo/gateway`

## 0.13.2 (pre-release; `@next` tag)

- __BREAKING__: The behavior and signature of `RemoteGraphQLDataSource`'s `didReceiveResponse` method has been changed.  No changes are necessary _unless_ your implementation has overridden the default behavior of this method by either extending the class and overriding the method or by providing `didReceiveResponse` as a parameter to the `RemoteGraphQLDataSource`'s constructor options.  Implementations which have provided their own `didReceiveResponse` using either of these methods should view the PR linked here for details on what has changed.  [PR #3743](https://github.com/apollographql/apollo-server/pull/3743)
- __NEW__: Setting the `apq` option to `true` on the `RemoteGraphQLDataSource` will enable the use of [automated persisted queries (APQ)](https://www.apollographql.com/docs/apollo-server/performance/apq/) when sending queries to downstream services.  Depending on the complexity of queries sent to downstream services, this technique can greatly reduce the size of the payloads being transmitted over the network.  Downstream implementing services must also support APQ functionality to participate in this feature (Apollo Server does by default unless it has been explicitly disabled).  As with normal APQ behavior, a downstream server must have received and registered a query once before it will be able to serve an APQ request. [#3744](https://github.com/apollographql/apollo-server/pull/3744)
- __NEW__: Experimental feature: compress downstream requests via generated fragments [#3791](https://github.com/apollographql/apollo-server/pull/3791) This feature enables the gateway to generate fragments for queries to downstream services in order to minimize bytes over the wire and parse time. This can be enabled via the gateway config by setting `experimental_autoFragmentization: true`. It is currently disabled by default.
- Introduce `make-fetch-happen` package. Remove `cachedFetcher` in favor of the caching implementation provided by this package. [#3783](https://github.com/apollographql/apollo-server/pull/3783/files)

## v0.12.1

- Update to include [fixes from `@apollo/federation`](https://github.com/apollographql/apollo-server/blob/master/packages/apollo-federation/CHANGELOG.md).

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
