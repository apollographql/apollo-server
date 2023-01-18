---
'@apollo/server': patch
---

The subgraph spec has evolved in Federation v2 such that the type of
`_Service.sdl` (formerly nullable) is now non-nullable. Apollo Server now
detects both cases correctly in order to determine whether to:
1. install / enable the `ApolloServerPluginInlineTrace` plugin
2. throw on startup if `ApolloServerPluginSchemaReporting` should not be installed
3. warn when `ApolloServerPluginUsageReporting` is installed and configured with the `__onlyIfSchemaIsNotSubgraph` option
