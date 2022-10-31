---
'@apollo/server': minor
---

The usage reporting plugin now defaults to a 30 second timeout for each attempt to send reports to Apollo Server instead of no timeout; the timeout can be adjusted with the new `requestTimeoutMs` option to `ApolloServerPluginUsageReporting`. (Apollo's servers already enforced a 30 second timeout, so this is unlikely to break any existing use cases.)
