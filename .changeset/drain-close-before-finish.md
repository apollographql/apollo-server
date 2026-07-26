---
"@apollo/server": patch
---

Fix `ApolloServerPluginDrainHttpServer` retaining closed sockets when a socket's `close` event runs before the response `finish` callback. The finish handler now skips updating the map if the close listener already removed the entry.
