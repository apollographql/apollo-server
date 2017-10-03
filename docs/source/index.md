---
title: Installing
description: How to install Apollo Server
---

Apollo server is a flexible, community driven, production-ready HTTP Apollo Server plugin for Node.js.

It works with any GraphQL schema built with [GraphQL.js](https://github.com/graphql/graphql-js), Facebook's reference JavaScript execution library, and you can use Apollo Server with all popular JavaScript HTTP servers, including Express, Connect, Hapi, Koa, Restify, and Lambda.

This server can be queried from any popular GraphQL client, such as [Apollo](http://dev.apollodata.com) or [Relay](https://facebook.github.io/relay) because it supports all of the common semantics for sending GraphQL over HTTP, as [documented on graphql.org](http://graphql.org/learn/serving-over-http/). Apollo Server also supports some small extensions to the protocol, such as sending multiple GraphQL operations in one request. Read more on the [sending requests](/tools/apollo-server/requests.html) page.

Install it with:

```bash
# Pick the one that matches your server framework
npm install graphql apollo-server-express  # for Express or Connect
npm install graphql apollo-server-hapi
npm install graphql apollo-server-koa
npm install graphql apollo-server-restify
npm install graphql apollo-server-lambda
npm install graphql apollo-server-micro
```

> A note for those who’ve used Apollo Server previously: You may notice we now import from `apollo-server-` rather than `graphql-server-` npm packages. We felt the rename better reflects that it’s part of the Apollo project and family of libraries.

The following features distinguish Apollo Server from [express-graphql](https://github.com/graphql/express-graphql), Facebook's reference HTTP server implementation:

- Apollo Server has a simpler interface and allows fewer ways of sending queries, which makes it a bit easier to reason about what's going on.
- Apollo Server serves GraphiQL on a separate route, giving you more flexibility to decide when and how to serve it.
- Apollo Server supports [query batching](https://medium.com/apollo-stack/query-batching-in-apollo-63acfd859862) which can help reduce load on your server.
- Apollo Server has built-in support for persisted queries, which can make your app faster and your server more secure.
