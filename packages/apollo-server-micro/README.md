---
title: Micro
description: Setting up Apollo Server with Micro
---

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core) [![Build Status](https://travis-ci.org/apollographql/apollo-server.svg?branch=master)](https://travis-ci.org/apollographql/apollo-server) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://www.apollographql.com/#slack)

This is the [Micro](https://github.com/zeit/micro) integration for the Apollo community GraphQL Server. [Read the docs.](https://www.apollographql.com/docs/apollo-server/)

```sh
npm install apollo-server-micro
```

## Example

```js
import { microGraphiql, microGraphql } from 'apollo-server-micro';
import micro, { send } from 'micro';
import { get, post, router } from 'microrouter';
import schema from './schema';

const graphqlHandler = microGraphql({ schema });
const graphiqlHandler = microGraphiql({ endpointURL: '/graphql' });

const server = micro(
  router(
    get('/graphql', graphqlHandler),
    post('/graphql', graphqlHandler),
    get('/graphiql', graphiqlHandler),
    (req, res) => send(res, 404, 'not found')
  )
);

server.listen(3000);
```
