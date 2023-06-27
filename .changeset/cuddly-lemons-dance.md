---
'@apollo/server': minor
---

Introduce new `ApolloServerPluginSubscriptionCallback` plugin. This plugin implements the [subscription callback protocol](https://github.com/apollographql/router/blob/dev/dev-docs/callback_protocol.md) which is used by Apollo Router. This feature implements subscriptions over HTTP via a callback URL which Apollo Router registers with Apollo Server. This feature is currently in preview and is subject to change.

You can enable callback subscriptions like so:
```ts
import { ApolloServerPluginSubscriptionCallback } from '@apollo/server/plugin/subscriptionCallback';
import { ApolloServer } from '@apollo/server';

const server = new ApolloServer({
  // ...
  plugins: [
    ApolloServerPluginSubscriptionCallback(),
  ],
});
```

Note that there is currently no tracing or metrics mechanism in place for callback subscriptions. Additionally, this plugin "intercepts" callback subscription requests and bypasses some of Apollo Server's internals. The result of this is that certain plugin hooks (notably `executionDidStart` and `willResolveField`) will not be called when handling callback subscription requests or when sending subscription events.

For more information on the subscription callback protocol, visit the docs:
https://www.apollographql.com/docs/router/executing-operations/subscription-callback-protocol/
