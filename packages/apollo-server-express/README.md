# apollo-server-express

[![npm version](https://badge.fury.io/js/graphql-server-core.svg)](https://badge.fury.io/js/graphql-server-core)
[![Build Status](https://travis-ci.org/apollographql/graphql-server.svg?branch=master)](https://travis-ci.org/apollographql/graphql-server)
[![Coverage Status](https://coveralls.io/repos/github/apollographql/graphql-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/graphql-server?branch=master)
[![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](http://www.apollodata.com/#slack)

This is the Express and Connect integration of GraphQL Server. Apollo Server is a community-maintained open-source GraphQL server that works with all Node.js HTTP server frameworks: Express, Connect, Hapi, Koa and Restify. [Read the docs](http://dev.apollodata.com/tools/apollo-server/index.html).

## Principles

GraphQL Server is built with the following principles in mind:

* **By the community, for the community**: GraphQL Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, GraphQL Server is easier to use, easier to contribute to, and more secure
* **Performance**: GraphQL Server is well-tested and production-ready - no modifications needed


Anyone is welcome to contribute to GraphQL Server, just read [CONTRIBUTING.md](https://github.com/apollographql/apollo-server/blob/master/CONTRIBUTING.md), take a look at the [roadmap](https://github.com/apollographql/apollo-server/blob/master/ROADMAP.md) and make your first PR!

## Usage

### Express

```js
import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress } from 'apollo-server-express';

const myGraphQLSchema = // ... define or import your schema here!
const PORT = 3000;

const app = express();

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: myGraphQLSchema }));

app.listen(PORT);
```

### Connect
```js
import connect from 'connect';
import bodyParser from 'body-parser';
import { graphqlConnect } from 'apollo-server-express';
import http from 'http';

const PORT = 3000;

const app = connect();

// bodyParser is needed just for POST.
app.use('/graphql', bodyParser.json());
app.use('/graphql', graphqlConnect({ schema: myGraphQLSchema }));

http.createServer(app).listen(PORT);
```
