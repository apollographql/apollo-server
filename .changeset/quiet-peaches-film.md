---
'@apollo/cache-control-types': patch
'@apollo/server-gateway-interface': patch
'@apollo/server-plugin-response-cache': patch
'@apollo/server': patch
'@apollo/usage-reporting-protobuf': patch
---

Publish TypeScript typings for CommonJS modules output.

This allows TypeScript projects that use CommonJS modules with
`moduleResolution: "node16"` or
`moduleResolution: "nodeNext"`
to correctly resolves the typings of apollo's packages as CommonJS instead of ESM.

