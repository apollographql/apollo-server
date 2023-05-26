---
'@apollo/server': minor
---

Introduce new `ApolloServerPluginSubscriptionCallback` plugin. This plugin implements the [subscription callback protocol](https://github.com/apollographql/router/blob/dev/dev-docs/callback_protocol.md) which is used by Apollo Router. This feature implements subscriptions over HTTP via a callback URL which Apollo Router registers with Apollo Server. This feature is currently in preview and is subject to change.

For more information, visit the docs:
https://www.apollographql.com/docs/router/executing-operations/subscription-callback-protocol/
