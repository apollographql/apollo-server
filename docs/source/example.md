---
title: End-to-end example
description: Copy and paste this code to have a GraphQL server running in 30 seconds.
---

Here's a complete example that sets up a GraphQL server with `apollo-server-express` and `graphql-tools`. First, make sure to install the necessary modules:

```sh
npm install --save apollo-server-express graphql-tools graphql express body-parser
```

Then, run this code:

```js
const express = require('express');
const bodyParser = require('body-parser');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');

// Some fake data
const books = [
  {
    title: "Harry Potter and the Sorcerer's stone",
    author: 'J.K. Rowling'
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton'
  }
];

// The GraphQL schema in string form
const typeDefs = `
  type Query { books: [Book] }
  type Book { title: String, author: String }
`;

// The resolvers
const resolvers = {
  Query: { books: () => books }
};

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Initialize the app
const app = express();

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema }));

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({ endpointURL: '/graphql' }));

// Start the server
app.listen(3000, () => {
  console.log('Go to http://localhost:3000/graphiql to run queries!');
});
```

To understand the example, read the docs about Apollo Server here, and also learn how to make a GraphQL schema in the [graphql-tools docs](https://www.apollographql.com/docs/graphql-tools/).
