---
title: Azure Functions
description: Setting up Apollo Server with Azure Functions
---

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core) [![Build Status](https://travis-ci.org/apollographql/apollo-server.svg?branch=master)](https://travis-ci.org/apollographql/apollo-server) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://www.apollographql.com/#slack)

This is the Azure Functions integration for the Apollo community GraphQL Server. [Read the docs.](https://www.apollographql.com/docs/apollo-server/)


## Example:

```js
const server = require("apollo-server-azure-functions");
const graphqlTools = require("graphql-tools");

const typeDefs = `
  type Random {
    id: Int!
    rand: String
  }

  type Query {
    rands: [Random]
    rand(id: Int!): Random
  }
`;

const rands = [{ id: 1, rand: "random" }, { id: 2, rand: "modnar" }];

const resolvers = {
  Query: {
    rands: () => rands,
    rand: (_, { id }) => rands.find(rand => rand.id === id)
  }
};

const schema = graphqlTools.makeExecutableSchema({
  typeDefs,
  resolvers
});

module.exports = function run(context, request) {
  if (request.method === "POST") {
    server.graphqlAzureFunctions({
        endpointURL: '/api/graphql'
    })(context, request);
  } else if (request.method === "GET") {
    return server.graphiqlAzureFunctions({
        endpointURL: '/api/graphql'
    })(context, request);
  }
};
```
