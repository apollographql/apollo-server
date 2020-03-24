---
title: Quick start
description: Copy and paste this code to have a GraphQL server running in 30 seconds.
---

Here's a complete example that sets up a GraphQL server with `apollo-server-express` and `graphql-tools`. First, make sure to install the necessary modules:

```sh
npm install --save apollo-server-express@2.11.0 express
```

Then, run this code:

```js
const express = require('express');
const {  ApolloServer, gql} = require('apollo-server-express');

// Some fake data
const books = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];

// The GraphQL schema in string form
const typeDefs = gql`
  type Query { books: [Book] }
  type Book { title: String, author: String }
`;

// The resolvers
const resolvers = {
  Query: { books: () => books },
};

// Put together a schema
const server = new ApolloServer({ typeDefs, resolvers });

// Initialize the app
const app = express();

// Add express to the middleware server 
server.applyMiddleware({ app });

// Start the server
app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
```

To understand the example, read the docs about Apollo Server here, and also learn how to make a GraphQL schema in the [graphql-tools docs](https://www.apollographql.com/docs/graphql-tools/).
