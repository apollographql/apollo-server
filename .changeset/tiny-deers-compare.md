---
'@apollo/server-integration-testsuite': patch
'@apollo/server': patch
---

Apollo Server tries to detect if execution errors are variable coercion errors in order to give them a `code` extension of `BAD_USER_INPUT` rather than `INTERNAL_SERVER_ERROR`. Previously this would unconditionally set the `code`; now, it only sets the `code` if no `code` is already set, so that (for example) custom scalar `parseValue` methods can throw errors with specific `code`s. (Note that a separate graphql-js bug can lead to these extensions being lost; see https://github.com/graphql/graphql-js/pull/3785 for details.)
