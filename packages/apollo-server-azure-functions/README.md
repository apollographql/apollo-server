---
title: Azure Functions
description: Setting up Apollo Server with Azure Functions
---

[![npm version](https://badge.fury.io/js/apollo-server-core.svg)](https://badge.fury.io/js/apollo-server-core) [![Build Status](https://travis-ci.org/apollographql/apollo-server.svg?branch=master)](https://travis-ci.org/apollographql/apollo-server) [![Coverage Status](https://coveralls.io/repos/github/apollographql/apollo-server/badge.svg?branch=master)](https://coveralls.io/github/apollographql/apollo-server?branch=master) [![Get on Slack](https://img.shields.io/badge/slack-join-orange.svg)](https://www.apollographql.com/#slack)

This is the Azure Functions integration for the Apollo community GraphQL Server. [Read the docs.](https://www.apollographql.com/docs/apollo-server/)

## Sample Code

### GraphQL:

```javascript
const { graphqlAzureFunctions } = require('apollo-server-azure-functions');
const { makeExecutableSchema } = require('graphql-tools');

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

const rands = [{ id: 1, rand: 'random' }, { id: 2, rand: 'modnar' }];

const resolvers = {
  Query: {
    rands: () => rands,
    rand: (_, { id }) => rands.find(rand => rand.id === id),
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

module.exports = function run(context, request) {
  graphqlAzureFunctions({ schema })(context, request);
};
```

### GraphiQL

```javascript
const { graphiqlAzureFunctions } = require('apollo-server-azure-functions');

export function run(context, request) {
  let query = `
    {
      rands {
        id
        rand
      }
    }
  `;

  // End point points to the path to the GraphQL API function
  graphiqlAzureFunctions({ endpointURL: '/api/graphql', query })(
    context,
    request,
  );
}
```
