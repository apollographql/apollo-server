---
'@apollo/server': patch
---

Constrain the `@graphql-tools/schema`, `@graphql-tools/merge`, and `@graphql-tools/utils` dependency ranges so that a fresh install of `@apollo/server` on Node.js v20 (via npm) no longer pulls in `@whatwg-node/promise-helpers@2`, which declares `engines.node >=22.15` and therefore fails installs that enforce engine constraints (such as `npm --engine-strict`). While Node.js v20 is EOL, Apollo Server 5 is still documented as supporting this version.
