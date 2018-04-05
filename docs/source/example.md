---
title: Quick start
description: Copy and paste this code to have a GraphQL server running in 30 seconds.
---

Here's a complete example that sets up a GraphQL server with `apollo-server-express`. First, make sure to install the necessary modules:

```sh
npm install apollo-server-express graphql
```

Then, write this code in a file called index.js with the following contents:

```js
const { ApolloServer } = require('apollo-server-express');

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

// The GraphQL schema
const typeDefs = `
  type Query { books: [Book] }
  type Book { title: String, author: String }
`;

// The resolvers to load data
const resolvers = {
  Query: { books: () => books },
};

// build the server
const server = new ApolloServer({ typeDefs, resolvers });

// run the server!
server.listen(({ url }) =>
  console.log(`Go to ${url}/graphiql to run some queries!`),
);
```

Now you can start up your brand new Apollo Server by running this command:

```sh
node index.js
```

This is a simple example but it shows the power of Apollo Server already. Instead of writing middleware, managing the request and response, setting up routing, and handling errors, you can focus on what your data looks like and how to load it.
