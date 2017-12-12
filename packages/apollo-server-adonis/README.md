---
title: Adonis
description: Setting up Apollo Server with Adonis
---

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core) [![Build Status](https://travis-ci.org/apollographql/apollo-server.svg?branch=master)](https://travis-ci.org/apollographql/apollo-server) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://www.apollographql.com/#slack)

This is the Adonis Framework integration of Apollo Server. Apollo Server is a community-maintained open-source Apollo Server that works with all Node.js HTTP server frameworks: Express, Connect, Hapi, Koa, Adonis Framework, and Restify. [Read the docs](https://www.apollographql.com/docs/apollo-server/).

```sh
npm install apollo-server-adonis
```

## Usage

```js
// start/routes.js
const { graphqlAdonis } = require('apollo-server-adonis');
// or using es6 modules
import { graphqlAdonis } from 'apollo-server-adonis';

const Route = use('Route');

Route.post('/graphql', graphqlAdonis({ schema: myGraphQLSchema }));
Route.get('/graphql', graphqlAdonis({ schema: myGraphQLSchema }));
```

### GraphiQL

You can also use `apollo-server-adonis` for hosting the [GraphiQL](https://github.com/graphql/graphiql) in-browser IDE. Note the difference between `graphqlAdonis` and `graphiqlAdonis`.

```js
// start/routes.js
const { graphiqlAdonis } = require('apollo-server-adonis');
// or using es6 modules
import { graphiqlAdonis } from 'apollo-server-adonis';

const Route = use('Route');

// Setup the /graphiql route to show the GraphiQL UI
Route.get(
  '/graphiql',
  graphiqlAdonis({
    endpointURL: '/graphql' // a POST endpoint that GraphiQL will make the actual requests to
  })
);
```

In case your GraphQL endpoint is protected via authentication, or if you need to pass other custom headers in the request that GraphiQL makes, you can use the [`passHeader`](https://github.com/apollographql/apollo-server/blob/v1.0.2/packages/apollo-server-module-graphiql/src/renderGraphiQL.ts#L17) option – a string that will be added to the request header object.

For example:

```js
// start/routes.js
const { graphiqlAdonis } = require('apollo-server-adonis');
// or using es6 modules
import { graphiqlAdonis } from 'apollo-server-adonis';

const Route = use('Route');

Route.get(
  '/graphiql',
  graphiqlAdonis({
    endpointURL: '/graphql',
    passHeader: `'Authorization': 'Bearer lorem ipsum'`
  })
);
```

## Principles

Apollo Server is built with the following principles in mind:

* **By the community, for the community**: Apollo Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, Apollo Server is easier to use, easier to contribute to, and more secure
* **Performance**: Apollo Server is well-tested and production-ready - no modifications needed

Anyone is welcome to contribute to Apollo Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/master/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/master/ROADMAP.md) and make your first PR!
