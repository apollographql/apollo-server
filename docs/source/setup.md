---
title: Adding a GraphQL endpoint
description: How to add a GraphQL endpoint to your server.
---

Apollo Server has a slightly different API depending on which server integration you are using, but all of the packages share the same core implementation and options format.

<h2 id="graphqlOptions">Apollo Server options</h2>

Apollo Server accepts a `GraphQLOptions` object as its single argument. The `GraphQLOptions` object has the following properties:

```js
// options object
const GraphQLOptions = {
  schema: GraphQLSchema,

  // rootValue passed to GraphQL execution
  rootValue?: any,

  // the context passed to GraphQL execution
  context?: any,

  // Formatting function applied to all errors before response is sent
  formatError?: Function,

  // a function called for logging events such as execution times
  logFunction?: Function,
  // a function applied to the parameters of every invocation of runQuery
  formatParams?: Function,

  // * - (optional) validationRules: extra validation rules applied to requests
  validationRules?: Array<ValidationRule>,

  // a function applied to each graphQL execution result
  formatResponse?: Function

  // a custom default field resolver
  fieldResolver?: Function

  // a boolean that will print additional debug logging if execution errors occur
  debug?: boolean
}
```

<h3 id="options-function">Passing options as a function</h3>

Alternatively, Apollo Server can accept a function which takes the request as input and returns a GraphQLOptions object or a promise that resolves to one:

```js
// example options function (for express)
graphqlExpress(request => ({
  schema: typeDefinitionArray,
  context: { user: request.session.user }
}))
```

This is useful if you need to attach objects to your context on a per-request basis, for example to initialize user data, caching tools like `dataloader`, or set up some API keys.

<h2 id="importingESModules">Importing ES6 Modules</h2>

Currently, the ES6 Module import syntax used in these examples is not implemented in Nodejs 6.x,7.x, and earlier versions.  To use these examples, you will need to configure an external tool like [Babel](https://babeljs.io/) that will transpile the import statements into standard require statements.  For example, `import express from 'express';` would become  `var express = require('express');`.  If you don't want to use an external transpiler, you can manually convert the imports to requires using the example format.

<h2 id="graphqlExpress">Using with Express</h2>

The following code snippet shows how to use Apollo Server with Express:

```js
import express from 'express';
import bodyParser from 'body-parser';
import { graphqlExpress } from 'apollo-server-express';

const PORT = 3000;

var app = express();

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: myGraphQLSchema }));

app.listen(PORT);
```

<h2 id="graphqlConnect">Using with Connect</h2>

Connect is so similar to Express that the integration is in the same package. The following code snippet shows how to use Apollo Server with Connect:

```js
import connect from 'connect';
import bodyParser from 'body-parser';
import { graphqlConnect } from 'apollo-server-express';
import http from 'http';

const PORT = 3000;

var app = connect();

app.use('/graphql', bodyParser.json());
app.use('/graphql', graphqlConnect({ schema: myGraphQLSchema }));

http.createServer(app).listen(PORT);
```

The arguments passed to `graphqlConnect` are the same as those passed to `graphqlExpress`.

<h2 id="graphqlHapi">Using with Hapi</h2>

The following code snippet shows how to use Apollo Server with Hapi:

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
    graphqlOptions: { schema: myGraphQLSchema },
  },
});
```

`graphqlOptions` can also be a callback or a promise:

```js
server.register({
  register: graphqlHapi,
  options: {
    path: '/graphql',
    graphqlOptions: (request) => {
      return { schema: myGraphQLSchema };
    },
  },
});
```

<h2 id="graphqlKoa">Using with Koa 2</h2>

The following code snippet shows how to use Apollo Server with Koa:

```js
import koa from 'koa';
import koaRouter from 'koa-router';
import koaBody from 'koa-bodyparser';
import { graphqlKoa } from 'apollo-server-koa';

const app = new koa();
const router = new koaRouter();
const PORT = 3000;

app.use(koaBody());

router.post('/graphql', graphqlKoa({ schema: myGraphQLSchema }));
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT);
```

`graphqlOptions` can also be a callback that returns a GraphQLOptions or returns a promise that resolves to GraphQLOptions. This function takes a koa 2 `ctx` as its input.

```js
router.post('/graphql', graphqlKoa((ctx) => {
  return {
    schema: myGraphQLSchema,
    context: { userId: ctx.cookies.get('userId') }
  };
}));
```
