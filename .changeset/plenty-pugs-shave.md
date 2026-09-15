---
'@apollo/server': patch
---

Fix a socket leak in `ApolloServerPluginDrainHttpServer`. When a socket's `'close'` event was processed before the response's queued `'finish'` callback, the `'finish'` callback re-inserted the socket into the plugin's tracking `Map` after the (single-use) close listener had already removed it, so the socket and everything it referenced were retained for the lifetime of the process.
