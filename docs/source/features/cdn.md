---
title: CDN integration
description: Getting content delivery networks to cache GraphQL responses
---

Content-delivery networks such as [fly.io](https://fly.io), [Cloudflare](https://www.cloudflare.com/), [Akamai](https://www.akamai.com/) or [Fastly](https://www.fastly.com/) allow content caching close to clients, delivering data with low latency from a nearby server. Apollo Server makes it straightforward to use CDNs with GraphQL queries to cache full responses while still executing more dynamic queries.

To use Apollo Server behind a CDN, we define which GraphQL responses the CDN is allowed to cache. On the client, we set up [automatic persisted queries](./apq.html) to ensure that GraphQL requests are in a format that a CDN can understand.

<h2 id="cache-hints" title="1. Add cache hints">Step 1: Add cache hints to the GraphQL schema</h2>

Add cache hints as [directives](./directives.html) to GraphQL schema so that Apollo Server knows which fields and types are cacheable and for how long. For example, this schema indicates that all fields that return an `Author` should be cached for 60 seconds, and that the `posts` field should itself be cached for 180 seconds:

```graphql
type Author @cacheControl(maxAge: 60) {
  id: Int
  firstName: String
  lastName: String
  posts: [Post] @cacheControl(maxAge: 180)
}
```

See [the cache control documentation](https://github.com/apollographql/apollo-cache-control-js#add-cache-hints-to-your-schema) for more details, including how to specify hints dynamically inside resolvers, how to set a default `maxAge` for all fields, and how to specify that a field should be cached for specific users only (in which case CDNs should ignore it). For example, to set a default max age other than 0 modify the Apollo Server constructor to include `cacheControl`:

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // The max age is calculated in seconds
  cacheControl: { defaultMaxAge: 5 },
});
```

After this step, Apollo Server will serve the HTTP `Cache-Control` header on fully cacheable responses, so that any CDN in front of Apollo Server will know which responses can be cached and for how long! A "fully cacheable" response contains only data with non-zero `maxAge`; the header will refer to the minimum `maxAge` value across the whole response, and it will be `public` unless some of the data is tagged `scope: PRIVATE`. To observe this header, use any browser's network tab in its dev tools.

<h2 id="enable-apq" title="2. Enable persisted queries">Step 2: Enable automatic persisted queries</h2>

Often, GraphQL requests are big POST requests and most CDNs will only cache GET requests. Additionally, GET requests generally work best when the URL has a bounded size. Enabling automatic persisted queries means that short hashes are sent over the wire instead of full queries, and Apollo Client can be configured to use GET requests for those hashed queries.

To do this, update the **client** code. First, add the package:

```
npm install apollo-link-persisted-queries
```

Then, add the persisted queries link to the Apollo Client constructor before the HTTP link:

```js
import { createPersistedQueryLink } from "apollo-link-persisted-queries";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from "apollo-link";
import ApolloClient from "apollo-client";

ApolloLink.from([
  createPersistedQueryLink({ useGETForHashedQueries: true }),
  createHttpLink({ uri: "/graphql" })
]);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link
});
```

Make sure to include `useGETForHashedQueries: true`. Note that the client will still use POSTs for mutations, because it's generally best to avoid GETs for non-idempotent requests.

If configured correctly, browser's dev tools should verify that queries are now sent as GET requests, and receive appropriate `Cache-Control` response headers.

<h2 id="setup-cdn" title="3. Set up a CDN">Step 3: Set up a CDN!</h2>

How exactly this works depends on exactly which CDN you chose. Configure your CDN to send requests to Apollo Server. Some CDNs may need to be specially configured to honor origin Cache-Control headers; for example, here is [Akamai's documentation on that setting](https://learn.akamai.com/en-us/webhelp/ion/oca/GUID-57C31126-F745-4FFB-AA92-6A5AAC36A8DA.html). If all is well, cacheable queries should now be saved by the CDN!

> Note that requests served directly by a CDN will not show up in the Engine dashboard.
