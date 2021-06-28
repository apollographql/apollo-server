---
title: "API Reference: Cache control plugin"
sidebar_title: Cache control
api_reference: true
---

## Using the plugin

This API reference documents the `ApolloServerPluginCacheControl` plugin.

This plugin enables your GraphQL server to specify a cache policy at the field level, either statically in your schema with the `@cacheControl` directive, or dynamically in your resolvers via the `info.cacheControl` API. It also by default sets the `cache-control` HTTP response header. This page is a reference for the options available in configuring the plugin; more background and examples are available in [the caching documentation](../../performance/caching/).

Apollo Server installs this plugin by default in all servers, with its default configuration.  You typically do not have to install this plugin yourself; you only need to do so if you want to provide non-default configuration.

If you want to configure this plugin, import it from the `apollo-server-core` package and pass it to your `ApolloServer` in the `plugins` array:

```js
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginCacheControl } from "apollo-server-core";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginCacheControl({
      // Cache everything for 1 second by default.
      defaultMaxAge: 1000,
      // Don't send the `cache-control` response header.
      calculateHttpHeaders: false,
    }),
  ],
});
```

If you don't want to use cache control at all, you can explicitly disable it with the `ApolloServerPluginCacheControlDisabled` plugin:

```js
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginCacheControlDisabled } from "apollo-server-core";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginCacheControlDisabled()],
});
```

(The plugin does not have much of an effect on your app if you do not use the `@cacheControl` directive or use the `info.cacheControl` API; there might be a very slight performance improvement from disabling the plugin if you do not use it.)

Note that in Apollo Server 3, the cache control plugin does *not* define the `@cacheControl` directive for you; if you want to use the directive, you must [define the `@cacheControl` directive in your schema](../..//performance/caching/#in-your-schema-static).

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

###### `defaultMaxAge`

`number`
</td>
<td>

By default, root fields and fields that return a composite type (object, interface, or union) are considered to be uncacheable (`maxAge` 0) unless a cache hint is explicitly provided via `@cacheControl` or `info.cacheControl`. You can set this option to make the default `maxAge` for these larger than 0; this will effectively cause all requests to be be cacheable. (This option was popular in Apollo Server 2 largely as a workaround for the problem solved by the [`@cacheControl(inheritMaxAge: true)`](../../performance/caching/#in-your-schema-static) directive argument; consider using `inheritMaxAge` instead of `defaultMaxAge` in Apollo Server 3.) You can read more about [`defaultMaxAge` in the caching documentation](../../performance/caching/#default-maxage).

</td>
</tr>

<tr>
<td>

###### `calculateHttpHeaders`

`boolean`
</td>
<td>

By default, the cache control plugin sets the `cache-control` HTTP response header to `max-age=MAXAGE, public` or `max-age=MAXAGE, private` if the request is cacheable. If you specify `caclculateHttpHeaders: false`, it will not set this header. The `requestContext.overallCachePolicy` field will still be calculated, and the [response cache plugin](../../performance/caching/#caching-with-responsecacheplugin-advanced) will still work.

</td>
</tr>


</tbody>
</table>
