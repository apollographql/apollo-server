---
title: Built-in plugins
sidebar_title: Overview
---

**Plugins** extend Apollo Server's functionality by performing custom operations in response to certain events. These events correspond to individual phases of the GraphQL request lifecycle, and to the lifecycle of Apollo Server itself.

Certain Apollo Server features are provided as built-in plugins that are exported from `apollo-server-core` (or another library that's distributed with `apollo-server`). Apollo Server installs certain plugins automatically, but you can also install them _manually_ to override their default settings. See each plugin's documentation for details.

You can also [create custom plugins](./integrations/plugins/).

## List of built-in plugins

| Name | Library | Description |
|------|---------|-------------|
| [Usage reporting](./api/plugin/usage-reporting/) | `apollo-server-core` | Gathers helpful operation usage data and reports it to [Apollo Studio](https://www.apollographql.com/docs/studio/) for visualization, alerting, and more. |
| [Schema reporting](./api/plugin/schema-reporting/) | `apollo-server-core` | Automatically reports the server's schema to [Apollo Studio](https://www.apollographql.com/docs/studio/) on startup to enable schema history and up-to-date metrics. |
| [Inline trace](./api/plugin/inline-trace/) | `apollo-server-core` | Used primarily by [federated subgraphs](https://www.apollographql.com/docs/federation/) to include operation trace data in responses to the gateway. |
| [Cache control](./api/plugin/cache-control/) | `apollo-server-core` | Calculates caching behavior for operation responses. |
| Landing page (multiple) | `apollo-server-core` | Handle displaying a default or custom landing page at Apollo Server's base URL. |
| [Response cache](./performance/caching/#caching-with-responsecacheplugin-advanced) | `apollo-server-plugin-response-cache`| Caches operation responses in a back-end store (in-memory, Redis, etc.) |

## Installing plugins

You can install a plugin that isn't installed by default (or customize a default plugin) by providing a `plugins` configuration option to the ApolloServer constructor, like so:

```js
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginUsageReporting } from "apollo-server-core";

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
