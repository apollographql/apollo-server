---
'@apollo/server': major
---

`hideSchemaDetailsFromClientErrors` now uses GraphQL.js v17's `hideSuggestions` option instead of rewriting error messages after the fact. As a result it also hides "Did you mean ...?" suggestions in variable coercion errors (for example, a misspelled input object field or enum value provided via variables), which it previously missed. The internal `@apollo/server/plugin/disableSuggestions` entry point is removed.
