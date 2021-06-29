---
title: "API Reference: Landing page plugins"
sidebar_title: Landing pages
api_reference: true
---

## The landing page plugins

This API reference documents the `ApolloServerPluginLandingPageLocalDefault`, `ApolloServerPluginLandingPageProductionDefault`, and `ApolloServerPluginLandingPageGraphQLPlayground` plugins.

These plugins add a landing page to your GraphQL server, making it easy for visitors to interact with your graph from a web browser. They work by implementing the [`renderLandingPage`](../../integrations/plugins-event-reference/#renderlandingpage) plugin event, which serves an HTML page whenever a browser includes an `accept: text/html` header.

Apollo Server installs the `ApolloServerPluginLandingPageLocalDefault` default in all servers unless the `NODE_ENV` environment variable is set to `production`, in which case it installs the `ApolloServerPluginLandingPageProductionDefault` plugin. You typically do not have to install these plugins yourself; you only need to do so if you want to provide non-default configuration.

If you want to configure the default plugins while still using based on the same `NODE_ENV` logic, import them from the `apollo-server-core` package and pass them to your `ApolloServer` in the `plugins` array:

```js
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageLocalDefault,
         ApolloServerPluginLandingPageProductionDefault
} from "apollo-server-core";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageProductionDefault({
          graphRef: "my-graph-id@my-graph-variant",
          footer: false,
        })
      : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
  ],
});
```

If you don't want to use Apollo Server's default landing page, you can:
- Install the `ApolloServerPluginLandingPageGraphQLPlayground` plugin, which uses the [GraphQL Playground IDE](https://github.com/graphql/graphql-playground) as a landing page,
- Install a [custom plugin](../../integrations/plugins/) implementing [`renderLandingPage`](../../integrations/plugins-event-reference/#renderlandingpage), or
- Install the `ApolloServerPluginLandingPageDisabled` plugin to serve no landing page.

FIXME should link to the main landing pages page, depending which lands first
## `ApolloServerPluginLandingPageLocalDefault`

The `ApolloServerPluginLandingPageLocalDefault` shows a splash page welcoming you to your server. It's designed for use in local development, where `NODE_ENV` is not set to `production`. The landing page provides a copyable command-line snippet showing how to run operations with your server, and provides a link to query your graph in Apollo Sandbox (a hosted GraphQL IDE that runs entirely inside your browser and doesn't require an account).

### Options

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

###### `version`

`string`
</td>
<td>

By default, the landing page plugin uses the latest version of the landing page published to Apollo's CDN. If you'd like to pin the current version, you can specify it here; you can follow [this link](https://apollo-server-landing-page.cdn.apollographql.com/_latest/version.txt) to learn what the current version is.

</td>
</tr>

<tr>
<td>

###### `footer`

`boolean`
</td>
<td>

By default, the landing page has a footer linking to Apollo Server docs telling you how to configure the landing page. If you no longer want that footer displayed, you can pass `footer: false` to remove it from the landing page.

</td>
</tr>

</tbody>
</table>


## `ApolloServerPluginLandingPageProductionDefault`

The `ApolloServerPluginLandingPageProductionDefault` shows a minimalist splash page. It's designed for use in production, and is displayed by default when `NODE_ENV` is not set to `production`. The landing page provides a copyable command-line snippet showing how to run operations with your server. By default, the only visible reference to Apollo is a footer explaining how to customize the page. You may also configure it to add a link to query your graph in Apollo Studio via Explorer.

### Options

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

###### `version`

`string`
</td>
<td>

By default, the landing page plugin uses the latest version of the landing page published to Apollo's CDN. If you'd like to pin the current version, you can specify it here; you can follow [this link](https://apollo-server-landing-page.cdn.apollographql.com/_latest/version.txt) to learn what the current version is.

</td>
</tr>

<tr>
<td>

###### `footer`

`boolean`
</td>
<td>

By default, the landing page has a footer linking to Apollo Server docs telling you how to configure the landing page. If you no longer want that footer displayed, you can pass `footer: false` to remove it from the landing page.

</td>
</tr>

<tr>
<td>

###### `graphRef`

`string`
</td>
<td>

If specified, the landing page will contain a link (with opt-in auto-redirect) to the Apollo Studio page for the given `graphRef`. (You need to explicitly pass this here even if you've already specified your server's graph reference for usage reporting and other purposes, because if your server is publicly accessible you may not want to display the graph ref publicly.) For example, you may specify `graphRef: 'my-graph@my-variant'`.

</td>
</tr>


</tbody>
</table>

## `ApolloServerPluginLandingPageGraphQLPlayground`

The `ApolloServerPluginLandingPageGraphQLPlayground` serves the [GraphQL Playground IDE](https://github.com/graphql/graphql-playground) as a landing page. (This was the landing page served by default in Apollo Server 2; note that the GraphQL Playground project has officially been [retired](https://github.com/graphql/graphql-playground/issues/1143).)

The GraphQL Playground plugin is not installed by default; to install it, import it from `apollo-server-core` and load it into your server:

```js
import { ApolloServer } from "apollo-server";
import {
  ApolloServerPluginLandingPageGraphQLPlayground
} from "apollo-server-core";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground(),
  ],
});
```

The `ApolloServerPluginLandingPageGraphQLPlayground` function takes the same arguments as the [`renderPlaygroundPage` function](https://github.com/apollographql/graphql-playground/blob/apollo/packages/graphql-playground-html/src/render-playground-page.ts) from the `graphql-playground-html` package (or specifically, the `@apollographql/graphql-playground-html` fork). The table below mentions a few of the more common options and is not exhaustive.
### Options

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

###### `version`

`string`
</td>
<td>

By default, the GraphQL Playground plugin loads a specific npm version of `@apollographql/graphql-playground-react` from a CDN; the version is hard-coded in `apollo-server-core` and is typically incremented when we new versions of the Playground fork are released (which is rare now because the project has been required). You can specify a different version here if you'd like.

</td>
</tr>

<tr>
<td>

###### `endpoint`

`string`
</td>
<td>

By default, GraphQL Playground connects to a GraphQL server hosted at the same URL currently loaded in the browser. To specify a different GraphQL endpoint, use this option.

</td>
</tr>

<tr>
<td>

###### `settings`

`Object`
</td>
<td>

If specified, allows you to override the default values of GraphQL Playground's settings. There is some documentation of what settings exist in [GraphQL Playground's README](https://github.com/graphql/graphql-playground#settings).

</td>
</tr>


</tbody>
</table>
