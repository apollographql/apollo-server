---
"@apollo/server-integration-testsuite": patch
"@apollo/server-plugin-response-cache": patch
"@apollo/server": patch
---

Several changes relating to plugins:

- Remove the `server` field on `GraphQLRequestContext` and `GraphQLServerContext` (ie, the arguments to most plugin hook methods). This was added during AS4 development and did not exist in AS3.

- Add `logger` and `cache` fields to `GraphQLRequestContext` and `GraphQLServerContext`. The `logger` fields and `GraphQLRequestContext.cache` existed in AS3 and had been previously removed for redundancy with the `server` field. (Unlike in AS3, `logger` is readonly.)

- `ApolloServerPlugin` is now declared as `<in TContext extends BaseContext = BaseContext>` rather than `<in out TContext>`. This means that you can declare a plugin that doesn't care about `contextValue` to simply implement `ApolloServerPlugin` and it will work with any `ApolloServer<NoMatterWhatContext>`. This should make it easy to write plugins that don't care about context.

- Remove the ability to specify a factory function as an element of the `plugins` list in the `ApolloServer` constructor. (Reducing the number of ways to specify constructor options helps keep type errors simpler.) As far as we know the main use case for this (referring to the `ApolloServer` itself when creating the plugin) can be handled with the new-in-AS4 `ApolloServer.addPlugin` method.
