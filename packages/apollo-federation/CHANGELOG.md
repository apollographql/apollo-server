# CHANGELOG for `@apollo/federation`

## vNEXT

> The changes noted within this `vNEXT` section have not been released yet.  New PRs and commits which introduce changes should include an entry in this `vNEXT` section as part of their development.  When a release is being prepared, a new header will be (manually) created below and the appropriate changes within that release will be moved into the new section.

- _Nothing yet! Stay tuned!_

## v0.16.11

- Reinstate typings for `make-fetch-happen` at the `apollo-gateway` project level (and now, additionally, `apollo-server-plugin-operation-registry`) [PR #4333](https://github.com/apollographql/apollo-server/pull/4333)

## 0.16.10

- The default branch of the repository has been changed to `main`.  As this changed a number of references in the repository's `package.json` and `README.md` files (e.g., for badges, links, etc.), this necessitates a release to publish those changes to npm. [PR #4302](https://github.com/apollographql/apollo-server/pull/4302)
- __BREAKING__: Move federation metadata from custom objects on schema nodes over to the `extensions` field on schema nodes which are intended for metadata. This is a breaking change because it narrows the `graphql` peer dependency from `^14.0.2` to `^14.5.0` which is when [`extensions` were introduced](https://github.com/graphql/graphql-js/pull/2097) for all Type System objects. [PR #4302](https://github.com/apollographql/apollo-server/pull/4313)

## 0.16.9

- Handle `@external` validation edge case for interface implementors [#4284](https://github.com/apollographql/apollo-server/pull/4284)

## 0.16.7

- Only changes in the similarly versioned `@apollo/gateway` package.

## v0.16.6

- In-house `Maybe` type which was previously imported from `graphql` and has been moved in `v15.1.0`. [#4230](https://github.com/apollographql/apollo-server/pull/4230)
- Remove remaining common primitives from SDL during composition. This is a follow up to [#4209](https://github.com/apollographql/apollo-server/pull/4209), and additionally removes directives which are included in a schema by default (`@skip`, `@include`, `@deprecated`, and `@specifiedBy`) [#4228](https://github.com/apollographql/apollo-server/pull/4209)

## v0.16.5

- Remove federation primitives from SDL during composition. This allows for services to report their *full* SDL from the `{ _service { sdl } }` query as opposed to the previously limited SDL without federation definitions. [#4209](https://github.com/apollographql/apollo-server/pull/4209)

## v0.16.4

- Only changes in the similarly versioned `@apollo/gateway` package.

## v0.16.3

- Only changes in the similarly versioned `@apollo/gateway` package.

## v0.16.2

- Only changes in the similarly versioned `@apollo/gateway` package.

## v0.16.1

- Only changes in the similarly versioned `@apollo/gateway` package.

## v0.16.0

- No changes. This package was major versioned to maintain lockstep versioning with @apollo/gateway.

## v0.15.1

- Export `defaultRootOperationNameLookup` and `normalizeTypeDefs`; needed by `@apollo/gateway` to normalize root operation types when reporting to Apollo Graph Manager. [#4071](https://github.com/apollographql/apollo-server/pull/4071)

## v0.15.0

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/e37384a49b2bf474eed0de3e9f4a1bebaeee64c7)

- Only changes in the similarly versioned `@apollo/gateway` package.

## v0.14.1

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/b898396e9fcd3b9092b168f9aac8466ca186fa6b)

- Only changes in the similarly versioned `@apollo/gateway` package.

## v0.14.0

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/71a3863f59f4ab2c9052c316479d94c6708c4309)

- Only changes in the similarly versioned `@apollo/gateway` package.

## v0.13.2

- Only changes in the similarly versioned `@apollo/gateway` package.

## v0.12.1

- Fix `v0.12.0` regression: Preserve the `@deprecated` type-system directive as a special case when removing type system directives during composition, resolving an unintentional breaking change introduced by [#3736](https://github.com/apollographql/apollo-server/pull/3736). [#3792](https://github.com/apollographql/apollo-server/pull/3792)

## v0.12.0

- Strip all Type System Directives during composition [#3736](https://github.com/apollographql/apollo-server/pull/3736)
- Prepare for changes in upcoming `graphql@15` release. [#3712](https://github.com/apollographql/apollo-server/pull/3712)

## v0.11.1

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/2a4c654986a158aaccf947ee56a4bfc48a3173c7)

- Ignore TypeSystemDirectiveLocations during composition [#3536](https://github.com/apollographql/apollo-server/pull/3536)

## v0.11.0

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/93002737d53dd9a50b473ab9cef14849b3e539aa)

- Begin supporting executable directives in federation [#3464](https://github.com/apollographql/apollo-server/pull/3464)

## v0.10.3

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/3cdde1b7a71ace6411fbacf82a1a61bf737444a6)

- Remove `apollo-env` dependency to eliminate circular dependency between the two packages. This circular dependency makes the tooling repo unpublishable when `apollo-env` requires a version bump. [#3463](https://github.com/apollographql/apollo-server/pull/3463)

## v0.10.1

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/aa200ce24b834320fc79d2605dac340b37d3e434)

- Use reference-equality when omitting validation rules during composition. [#3338](https://github.com/apollographql/apollo-server/pull/3338)

## v0.10.0

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/6100fb5e0797cd1f578ded7cb77b60fac47e58e3)

- Remove federation directives from composed schema [#3272](https://github.com/apollographql/apollo-server/pull/3272)
- Do not remove Query/Mutation/Subscription types when schema is included if schema references those types [#3260](https://github.com/apollographql/apollo-server/pull/3260)

## v0.9.1

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/029c8dca3af812ee70589cdb6de749df3d2843d8)

- Fix value type behavior within composition and execution [#3182](https://github.com/apollographql/apollo-server/pull/2922)

## v0.6.8

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/5974b2ce405a06bc331230400b9073f6381738d3)

- Support __typenames if defined by an incoming operation [#2922](https://github.com/apollographql/apollo-server/pull/2922)

## v0.6.7

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/2ea5887acc43461a5539071f4981a5f70e0d0652)

- Fix bug in externalUnused validation [#2919](https://github.com/apollographql/apollo-server/pull/2919)

## v0.6.6

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/183de5f112324def375a45c239955e1bf1608fae)

- Allow specified directives during validation (@deprecated) [#2823](https://github.com/apollographql/apollo-server/pull/2823)

## v0.6.1

> [See complete versioning details.](https://github.com/apollographql/apollo-server/commit/1209839c01b4cac1eb23f42c747296dd9507a8ac)

- Normalize SDL in a normalization step before validation [#2771](https://github.com/apollographql/apollo-server/pull/2771)
