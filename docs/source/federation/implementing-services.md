---
title: Implementing services
---

This article describes how to create an **implementing service** for a federated data graph using Apollo Server.

## Defining an implementing service

> To be part of a federated graph, an implementing service must conform to the [Apollo Federation specification](/federation/federation-spec/), which exposes the service's capabilities to the gateway, as well as to tools like Apollo Graph Manager.

Converting an existing schema into an implementing service is the first step in building a federated graph. To start, here's a *non-federated* Apollo Server setup:

```javascript:title=index.js
const { ApolloServer, gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    me: User
  }

  type User {
    id: ID!
    username: String
  }
`;

const resolvers = {
  Query: {
    me() {
      return { id: "1", username: "@ava" }
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen(4001).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
```

This should look familiar if you've [set up Apollo Server](/getting-started/) before. If it doesn't, we recommend you familiarize yourself with the basics before jumping into federation.

Now, let's convert this to an implementing service. The first step is to install the `@apollo/federation` package in our project:

```shell
npm install @apollo/federation
```

### Defining an entity

As part of our federated architecture, we want _other_ implementing services to be able to extend the `User` type this service defines. To enable this, we add the `@key` directive to the `User` type's definition to designate it as an **entity**:

```js:title=index.js
const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

const typeDefs = gql`
  type Query {
    me: User
  }

  type User @key(fields: "id") {
    id: ID!
    username: String
  }
`;
```

The `@key` directive tells other services which field(s) of the `User` type to use
to uniquely identify a particular instance. In this case, services should use the
single field `id`.

Next, we add a **reference resolver** for the `User` type. A reference resolver tells the gateway how to fetch an entity by its `@key` fields:

```js:title=index.js
const resolvers = {
  Query: {
    me() {
      return { id: "1", username: "@ava" }
    }
  },
  User: {
    __resolveReference(user, { fetchUserById }){
      return fetchUserById(user.id)
    }
  }
};
```

We would then define the `fetchUserById` function to obtain the appropriate `User`
from our backing data store.

> [Learn more about entities](./entities/)

### Generating a federated schema

Finally, we use the `buildFederatedSchema` function from the `@apollo/federation` package to augment our schema definition with federation support. We provide the result of this function to the `ApolloServer` constructor:

```js:title=index.js
const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

server.listen(4001).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
```

The server is now ready to act as an implementing service in a federated data graph!

### Full example

Here are the snippets above combined (again, note that for this sample to be complete,
 you must define the `fetchUserById` function for your data source):

```js:title=index.js
const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

const typeDefs = gql`
  type Query {
    me: User
  }

  type User @key(fields: "id") {
    id: ID!
    username: String
  }
`;

const resolvers = {
  Query: {
    me() {
      return { id: "1", username: "@ava" }
    }
  },
  User: {
    __resolveReference(user, { fetchUserById }){
      return fetchUserById(user.id)
    }
  }
}

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

server.listen(4001).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
```
