---
title: Built-in plugins
---

**Plugins** extend Apollo Server's functionality by performing custom operations in response to certain events. These events correspond to individual phases of the GraphQL request lifecycle, and to the lifecycle of Apollo Server itself.

Certain Apollo Server features are provided as built-in plugins that are exported from within the `@apollo/server` package. Apollo Server installs certain plugins automatically, but you can also install them _manually_ to override their default settings. See each plugin's documentation for details.

You can also [create custom plugins](./integrations/plugins/).

## List of built-in plugins

| Name | Description | Location |
|------|---------|-------------|
| [Usage reporting](./api/plugin/usage-reporting/) | Gathers helpful operation usage data and reports it to [GraphOS](/graphos/) for visualization, alerting, and more. |`@apollo/server/plugin/usageReporting` |
| [Schema reporting](./api/plugin/schema-reporting/) | Automatically reports the server's schema to [Apollo Studio](/studio/) on startup to enable schema history and up-to-date metrics. | `@apollo/server/plugin/schemaReporting` |
| [Inline trace](./api/plugin/inline-trace/) | Used primarily by [federated subgraphs](https://www.apollographql.com/docs/federation/) to include operation trace data in responses to the gateway. | `@apollo/server/plugin/inlineTrace` |
| [Cache control](./api/plugin/cache-control/) | Calculates caching behavior for operation responses. | `@apollo/server/plugin/cacheControl` |
| [Landing page (multiple)](./api/plugin/landing-pages) | Handle displaying a default or custom landing page at Apollo Server's base URL. | `@apollo/server/plugin/landingPage/default` |
| [Draining an HTTP server](./api/plugin/drain-http-server) | Used to ensure your Node.js servers gracefully shut down. | `@apollo/server/plugin/drainHttpServer`|

## Installing plugins

You can install a plugin that isn't installed by default (or customize a default plugin) by providing a `plugins` configuration option to the ApolloServer constructor, like so:

<MultiCodeBlock>

```ts
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginUsageReporting } from '@apollo/server/plugin/usageReporting';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    // Sets a non-default option on the usage reporting plugin
    ApolloServerPluginUsageReporting({
      sendVariableValues: { all: true },
    }),
  ],
});
```

</MultiCodeBlock>
