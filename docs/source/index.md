---
title: Build a GraphQL server with Node.js
sidebar_title: Installing
description: Apollo Server is a flexible, community driven, production-ready HTTP GraphQL middleware for Express, Hapi, Koa, and more.
---

Apollo Server is a library that helps you connect a GraphQL schema to an HTTP server in Node. Apollo Server works with any GraphQL schema built with [GraphQL.js](https://github.com/graphql/graphql-js), so you can build your schema with that directly or with a convenience library such as [graphql-tools](https://www.apollographql.com/docs/graphql-tools/). You can use Apollo Server with all popular JavaScript HTTP servers, including Express, Connect, Hapi, Koa, Restify, and Lambda.

This server can be queried from any GraphQL client, since it supports all of the common semantics for sending GraphQL over HTTP, as [documented on graphql.org](http://graphql.org/learn/serving-over-http/). Apollo Server also supports some small extensions to the protocol, such as sending multiple GraphQL operations in one request. Read more on the [sending requests](./requests.html) page.

[Contribute to Apollo Server on GitHub.](https://github.com/apollographql/apollo-server)

<h2 id="get-started">Quick start</h2>

If you want to get started quickly, take a look at the [quick start code snippet](./example.html). This will get you started with a Node.js GraphQL server in about 10 seconds.

<h2 id="tutorial">End-to-end GraphQL server tutorial</h2>

If you're looking to learn about how to connect to different data sources, check out our recently updated tutorial which walks you through building a server from start to finish: [How To Build a GraphQL Server to talk to SQL, MongoDB, and REST](https://dev-blog.apollodata.com/tutorial-building-a-graphql-server-cddaa023c035)

<h2 id="selecting-package">Selecting the right package</h2>

Apollo Server is actually a family of npm packages, one for each Node.js HTTP server library.

Pick the one below that suits your needs:

```bash
# Pick the one that matches your server framework
npm install graphql apollo-server-express  # for Express or Connect
npm install graphql apollo-server-hapi
npm install graphql apollo-server-koa
npm install graphql apollo-server-restify
npm install graphql apollo-server-lambda
npm install graphql apollo-server-micro
npm install graphql apollo-server-azure-functions
npm install graphql apollo-server-adonis
```

If you don't see your favorite server there, [file a PR](https://github.com/apollographql/apollo-server)!

<h2 id="features">Features</h2>

At the end of the day, Apollo Server is a simple, production-ready solution without too many features. Here's what you can do with it:

* Attach a GraphQL schema to your HTTP server to serve requests
* Attach GraphQL and GraphiQL via separate middlewares, on different routes
* Accept queries via GET or POST
* Support HTTP query batching
* Support Apollo Tracing to get performance information about your server
* Support Apollo Cache Control to inform caching gateways such as Apollo Engine
* Support additional [graphql-extensions](https://github.com/apollographql/graphql-extensions) (other than Apollo Tracing or Cache Control)

<h2 id="principles">Principles</h2>

Apollo Server is built with the following principles in mind:

* **By the community, for the community**: Apollo Server's development is driven by the needs of developers using the library.
* **Simplicity**: Keeping things simple, for example supporting a limited set of transports, makes Apollo Server easier to use, easier to contribute to, and more secure.
* **Performance**: Apollo Server is well-tested and production-ready.

Anyone is welcome to contribute to Apollo Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/master/CONTRIBUTING.md), take a look at the [issues](https://github.com/apollographql/apollo-server/issues) and make your first PR!
