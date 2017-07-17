# GraphQL Server for Express, Connect, Hapi, Koa, Restify and AWS Lambda

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core)
[![Build Status](https://travis-ci.org/apollographql/apollo-server.svg?branch=master)](https://travis-ci.org/apollographql/apollo-server)
[![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master)
[![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](http://www.apollodata.com/#slack)

Apollo Server is a community-maintained open-source GraphQL server. It works with all Node.js HTTP server frameworks: Express, Connect, Hapi, Koa and Restify.

## Principles

Apollo Server is built with the following principles in mind:

* **By the community, for the community**: Apollo Server's development is driven by the needs of developers
* **Simplicity**: by keeping things simple, Apollo Server is easier to use, easier to contribute to, and more secure
* **Performance**: Apollo Server is well-tested and production-ready - no modifications needed


Anyone is welcome to contribute to Apollo Server, just read [CONTRIBUTING.md](./CONTRIBUTING.md), take a look at the [roadmap](./ROADMAP.md) and make your first PR!


## Getting started

Apollo Server is super easy to set up. Just `npm install apollo-server-<variant>`, write a GraphQL schema, and then use one of the following snippets to get started. For more info, read the [Apollo Server docs](http://dev.apollodata.com/tools/apollo-server/index.html).

### Installation

Just run `npm install --save apollo-server-<variant>` and you're good to go!

where variant is one of the following:
 - express
 - koa
 - hapi
 - restify
 - lambda
 - micro

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

### Hapi

Now with the Hapi plugins `graphqlHapi` and `graphiqlHapi` you can pass a route object that includes options to be applied to the route.  The example below enables CORS on the `/graphql` route.

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

### Koa
```js
import koa from 'koa'; // koa@2
import koaRouter from 'koa-router'; // koa-router@next
import koaBody from 'koa-bodyparser'; // koa-bodyparser@next
import { graphqlKoa } from 'apollo-server-koa';

const app = new koa();
const router = new koaRouter();
const PORT = 3000;

// koaBody is needed just for POST.
app.use(koaBody());

router.post('/graphql', graphqlKoa({ schema: myGraphQLSchema }));
router.get('/graphql', graphqlKoa({ schema: myGraphQLSchema }));

app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT);
```

### Restify
```js
import restify from 'restify';
import { graphqlRestify, graphiqlRestify } from 'apollo-server-restify';

const PORT = 3000;

const server = restify.createServer({
  title: 'Apollo Server'
});

const graphQLOptions = { schema: myGraphQLSchema };

server.use(restify.bodyParser());
server.use(restify.queryParser());

server.post('/graphql', graphqlRestify(graphQLOptions));
server.get('/graphql', graphqlRestify(graphQLOptions));

server.get('/graphiql', graphiqlRestify({ endpointURL: '/graphql' }));

server.listen(PORT, () => console.log(`Listening on ${PORT}`));
```

### AWS Lambda

Lambda function should be run with Node.js v4.3. Requires an API Gateway with Lambda Proxy Integration.

```js
var server = require("apollo-server-lambda");

exports.handler = server.graphqlLambda({ schema: myGraphQLSchema });
```

### ZEIT Micro

Requires the [Micro](https://github.com/zeit/micro) module

```js
const server = require("apollo-server-micro");

module.exports = server.microGraphql({ schema: myGraphQLSchema });
```

## Options

Apollo Server can be configured with an options object with the the following fields:

* **schema**: the GraphQLSchema to be used
* **context**: the context value passed to resolvers during GraphQL execution
* **rootValue**: the value passed to the first resolve function
* **formatError**: a function to apply to every error before sending the response to clients
* **validationRules**: additional GraphQL validation rules to be applied to client-specified queries
* **formatParams**: a function applied for each query in a batch to format parameters before execution
* **formatResponse**: a function applied to each response after execution

All options except for `schema` are optional.

### Whitelisting

The `formatParams` function can be used in combination with the `OperationStore` to enable whitelisting.

```js
const store = new OperationStore(Schema);
store.put('query testquery{ testString }');
graphqlOptions = {
    schema: Schema,
    formatParams(params) {
        params['query'] = store.get(params.operationName);
        return params;
    },
};
```

## Differences to express-graphql

Apollo Server and express-graphql are more or less the same thing (GraphQL middleware for Node.js), but there are a few key differences:

* express-graphql works with Express and Connect, Apollo Server supports Express, Connect, Hapi, Koa and Restify.
* express-graphql's main goal is to be a minimal reference implementation, whereas Apollo Server's goal is to be a complete production-ready GraphQL server.
* Compared to express-graphql, Apollo Server has a simpler interface and supports exactly one way of passing queries.
* Apollo Server separates serving GraphiQL (GraphQL UI) from responding to GraphQL requests.
* express-graphql contains code for parsing HTTP request bodies, Apollo Server leaves that to standard packages like body-parser.
* Includes an `OperationStore` to easily manage whitelisting
* Built with TypeScript

Despite express-graphql being a reference implementation, Apollo Server is actually easier to understand and more modular than express-graphql.

That said, Apollo Server is heavily inspired by express-graphql (it's the reference implementation after all). Rather than seeing the two as competing alternatives, we think that they both have separate roles in the GraphQL ecosystem: express-graphql is a reference implementation, and Apollo Server is a GraphQL server to be used in production and evolve quickly with the needs of the community. Over time, express-graphql can adopt those features of Apollo Server that have proven their worth and become established more widely.

### application/graphql requests

express-graphql supports the `application/graphql` Content-Type for requests, which is an alternative to `application/json` request with only the query part sent as text. In the same way that we use `bodyParser.json` to parse `application/json` requests for apollo-server, we can use `bodyParser.text` plus one extra step in order to also parse `application/graphql` requests. Here's an example for express:

```js
import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress } from 'apollo-server-express';

const myGraphQLSchema = // ... define or import your schema here!

const helperMiddleware = [
    bodyParser.json(),
    bodyParser.text({ type: 'application/graphql' }),
    (req, res, next) => {
        if (req.is('application/graphql')) {
            req.body = { query: req.body };
        }
        next();
    }
];

express()
    .use('/graphql', ...helperMiddleware, graphqlExpress({ schema: myGraphQLSchema }))
    .listen(3000);
```

## Apollo Server Development

If you want to develop Apollo Server locally you must follow the following instructions:

* Fork this repository

* Install the Apollo Server project in your computer

```
git clone https://github.com/[your-user]/apollo-server
cd apollo-server
npm install
cd packages/apollo-server-<variant>/
npm link
```

* Install your local Apollo Server in other App

```
cd ~/myApp
npm link apollo-server-<variant>
```
