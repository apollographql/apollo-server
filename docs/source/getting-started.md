---
title: Quick start
description: Copy and paste this code to have a GraphQL server running in 30 seconds.
---

Here's a complete example that sets up a GraphQL server with `apollo-server-express`. First, make sure to install the necessary modules:

```sh
npm install apollo-server graphql
```

Then, write this code in a file called index.js with the following contents:

```js
const { ApolloServer } = require('apollo-server');

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

Apollo Server provides two easy ways to get up and running quickly. For GraphQL first apps, the batteries included server setup `ApolloServer` is the best way to get started. If you have a node app already, Apollo Server provides easy to use middleware to plug into your current app right away.

<h2 id="creating-server">Creating the server</h2>

<h2 id="adding-graphql">Adding GraphQL</h2>

<h2 id="making-sure-it-works">Running your first query</h2>
