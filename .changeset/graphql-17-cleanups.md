---
'@apollo/server': patch
'@apollo/server-integration-testsuite': patch
---

Compile with TypeScript's `es2024` target and lib (every supported Node.js version implements ES2024), and remove version checks and alternate expectations that only mattered when the test suites ran against GraphQL.js v16 or Node.js older than v22.
