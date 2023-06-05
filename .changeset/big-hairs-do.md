---
'@apollo/server': patch
---

Update `@apollo/utils.usagereporting` dependency. Previously, installing `@apollo/gateway` and `@apollo/server` could result in duplicate / differently versioned installs of `@apollo/usage-reporting-protobuf`. This is because the `@apollo/server-gateway-interface` package was updated to use the latest protobuf, but the `@apollo/utils.usagereporting` package was not. After this change, users should always end up with a single install of the protobuf package when installing both `@apollo/server` and `@apollo/gateway` latest versions.
