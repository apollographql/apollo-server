---
'@apollo/server': patch
---

Use GraphQL.js v17's `validateExecutionArgs` to separate operation selection and variable coercion from execution. Apollo Server no longer inspects error messages to decide which execution errors are variable coercion errors; every error that GraphQL.js reports before execution starts is now a `BAD_USER_INPUT` error (unless it already carries a code). One visible change: the "Too many errors processing variables" error produced when `executionOptions.maxCoercionErrors` is exceeded now has code `BAD_USER_INPUT` instead of `INTERNAL_SERVER_ERROR`.
