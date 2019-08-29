---
title: Get started with Apollo Server
---

> Estimated time: About 10 minutes.

This guide walks you through the installation and configuration of Apollo Server.

You will:

* Obtain a basic understanding of GraphQL principles
* Define a GraphQL **schema** that represents the structure of your data set
* Run an instance of Apollo Server that lets you execute queries against your schema

This guide assumes that you are familiar with the command line and
JavaScript, and that you have a recent version of Node.js (8+) installed.

## Step 1: Create a new project

1. From your preferred development directory, create a directory for a new project
and `cd` into it:

    ```bash
    mkdir graphql-server-example
    cd graphql-server-example
    ```

2. Initialize a new Node.js project with `npm` (or another package manager you
prefer, such as Yarn):

    ```bash
    npm init --yes
    ```

Your project directory now contains a `package.json` file.

## Step 2: Install dependencies

Applications that run Apollo Server require two top-level dependencies:

* [`apollo-server`](https://npm.im/apollo-server) is the core library for Apollo Server itself, which helps you define the shape of your data and how to fetch it.
* [`graphql`](https://npm.im/graphql) is the library used to build a GraphQL schema and execute queries against it.

Run the following command to install both of these dependencies and save them in 
your project's `node_modules` directory:

```bash
npm install apollo-server graphql
```

Also create an empty `index.js` file in your project's root directory:

```bash
touch index.js
```

 To keep things 
simple, `index.js` will contain **all** of the code for this example application.

## Step 3: Define your GraphQL schema

Every GraphQL server (including Apollo Server) uses a **schema** 
to define the structure of data that clients can query. 
In this example, we'll create a server for querying a collection
of books by title and author.

Open `index.js` in your preferred editor and paste the following into it:

```js:title=index.js
const { ApolloServer, gql } = require('apollo-server');

// A schema is a collection of type definitions (hence "typeDefs") 
// that together define the "shape" of queries that are executed against 
// your data.
const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }
`;
```

This snippet defines a simple, valid GraphQL schema. Clients will be able to execute
a query named `books`, and our server will return an array of zero or more `Book`s.

## Step 4: Define your data set

Now that we've defined the _structure_ of our data, we can define the data itself.
Apollo Server can fetch data from any source you connect to (including
a database, a REST API, a static object storage service, or even another GraphQL 
server). For the purposes of this tutorial, we'll just hardcode some example data.

Add the following to the bottom of `index.js`:

```js:title=index.js
const books = [
  {
    title: 'Harry Potter and the Chamber of Secrets',
    author: 'J.K. Rowling',
  },
  {
    title: 'Jurassic Park',
    author: 'Michael Crichton',
  },
];
```

This snippet defines a simple data set that clients can query. Notice that the two
objects in the array each match the structure of the `Book` type we defined in our schema.

## Step 5: Define a resolver

We've defined our data set, but Apollo Server doesn't know that it should
 _use_ that data set when it's executing a query. To fix this, we create a 
 **resolver**.

Resolvers tell Apollo Server _how_ to fetch the data associated with a particular
type. Because our `Book` array is hardcoded, the corresponding resolver is
straightforward.

Add the following to the bottom of `index.js`:

```js:title=index.js
// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    books: () => books,
  },
};
```

## Step 6: Create an instance of `ApolloServer`

We've defined our schema, data set, and resolver. Now we just need to provide
this information to Apollo Server when we initialize it.

Add the following to the bottom of `index.js`:

```js:title=index.js
// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
```

## Step 7: Start the server

We're ready to start our server! Run the following from your project's root
directory:

```bash
node index.js
```

You should see the following output:

```
🚀 Server ready at http://localhost:4000/
```

We're up and running!

## Step 8: Execute your first query

We can now execute GraphQL queries on our server. To execute our first query,
we'll use a tool called **GraphQL Playground**.

With your server still running, visit `http://localhost:4000` in your browser
to open GraphQL Playground. (Apollo Server hosts GraphQL Playground automatically 
when you run it in development.)

![GraphQL Playground](./images/getting-started/graphql-playground.png)

The GraphQL Playground UI includes:

* A text area (to the left) for writing queries
* A Play button (the triangle button in the middle) for executing queries
* A text area (to the right) for viewing query results
* Views for schema inspection and generated documentation (via tabs on the right side)

Our server supports a single query named `books`. Let's execute it! 

Here's a GraphQL **query string** for executing the `books` query:

```
{
  books {
    title
    author
  }
}
```

Paste this string into the left text area and click the Play button. The 
results (from our hardcoded data set) appear on the right:

![The response from our server shows title and author!](./images/getting-started/graphql-playground-response.png)

One of the most important concepts of GraphQL is that clients can choose to query 
_only for the fields they need_. Delete `author` from the query string and execute
it again. The response updates to include only the `title` field for each book! 

## Server integrations

Depending on whether we are creating a new application or an existing application, the steps will vary slightly since Apollo Server must adapt to the semantics of existing servers (e.g. Express, Hapi, etc.)

### Middleware

Existing applications generally already have middleware in place and Apollo Server works along with those middleware. To integrate with Apollo Server, we'll pass it into the `server.applyMiddleware` method as `app` to add the Apollo Server's middleware.

> The existing application is frequently already named `app`, especially when using Express.  If the application is identified by a different variable, pass the existing variable in place of `app`.

The following code uses the `apollo-server-express` package, which can be installed with `npm install apollo-server-express`.

```js
const { ApolloServer, gql } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
  // These will be defined for both new or existing servers
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app }); // app is from an existing express app

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
)
```

Hapi follows the same pattern with `apollo-server-express` replaced with `apollo-server-hapi` and `app` replaced with Hapi server. `applyMiddleware` registers plugins, so it should be called with `await`.

> When transitioning from `apollo-server` to an integration package, running `npm uninstall apollo-server` will remove the extra dependency.

### SSL/TLS Support

If you require an HTTPS connection to your Apollo Server, you can use the `https` module with `apollo-server-express`. Subscriptions can also go through an encrypted WebSocket (WSS).

Here is an example of using HTTPS in production and HTTP in development, with subscriptions:

```javascript
import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import typeDefs from './graphql/schema'
import resolvers from './graphql/resolvers'
import fs from 'fs'
import https from 'https'
import http from 'http'

const configurations = {
  // Note: You may need sudo to run on port 443
  production: { ssl: true, port: 443, hostname: 'example.com' },
  development: { ssl: false, port: 4000, hostname: 'localhost' }
}

const environment = process.env.NODE_ENV || 'production'
const config = configurations[environment]

const apollo = new ApolloServer({ typeDefs, resolvers })

const app = express()
apollo.applyMiddleware({ app })

// Create the HTTPS or HTTP server, per configuration
var server
if (config.ssl) {
  // Assumes certificates are in .ssl folder from package root. Make sure the files
  // are secured.
  server = https.createServer(
    {
      key: fs.readFileSync(`./ssl/${environment}/server.key`),
      cert: fs.readFileSync(`./ssl/${environment}/server.crt`)
    },
    app
  )
} else {
  server = http.createServer(app)
}

server.listen({ port: config.port }, () =>
  console.log(
    '🚀 Server ready at',
    `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.graphqlPath}`
  )
)
```

## Next steps

This example application is a great starting point for working with
Apollo Server. Check out the following resources to learn more about the basics
of schemas, resolvers, and deployment:

* [Schema basics](/schema/schema/)
* [Fetching data with resolvers](/serving/data/)
* [Deploying with Heroku](/deployment/heroku)
