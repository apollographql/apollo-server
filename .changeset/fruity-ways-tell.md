---
'@apollo/server': minor
---

Apollo Server now supports the modern incremental delivery protocol (`@defer` and `@stream`) that ships with `graphql@17.0.0-alpha.9`. To use the modern protocol, clients must send the `Accept` header with a value of `multipart/mixed; incrementalDeliverySpec=3283f8a`.

To upgrade to 5.1 will depend on what version of `graphql` you have installed and whether you already support the incremental delivery protocol.

## I use `graphql@16` without incremental delivery

Continue using `graphql` v16 with no additional changes. Incremental delivery won't be available.

## I use `graphql@16` but would like to add support for incremental delivery

Install `graphql@17.0.0-alpha.9` and follow the ["Incremental delivery" guide](https://www.apollographql.com/docs/apollo-server/workflow/requests#incremental-delivery-experimental) to add the `@defer` and `@stream` directives to your schema. Clients should send the `Accept` header with a value of `multipart/mixed; incrementalDeliverySpec=3283f8a` to get multipart responses.

## I use `graphql@17.0.0-alpha.2` and use incremental delivery

You must upgrade to `graphql@17.0.0-alpha.9` to continue using incremental delivery. If you'd like to continue providing support for the legacy incremental protocol, install the [`@yaacovcr/transform`](https://github.com/yaacovCR/transform) package. Apollo Server will attempt to load this module when the client specifies an `Accept` header with a value of `multipart/mixed; deferSpec=20220824`. If this package is not installed, an error is returned by the server.

Because Apollo Server now supports multiple versions of the incremental delivery types, the existing incremental delivery types have been renamed with an `Alpha2` suffix. If you import these types in your code, you will need to add the `Alpha2` suffix.

```diff
import type {
- GraphQLExperimentalFormattedInitialIncrementalExecutionResult,
+ GraphQLExperimentalFormattedInitialIncrementalExecutionResultAlpha2,

- GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult,
+ GraphQLExperimentalFormattedSubsequentIncrementalExecutionResultAlpha2,

- GraphQLExperimentalFormattedIncrementalResult,
+ GraphQLExperimentalFormattedIncrementalResultAlpha2,

- GraphQLExperimentalFormattedIncrementalDeferResult,
+ GraphQLExperimentalFormattedIncrementalDeferResultAlpha2,

- GraphQLExperimentalFormattedIncrementalStreamResult,
+ GraphQLExperimentalFormattedIncrementalStreamResultAlpha2,
} from '@apollo/server';
```

Incremental delivery types for the more modern `graphql@17.0.0-alpha.9` version are now available using the `Alpha9` suffix:

```ts
import type {
  GraphQLExperimentalFormattedInitialIncrementalExecutionResultAlpha9,
  GraphQLExperimentalFormattedSubsequentIncrementalExecutionResultAlpha9,
  GraphQLExperimentalFormattedIncrementalResultAlpha9,
  GraphQLExperimentalFormattedIncrementalDeferResultAlpha9,
  GraphQLExperimentalFormattedIncrementalStreamResultAlpha9,
  GraphQLExperimentalFormattedCompletedResultAlpha9,
  GraphQLExperimentalPendingResultAlpha9,
} from '@apollo/server';
```
