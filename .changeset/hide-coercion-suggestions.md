---
'@apollo/server': patch
---

Strip "did you mean" suggestions from variable coercion errors when `hideSchemaDetailsFromClientErrors` is enabled. Previously this option only applied to validation errors.
