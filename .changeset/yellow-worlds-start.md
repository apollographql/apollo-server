---
'@apollo/server': minor
---

Add `graphql@17.0-0-alpha.9` incremental delivery types and rename the existing incremental delievery types by adding an `Alpha2` suffix. If you import these types in your code, you will need to add the `Alpha2` suffix.

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

Incremental delivery types for the `graphql@17.0.0-alpha.9` version are now available using the `Alpha9` suffix:

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
