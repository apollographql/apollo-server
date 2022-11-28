---
'@apollo/server-integration-testsuite': patch
'@apollo/server': patch
---

Fix v4.2.0 (#7171) regression where `"operationName": null`, `"variables": null`, and `"extensions": null` in POST bodies were improperly rejected.
