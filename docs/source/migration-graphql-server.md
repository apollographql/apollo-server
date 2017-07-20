---
title: Migrating to v0.4
order: 205
description: How to migrate to GraphQL Server 0.4 from Apollo Server 0.3
---

In version 0.4, Apollo Server has been renamed to GraphQL Server, to reduce confusion about its compatibility with other GraphQL-related packages and tools. In particular, the goal is to ensure people don't get confused that Apollo Client only works with Apollo Server and the other way around.

> Note: This guide assumes you were previously up to date with `apollo-server` series `0.3.x`. If you are currently using `0.2.x` or below, consult the [previous migration guide](migration-hapi.md).

## Splitting into multiple packages

Having all of Apollo Server in one npm package was causing some issues, particularly with TypeScript development. Starting with `0.4`, the GraphQL Server is shipping as 3 different packages:

* `apollo-server-express`
* `apollo-server-hapi`
* `apollo-server-koa`

It has also been refactored to be more modular internally, but that doesn't matter from a usage perspective.

## Migration guide

Even though the code has been radically reorganized and many exports renamed, the functionality remains identical. At most, you will have to rename 2-4 variables and imports in your code.

If you were previously importing the server plugin from `apollo-server`, you should now import from the server-specific package. Every part of the API that used to have the word `apollo` in it now says `graphql`. Read the details for your server below.

### Express

```js
// Before
import { apolloExpress, graphiqlExpress } from 'apollo-server';

// After
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
```

For TypeScript types:

```js
// Before
import { ExpressApolloOptionsFunction } from 'apollo-server';

// After
import { ExpressGraphQLOptionsFunction } from 'apollo-server-express';
```

### Connect

The Connect server middleware is in the same package as the Express middleware.

```js
// Before
import { apolloConnect, graphiqlConnect } from 'apollo-server';

// After
import { graphqlConnect, graphiqlConnect } from 'apollo-server-express';
```

### Hapi

```js
// Before
import { apolloHapi, graphiqlHapi } from 'apollo-server';

// After
import { graphqlHapi, graphiqlHapi } from 'apollo-server-hapi';
```

Importing TypeScript types is the same as before.

Also, the `apolloOptions` parameter to the plugin has been renamed to `graphqlOptions`:

```js
// Before
server.register({
  register: apolloHapi,
  options: {
    apolloOptions: options,
    path: '/graphql',
  },
});

// After
server.register({
  register: graphqlHapi,
  options: {
    graphqlOptions: options,
    path: '/graphql',
  },
});
```

### Koa

```js
// Before
import { apolloKoa, graphiqlKoa } from 'apollo-server';

// After
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa';
```

```js
// Before
import { KoaApolloOptionsFunction, KoaHandler } from 'apollo-server';

// After
import { KoaGraphQLOptionsFunction, KoaHandler } from 'apollo-server-koa';
```
