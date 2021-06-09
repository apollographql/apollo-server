---
title: "API Reference: Schema reporting plugin"
sidebar_title: Schema reporting plugin
api_reference: true
---

## Using the plugin

This API reference documents the `ApolloServerPluginSchemaReporting` plugin.

This plugin enables your GraphQL server to register its latest schema with the Apollo schema registry every time it starts up. Full details on schema reporting can be found in [the Apollo Studio docs](https://www.apollographql.com/docs/studio/schema/schema-reporting/).

> **Schema reporting does not currently support graphs that use Apollo Federation.** This plugin will not work if your graph is a federated subgraph or a composed federated graph running in a gateway. If you have a federated graph, you will need to register schema via the CLI; see [Setting up managed federation](https://www.apollographql.com/docs/studio/managed-federation/setup/).

In order to use this plugin, you must configure your server with a graph API key, either with the `APOLLO_KEY` environment variable or by passing it directly to your `ApolloServer` with `new ApolloServer({apollo: {key: KEY}})`. (This is the same way you configure your `ApolloServer` to enable usage reporting.)

If you just want to turn on schema reporting with its default configuration, you can set the `APOLLO_SCHEMA_REPORTING` environment variable to `true`. If you want to configure schema reporting (or prefer your setup to be via code rather than environment variables), import `ApolloServerPluginSchemaReporting` from the `apollo-server-core` package and pass it to your `ApolloServer` in the `plugins` array:

```js
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginSchemaReporting } from "apollo-server-core";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginSchemaReporting(),
  ],
});
```

## Options

<table class="field-table">
  <thead>
    <tr>
      <th>Name /<br/>Type</th>
      <th>Description</th>
    </tr>
  </thead>

<tbody>

<tr>
<td>


###### `initialDelayMaxMs`

`number`
</td>
<td>

The schema reporter waits before starting reporting. By default, the report waits some random amount of time between 0 and 10 seconds. A longer interval leads to more staggered starts which means it is less likely multiple servers will get asked to upload the same schema.

If this server runs in lambda or in other constrained environments it would be useful to decrease the schema reporting max wait time to be less than default.

This number will be the max for the range in ms that the schema reporter will wait before starting to report.
</td>
</tr>

<tr>
<td>

###### `overrideReportedSchema`

`string`
</td>
<td>

Override the reported schema that is reported to the Apollo registry. This schema does not go through any normalizations and the string is directly sent to the Apollo registry. This can be useful for comments or other ordering and whitespace changes that get stripped when generating a `GraphQLSchema`.

**If you pass this option to this plugin, you should explicitly configure [`ApolloServerPluginUsageReporting`](./usage-reporting/#overridereportedschema) and pass the same value to its `overrideReportedSchema` option.** This ensures that the schema ID associated with requests reported by the usage reporting plugin matches the schema ID that this plugin reports. For example:

```js
new ApolloServer({
  plugins: [
    ApolloServerPluginSchemaReporting({
      overrideReportedSchema: schema
    }),
    ApolloServerPluginUsageReporting({
      overrideReportedSchema: schema
    }),
  ],
})
```
</td>
</tr>

<tr>
<td>

###### `endpointUrl`

`string`
</td>
<td>

The URL to use for reporting schemas. Primarily for testing and internal Apollo use.
</td>
</tr>

<tr>
<td>

###### `fetcher`

`typeof fetch`
</td>
<td>

Specifies which [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) function implementation to use when reporting schemas.
</td>
</tr>

</tbody>
</table>
