---
title: GraphiQL
description: How to set up GraphiQL with Apollo Server
---

Apollo Server allows you to easily use [GraphiQL](https://github.com/graphql/graphiql). Here's how:

<h2 id="graphiqlOptions">Configuring GraphiQL</h2>

`graphiql<Express/Connect/Hapi/Koa>` accepts the following options object:

```js
const options = {
  endpointURL: String, // URL for the GraphQL POST endpoint this instance of GraphiQL serves
  query?: String, // optional query to pre-populate the GraphiQL UI with
  operationName?: String, // optional operationName to pre-populate the GraphiQL UI with
  variables?: Object, // optional variables to pre-populate the GraphiQL UI with
  result?: Object, // optional result to pre-populate the GraphiQL UI with
  passHeader?: String, // a string that will be added to the outgoing request header object (e.g "'Authorization': 'Bearer lorem ipsum'")
  editorTheme?: String, // optional CodeMirror theme to be applied to the GraphiQL UI
}
```

Apollo Server's `graphiql` middleware does not run any query passed to it, it simply renders it in the UI.
To actually execute the query, the user must submit it via the GraphiQL UI, which will
send the request to the GraphQL endpoint specified with `endpointURL`.

<h2 id="graphiqlExpress">Using with Express</h2>

If you are using Express, GraphiQL can be configured as follows:

```js
import { graphiqlExpress } from 'apollo-server-express';

app.use('/graphiql', graphiqlExpress({
  endpointURL: '/graphql',
}));
```


<h2 id="graphiqlConnect">Using with Connect</h2>

If you are using Connect, GraphiQL can be configured as follows:

```js
import { graphiqlConnect } from 'apollo-server-express';

app.use('/graphiql', graphiqlConnect({
  endpointURL: '/graphql',
}));
```


<h2 id="graphiqlHapi">Using with Hapi</h2>

If you are using Hapi, GraphiQL can be configured as follows:

```js
import { graphiqlHapi } from 'apollo-server-hapi';

server.register({
  register: graphiqlHapi,
  options: {
    path: '/graphiql',
    graphiqlOptions: {
      endpointURL: '/graphql',
    },
  },
});
```


<h2 id="graphiqlKoa">Using with Koa 2</h2>

If you are using Koa 2, GraphiQL can be configured as follows:

```js
import { graphiqlKoa } from 'apollo-server-koa';

router.get('/graphiql', graphiqlKoa({ endpointURL: '/graphql' }));
```
