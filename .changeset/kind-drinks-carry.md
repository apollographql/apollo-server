---
'@apollo/server-integration-testsuite': patch
'@apollo/server': patch
---

Improve compatibility with Cloudflare workers by avoiding the use of the Node `url` package. This change is intended to be a no-op.
