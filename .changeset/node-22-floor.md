---
'@apollo/server': major
'@apollo/server-integration-testsuite': major
'@apollo/server-plugin-response-cache': major
---

Drop support for Node.js v20, which reached end-of-life on April 30, 2026. Apollo Server 6 requires Node.js v22.18.0 or later (`engines.node: ">=22.18"`).

Apollo Server 6 also adopts a new policy for Node.js support: once a Node.js major version reaches end-of-life, Apollo Server may drop support for it with a minor release rather than a major release. Such a change will be called out in the changelog. This policy only applies to Node.js versions, not other dependencies.
