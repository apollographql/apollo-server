---
'@apollo/server': patch
---

Require Node.js v14 rather than v12. This change was intended for v4.0.0 and the documentation already stated this requirement, but was left off of the package.json `engines` field in `@apollo/server` inadvertently.
