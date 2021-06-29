---
title: Choosing which package to use
sidebar_title: Choosing which package to use
description: Use Apollo Server stand-alone or with your favorite Node.js web framework
---

Apollo Server is distributed as a suite of packages. You choose which package based on how you want to run your GraphQL server.  These packages include:

- `apollo-server`: the "batteries-included" GraphQL server. `apollo-server` lets you run a GraphQL server in just a few lines of code with a simple API. Howevever, it does not allow for fine control over your server's HTTP serving.
- `apollo-server-express`: the GraphQL server for [Express](https://expressjs.com/), the most popular Node.js web framework. `apollo-server-express` lets you attach a GraphQL server to an Express server. `apollo-server` is built on top of `apollo-server-express`; if you start with `apollo-server` and later need to tweak how it serves over HTTP, you can easily "eject" from `apollo-server` by porting your server from `apollo-server` to `apollo-server-express`.
- `apollo-server-fastify`, `apollo-server-hapi`, `apollo-server-koa`, `apollo-server-micro`: GraphQL servers for other Node.js web frameworks ([Fastify](https://www.fastify.io/), [hapi](https://hapi.dev/), [Koa](https://koajs.com/), and [Micro](https://www.npmjs.com/package/micro)).
- `apollo-server-lambda`, `apollo-server-cloud-functions`, `apollo-server-azure-functions`, `apollo-server-cloudflare`: GraphQL servers for serverlesss environments (AWS Lambda, Google Cloud Functions, Azure Functions, and Cloudflare).

All of these packages export an `ApolloServer` class; their APIs are similar though not identical.

All of these packages depend on `apollo-server-core`, where the main code shared by all integrations lives. Some symbols, such as [built-in plugins](../builtin-plugins/), are imported directly from `apollo-server-core`.

All of these packages (including `apollo-server-core`) are published to npm with the same version numbers, even if code is only changed in some of them. That makes it easier to talk about "Apollo Server v3.1.2" without having to specify the package name specifically. There are other support packages such as `apollo-server-caching`, `apollo-server-types`, and `apollo-server-plugin-base` which use their own versioning and are only published when they change or one of their dependencies changes.

## Which package should I use?

If you are running your GraphQL server in a serverless environment (Lambda, Google Cloud Functions, Azure Functions, or Cloudflare), you should choose the package corresponding to that environment.

Otherwise, if you're getting started, you should choose `apollo-server` unless you have a specific reason not to.

Once you've got your server up and running with `apollo-server`, you may find that you need more control over the HTTP behavior of your server than `apollo-server` provides. For example, you might want to run some middleware before processing GraphQL requests, or you might want to serve other endpoints from the same server. In that case, unless you have a pre-existing desire to use another web framework, we recommend you ["eject" from `apollo-server`](#apollo-server-express) by rewriting your server to use `apollo-server-express`. The change only takes a few lines.

(We recommend Express because it's the most popular Node.js web framework, with an enormous number of npm packages that integrate with it. Its development has slowed down recently, which does mean it has some awkward characteristics (for example, its async support is not built around `Promise`s and `async` functions), but also means that backwards-incompatible changes to the framework are rarer than in newer frameworks.)

If you are already familiar with one of the other frameworks supported by Apollo Server (Fastify, hapi, Koa, or Micro), you may want to "eject" to the integration with that framework ahead. (It's worth noting that the Express integration (on its own or via `apollo-server`) is [much more popular than the other frameworks](https://npmcharts.com/compare/apollo-server-express,apollo-server-fastify,apollo-server-koa,apollo-server-hapi,apollo-server-micro) so you are more likely to encounter issues using some of the more obscure Apollo Server features on the other frameworks than with Express.)

The rest of this document shows how to define a server with each package. More details on using each package can be found in their READMEs.

This document lists the options supported by each package's `applyMiddleware` or `getMiddleware` or `createHandler` function. You can learn more about how these options work in [the `ApolloServer` reference](../api/apollo-server/#framework-specific-middleware-function).

## `apollo-server`

`apollo-server` is the "batteries-included" GraphQL server. When you use it, you don't have to think about web frameworks or URLs or middleware, and its one main entry point (`listen`) is a nice `async` function rather than an old-school callback-based function.

```
$ npm install apollo-server graphql
```

```javascript
import { ApolloServer } from 'apollo-server';

async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await server.listen();
  console.log(`🚀 Server ready at ${url}`);
}
```

While it's easy to get started with `apollo-server` because you don't have to worry about a web framework, you can't tweak  its behavior as much as you can with web framework integrations. For example, you can't serve other endpoints from the same HTTP server. If you want to do something with your server that isn't supported by `apollo-server`, you can "eject" by switching over to `apollo-server-express`. (`apollo-server` is just a thin wrapper that combines `apollo-server-express` with `express`.)

## `apollo-server-express`

`apollo-server-express` is the GraphQL server for [Express](https://expressjs.com/), the most popular Node.js web framework. `apollo-server-express` lets you attach a GraphQL server to an Express server. `apollo-server` is built on top of `apollo-server-express`; if you start with `apollo-server` and later need to tweak how it serves over HTTP, you can easily "eject" from `apollo-server` by porting your server from `apollo-server` to `apollo-server-express`.

The following function is roughly equivalent to the `apollo-server` sample code above.

```
$ npm install apollo-server-express express graphql
```

```javascript
import { ApolloServer } from 'apollo-server-express';
import express from 'express';

async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  const app = express();
  server.applyMiddleware({ app });
  const { url } = await server.listen();
  await new Promise(resolve => app.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}
```

You must `await server.start()` before calling `server.applyMiddleware`; however, you may add other middleware to `app` before or after calling `applyMiddleware`.

You may also call `server.getMiddleware` instead of `server.applyMiddleware` if you'd like to do something else with the middleware function other than directly apply it to your app.  (`server.applyMiddleware({ app, ...rest })` is shorthand for `app.use(server.getMiddleware(rest))`.)

`applyMiddleware` (and `getMiddleware`) takes a few options, such as `path`, `cors`, `bodyParserConfig`, `onHealthCheck`, and `disableHealthCheck`.

(`apollo-server` does provide one extra feature that isn't straightforward to implement with `apollo-server-express` or other framework integrations. Because `apollo-server` is responsible for making its HTTP server listen for requests, its [`stop`](../api/apollo-server/#stop) method is also responsible for stopping the server, and it can make sure to stop accepting new requests *before* it begins to shut down the machinery that processes GraphQL operations. When using other integrations, if you want this behavior, you need to make sure to stop your web server *before* calling `stop()` on your `ApolloServer`, which is challenging if `stop` is being called due to the [signal handlers](../api/apollo-server/#stoponterminationsignals) which Apollo Server installs by default. We'd like to improve this situation, as described in [issue #5074](https://github.com/apollographql/apollo-server/issues/5074).)

## `apollo-server-fastify`

`apollo-server-fastify` is the GraphQL server for [Fastify](https://www.fastify.io/), a Node.js web framework. Apollo Server 3 supports Fastify v3.

The following function is roughly equivalent to the `apollo-server` sample code above.

```
$ npm install apollo-server-fastify fastify graphql
```

```javascript
import { ApolloServer } from 'apollo-server-fastify';
import fastify from 'fastify';

async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  const app = fastify();
  app.register(server.createHandler());
  await app.listen(4000);
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}
```

You must `await server.start()` before calling `server.createHandler`; however, you may call other functions on `app` before or after calling `createHandler`.

`createHandler` takes a few options, such as `path`, `cors`, `onHealthCheck`, and `disableHealthCheck`.

## `apollo-server-hapi`

`apollo-server-hapi` is the GraphQL server for [hapi](https://hapi.dev/), a Node.js web framework. Apollo Server 3 is only tested with `@hapi/hapi` v20.1.2 and newer (the minimum version which supports Node 16).

The following function is roughly equivalent to the `apollo-server` sample code above.

```
$ npm install apollo-server-hapi @hapi/hapi graphql
```

```javascript
import { ApolloServer } from 'apollo-server-hapi';
import Hapi from '@hapi/hapi';

async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  const app = new Hapi.server({
    port: 4000
  });
  await server.applyMiddleware({
    app,
  });
  await app.start();
}
```

You must `await server.start()` before calling `server.applyMiddleware`; however, you may call other functions on `app` before or after calling `applyMiddleware`.

`applyMiddleware` takes a few options, such as `path`, `route`, `cors`, `onHealthCheck`, and `disableHealthCheck`.


## `apollo-server-koa`

`apollo-server-koa` is the GraphQL server for [Koa](https://koajs.com/), a Node.js web framework.

The following function is roughly equivalent to the `apollo-server` sample code above.

```
$ npm install apollo-server-koa koa graphql
```

```javascript
import { ApolloServer } from 'apollo-server-koa';
import Koa from 'koa';

async function startApolloServer(typeDefs, resolvers) {
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();
  const app = new Koa();
  server.applyMiddleware({ app });
  await new Promise(resolve => app.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  return { server, app };
}
```

You must `await server.start()` before calling `server.applyMiddleware`; however, you may call other functions on `app` before or after calling `applyMiddleware`.

You may also call `server.getMiddleware` instead of `server.applyMiddleware` if you'd like to do something else with the middleware function other than directly apply it to your app.  (`server.applyMiddleware({ app, ...rest })` is shorthand for `app.use(server.getMiddleware(rest))`.)

`applyMiddleware` (and `getMiddleware`) takes a few options, such as `path`, `cors`, `bodyParserConfig`, `onHealthCheck`, and `disableHealthCheck`.


## `apollo-server-micro`

`apollo-server-micro` is the GraphQL server for [Micro](https://www.npmjs.com/package/micro), a Node.js web framework.

The following file is roughly equivalent to the `apollo-server` sample code above. You should put your JS in a file called `index.js` in order for the `micro` CLI to find it.

```
$ npm install apollo-server-micro micro graphql
```

```javascript
import { ApolloServer } from 'apollo-server-micro';

const server = new ApolloServer({ typeDefs, resolvers });

module.exports = server.start().then(() => server.createHandler());
```

Then run the web server with `npx micro`.

`createHandler` takes a few options, such as `path`, `onHealthCheck`, and `disableHealthCheck`. Note that `apollo-server-micro` does not have a built-in way of setting CORS headers.


## `apollo-server-lambda`

`apollo-server-lambda` is the GraphQL server for [AWS Lambda](https://aws.amazon.com/lambda/), Amazon's serverless compute service.

It is a layer around `apollo-server-express`, which uses the [`@vendia/serverless-express`](https://www.npmjs.com/package/@vendia/serverless-express) package to translate Lambda events into Express requests. (This package is not related to the [Serverless framework](https://www.serverless.com/).) It supports API Gateway and ALB.

The following file is roughly equivalent to the `apollo-server` sample code above.

```
$ npm install apollo-server-lambda graphql
```

```javascript
import { ApolloServer } from 'apollo-server-lambda';

const server = new ApolloServer({ typeDefs, resolvers });

exports.handler = server.createHandler();
```

For more details on using `apollo-server-lambda`, see the [documentation on deploying to Lambda](../deployment/lambda/).

## `apollo-server-cloud-functions`

`apollo-server-cloud-functions` is the GraphQL server for [Cloud Functions](https://cloud.google.com/functions), Google's serverless compute service.

Because Cloud Function's Node.js runtime uses Express, `apollo-server-cloud-functions` is a layer around `apollo-server-express`.

The following file is roughly equivalent to the `apollo-server` sample code above.

```
$ npm install apollo-server-cloud-functions graphql
```

```javascript
import { ApolloServer } from 'apollo-server-cloud-functions';

const server = new ApolloServer({ typeDefs, resolvers });

exports.handler = server.createHandler();
```

For more details on using `apollo-server-cloud-functions`, see the [documentation on deploying to Cloud Functions](../deployment/gcp-functions/).


## `apollo-server-azure-functions`

`apollo-server-azure-functions` is the GraphQL server for [Azure Functions](https://azure.microsoft.com/en-us/services/functions/), Microsoft's serverless compute service.

The following file is roughly equivalent to the `apollo-server` sample code above.

```
$ npm install apollo-server-azure-functions graphql
```

```javascript
import { ApolloServer } from 'apollo-server-azure-functions';

const server = new ApolloServer({ typeDefs, resolvers });

exports.handler = server.createHandler();
```

For more details on using `apollo-server-azure-functions`, see the [documentation on deploying to Azure Functions](../deployment/azure-functions/).


## `apollo-server-cloudflare`

`apollo-server-cloudflare` is the GraphQL server for [Cloudflare Workers](https://workers.cloudflare.com/). This package is experimental and is not actively supported by Apollo.

For more details on using Apollo Server with Cloudflare Workers, see the [Apollo GraphQL Server Quickstart](https://developers.cloudflare.com/workers/get-started/quickstarts) in the Cloudflare Workers documentation.
