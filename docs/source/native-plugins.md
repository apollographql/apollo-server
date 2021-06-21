---
title: Apollo Server plugins
sidebar_title: Overview
---

**Plugins** extend Apollo Server's core functionality by performing custom operations in response to certain events. These events correspond to individual phases of the GraphQL request lifecycle, and to the lifecycle of Apollo Server itself.

Certain Apollo Server features are distributed as plugins in the `apollo-server` library, some of which are installed automatically in certain cases. You can also [create custom plugins](./plugins/).

## List of native plugins

| Name | Description |
|------|-------------|
| [Usage reporting](/api/plugin/usage-reporting/) | Gathers helpful operation usage data and reports it to [Apollo Studio](https://www.apollographql.com/docs/studio/) for visualization, alerting, and more. |
| [Schema reporting](/api/plugin/schema-reporting) | Automatically reports the server's schema to [Apollo Studio](https://www.apollographql.com/docs/studio/) on startup to enable schema history and up-to-date metrics. |
| [Inline trace](/api/plugin/inline-trace) | Used primarily by [federated subgraphs](https://www.apollographql.com/docs/federation/) to include operation trace data in responses to the gateway. | 

## Installing plugins

You can install a plugin that isn't installed by default (or customize a default plugin), by providing a `plugins` configuration option to the ApolloServer constructor, like so:

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
