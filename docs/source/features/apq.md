---
title: Automatic Persisted Queries
description: Reduce the size of GraphQL requests over the wire
---

The size of individual GraphQL query strings can be a major pain point. Apollo Server allows implements Automatic Persisted Queries (APQ), a technique that greatly improves network performance for GraphQL with zero build-time configuration. A persisted query is a ID or hash that can be sent to the server instead of the entire GraphQL query string. This smaller signature reduces bandwidth utilization and speeds up client loading times. Persisted queries are especially nice paired with GET requests, enabling the browser cache and [integration with a CDN](#get).

With Apollo Persisted Queries, the ID is a deterministic hash of the input query, so we don't need a complex build step to share the ID between clients and servers. If a server doesn't know about a given hash, the client can expand the query for it; Apollo Server caches that mapping.

<h2 id="setup">Setup</h2>

To get started with APQ, add the [Automatic Persisted Queries Link](https://github.com/apollographql/apollo-link-persisted-queries) to the client codebase with `npm install apollo-link-persisted-queries`. Next incorporate the APQ link with Apollo Client's link chain before the HTTP link:

```js
import { createPersistedQueryLink } from "apollo-link-persisted-queries";
import { createHttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";

const link = createPersistedQueryLink().concat(createHttpLink({ uri: "/graphql" }));

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: link,
});
```

> Note: using `apollo-link-persisted-query` requires migrating from [apollo-boost](https://www.apollographql.com/docs/react/advanced/boost-migration.html):

Inside Apollo Server, the query registry is stored in a user-configurable cache. By default, Apollo Server uses a in-memory cache. This can be configured inside of the `ApolloServer` constructor:

```js
const { MemcachedCache } = require('apollo-server-memcached');
const { ApolloServe } = require('apollo-server');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  persistedQueries: {
    cache: new MemcachedCache(
      ['memcached-server-1', 'memcached-server-2', 'memcached-server-3'],
      { retries: 10, retry: 10000 }, // Options
    ),
  },
});
```

<h2 id="verify">Verify</h2>

Apollo Server's persisted queries configuration can be tested from the command-line. The following examples assume Apollo Server is running at `localhost:4000/`.
This example persists a dummy query of `{__typename}`, using its sha256 hash: `ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38`.


1. Request a persisted query:

```bash
curl -g 'http://localhost:4000/?extensions={"persistedQuery":{"version":1,"sha256Hash":"ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38"}}'
```

   Expect a response of: `{"errors": [{"message": "PersistedQueryNotFound", "extensions": {...}}]}`.

2. Store the query to the cache:

```bash
curl -g 'http://localhost:4000/?query={__typename}&extensions={"persistedQuery":{"version":1,"sha256Hash":"ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38"}}'
```

   Expect a response of `{"data": {"__typename": "Query"}}"`.

3. Request the persisted query again:

```bash
curl -g 'http://localhost:4000/?extensions={"persistedQuery":{"version":1,"sha256Hash":"ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38"}}'
```

   Expect a response of `{"data": {"__typename": "Query"}}"`, as the query string is loaded from the cache.

<h2 id="get">Using GET requests with APQ to enable CDNs</h2>

A great application for APQ is running Apollo Server behind a CDN. Many CDNs only cache GET requests, but many GraphQL queries are too long to fit comfortably in a cacheable GET request.  When the APQ link is created with `createPersistedQueryLink({useGETForHashedQueries: true})`, Apollo Client automatically sends the short hashed queries as GET requests allowing a CDN to serve those request. For full-length queries and for all mutations, Apollo Client will continue to use POST requests. For more about this pattern, read about how [Apollo Server provides cache information to CDNs]().

<h2 id="how-it-works">How it works</h2>

The mechanism is based on a lightweight protocol extension between Apollo Client and Apollo Server. It works as follows:

- When the client makes a query, it will optimistically send a short (64-byte) cryptographic hash instead of the full query text.
- *Optimized Path:* If a request containing a persisted query hash is detected, Apollo Server will look it up to find a corresponding query in its registry. Upon finding a match, Apollo Server will expand the request with the full text of the query and execute it.
- *New Query Path:* In the unlikely event that the query is not already in the Apollo Server registry (this only happens the very first time that Apollo Server sees a query), it will ask the client to resend the request using the full text of the query. At that point Apollo Server will store the query / hash mapping in the registry for all subsequent requests to benefit from.

<div align="center">
<h3 id="Optimized-Path">**Optimized Path**</h3>
</div>

![Optimized path](../images/persistedQueries.optPath.png)

<div align="center">
<h3 id="New-Query-Path">**New Query Path**</h3>
</div>

![New query path](../images/persistedQueries.newPath.png)


