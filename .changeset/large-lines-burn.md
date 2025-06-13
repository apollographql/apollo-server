---
'@apollo/server': patch
---

ApolloServerPluginSubscriptionCallback now takes a `fetcher` argument, like the usage and schema reporting plugins. The default value is Node's built-in fetch.
