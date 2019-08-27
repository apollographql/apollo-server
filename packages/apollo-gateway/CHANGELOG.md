# Changelog

### vNEXT

> The changes noted within this `vNEXT` section have not been released yet.  New PRs and commits which introduce changes should include an entry in this `vNEXT` section as part of their development.  When a release is being prepared, a new header will be (manually) created below and the the appropriate changes within that release will be moved into the new section.

* Make service definition cache local to ApolloGateway object [#3191](https://github.com/apollographql/apollo-server/pull/3191)
* Fix value type behavior within composition and execution [#3182](https://github.com/apollographql/apollo-server/pull/3182)

# v0.9.1

* Optimize buildQueryPlan when two FetchGroups are on the same service [#3135](https://github.com/apollographql/apollo-server/pull/3135)
* Construct and use RemoteGraphQLDataSource to issue introspection query to Federated Services [#3120](https://github.com/apollographql/apollo-server/pull/3120)

# v0.9.0

* Add experimental observability functions [#3110](https://github.com/apollographql/apollo-server/pull/3110)

# v0.8.2

* Handle `null` @requires selections correctly during execution [#3138](https://github.com/apollographql/apollo-server/pull/3138)


# v0.6.13

* Proxy errors from downstream services [#3019](https://github.com/apollographql/apollo-server/pull/3019)
* Handle schema defaultVariables correctly within downstream fetches [#2963](https://github.com/apollographql/apollo-server/pull/2963)

# v0.6.12

* Fix `@requires` bug preventing array and null values. [PR #2928](https://github.com/apollographql/apollo-server/pull/2928)

# v0.6.5

* Relax constraints of root operation type names in validation [#2783](ttps://github.com/apollographql/apollo-server/pull/2783)

# v0.6.2

* Resolve an issue with \__proto__ pollution in deepMerge() [#2779](https://github.com/apollographql/apollo-server/pull/2779)
