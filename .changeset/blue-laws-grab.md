---
'@apollo/server-integration-testsuite': minor
'@apollo/server': minor
---

Restore missing v1 `skipValidation` option as `dangerouslyDisableValidation`. Note that enabling this option exposes your server to potential security and unexpected runtime issues. Apollo will not support issues that arise as a result of using this option.
