# CHANGELOG for `@apollo/federation`

## 0.14.0

- Only changes in the similarly versioned `@apollo/gateway` package.

## 0.13.2

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
