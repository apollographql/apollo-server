---
title: uWebSockets.js
description: Setting up Apollo Server with uWebSockets.js
---

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core) [![Build Status](https://circleci.com/gh/apollographql/apollo-cache-control-js.svg?style=svg)](https://circleci.com/gh/apollographql/apollo-cache-control-js) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/apollo)


This is the [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js) integration for the Apollo community GraphQL Server. [Read the docs.](https://www.apollographql.com/docs/apollo-server/) [Read the CHANGELOG.](https://github.com/apollographql/apollo-server/blob/master/CHANGELOG.md)

## uWebSockets.js

This example demonstrates how to setup a simple microservice, using uWebSosckets.js, that
handles incoming GraphQL requests via the default `/graphql` endpoint.

1) Package installation.

```sh
npm install --save uNetworking/uWebSockets.js#v15.2.0 apollo-server-uwebsockets graphql
```

2) `index.js`

```js
const { App } = require('uWebSockets.js')
const { ApolloServer, makeExecutableSchema } = require('apollo-server-uwebsockets')

const schema = makeExecutableSchema({
  typeDefs: `
    type Query {
      foo: String!
    }
  `
})

const apollo = new ApolloServer({
  schema,
  introspection: true,
  mockEntireSchema: true,
})

const app = App({})

apollo.attachHandlers({ app })

app.listen(3000, (token) => {
  if (token) {
    console.log('Listening to port ' + 3000);
  } else {
    console.log('Failed to listen to port ' + 3000);
  }
});

```

3) `package.json`

```json
{
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}
```

4) After an `npm start`, access `http://localhost:3000/graphql` in your
browser to run queries using
[`graphql-playground`](https://github.com/prismagraphql/graphql-playground),
or send GraphQL requests directly to the same URL.

