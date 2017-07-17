# graphql-server-hapi

[![npm version](https://badge.fury.io/js/graphql-server-core.svg)](https://badge.fury.io/js/graphql-server-core)
[![Build Status](https://travis-ci.org/apollographql/graphql-server.svg?branch=master)](https://travis-ci.org/apollographql/graphql-server)
[![Coverage Status](https://coveralls.io/repos/github/apollographql/graphql-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/graphql-server?branch=master)
[![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](http://www.apollodata.com/#slack)

This is the Hapi integration of GraphQL Server. GraphQL Server is a community-maintained open-source GraphQL server that works with all Node.js HTTP server frameworks: Express, Connect, Hapi, Koa and Restify. [Read the docs](http://dev.apollodata.com/tools/apollo-server/index.html).

## Principles

GraphQL Server is built with the following principles in mind:

* **By the community, for the community**: GraphQL Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, GraphQL Server is easier to use, easier to contribute to, and more secure
* **Performance**: GraphQL Server is well-tested and production-ready - no modifications needed


Anyone is welcome to contribute to GraphQL Server, just read [CONTRIBUTING.md](./CONTRIBUTING.md), take a look at the [roadmap](./ROADMAP.md) and make your first PR!

## Usage

With the Hapi plugins `graphqlHapi` and `graphiqlHapi` you can pass a route object that includes options to be applied to the route.  The example below enables CORS on the `/graphql` route.

```js
import hapi from 'hapi';
import { graphqlHapi } from 'apollo-server-hapi';

const server = new hapi.Server();

const HOST = 'localhost';
const PORT = 3000;

server.connection({
    host: HOST,
    port: PORT,
});

server.register({
    register: graphqlHapi,
    options: {
      path: '/graphql',
      graphqlOptions: {
        schema: myGraphQLSchema,
      },
      route: {
        cors: true
      }
    },
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log(`Server running at: ${server.info.uri}`);
});
```

