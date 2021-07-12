---
title: "API Reference: Inline trace plugin"
sidebar_title: Inline trace
api_reference: true
---

## Using the plugin

This API reference documents the `ApolloServerPluginInlineTrace` plugin.

This plugin enables your GraphQL server to include encoded performance and usage traces inside responses. This is primarily designed for use with [Apollo Federation](https://www.apollographql.com/docs/federation/metrics/). Federated subgraphs use this plugin and include a trace in the `ftv1` GraphQL response extension if requested to do so by the Apollo gateway. The gateway requests this trace by passing the HTTP header `apollo-federation-include-trace: ftv1`.

Apollo Server installs this plugin by default in all federated subgraphs, with its default configuration. (Apollo Server decides that it is a federated subgraph if the schema it is serving includes a field `_Service.sdl: String`.)  You typically do not have to install this plugin yourself; you only need to do so if you want to provide non-default configuration.

If you want to configure this plugin (or if you want to use it in a graph that is not a federated subgraph), import it from the `apollo-server-core` package and pass it to your `ApolloServer` in the `plugins` array:

```js
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginInlineTrace } from "apollo-server-core";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginInlineTrace({
      rewriteError: (err) => err.message.match(SENSTIVE_REGEX) ? null : err,
    }),
  ],
});
```

If you don't want to use the inline trace plugin even though your schema defines `_Service.sdl: String`, you can explicitly disable it with the `ApolloServerPluginInlineTraceDisabled` plugin:

```js
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginInlineTraceDisabled } from "apollo-server-core";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginInlineTraceDisabled()],
});
```

Note that when this plugin is installed in your app, any client can request a trace for any operation they run, which may reveal information about your server that you consider sensitive (such as how long each individual field takes to execute). Federated subgraphs generally should not be directly exposed to the public Internet.

(Note: in addition to this plugin (which adds a base64-encoded trace to the `ftv1` extension of responses), the Apollo platform used to have support for an older JSON-based format which added a `tracing` extension to responses. This support was enabled in Apollo Server 2 by passing `tracing: true` to the `ApolloServer` constructor; that option has been removed from Apollo Server 3. That format was designed for use with a no longer supported tool called `engineproxy`, and also is recognized by graphql-playground.  That format was more verbose due to its use of JSON and the way that it represented trace node IDs.)

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

###### `rewriteError`

`Function`
</td>
<td>

By default, all errors from this service get included in the trace. You can specify a filter function to exclude specific errors from being reported by returning an explicit `null`, or you can mask certain details of the error by modifying it and returning the modified error. This function has type `(GraphQLError) => GraphQLError | null`.
</td>
</tr>

</tbody>
</table>
