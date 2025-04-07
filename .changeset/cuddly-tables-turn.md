---
'@apollo/server': minor
---

Adds a new graphql-js validation rule to reject operations that recursively request selections above a specified maximum, which is disabled by default. Use configuration option `maxRecursiveSelections=true` to enable with a maximum of 10,000,000, or `maxRecursiveSelections=<number>` for a custom maximum. Enabling this validation can help avoid performance issues with configured validation rules or plugins.
