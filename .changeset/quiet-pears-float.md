---
'@apollo/server': patch
---

The subgraph spec has evolved in Federation v2 such that the type of
`_Service.sdl` (formerly nullable) is now non-nullable. Apollo Server now
detects both cases correctly in order to determine whether to install / enable
the `ApolloServerPluginInlineTrace` plugin.
