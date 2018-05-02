---
title: Building a server
---

> Estimated time: About 8 minutes.

Apollo Server provides an easy way for new, or existing, applications to get running quickly.  Existing applications can take advantage of middleware and new applications can utilize an integrated web-server.  Both of these servers can be configured with minimal configuration and follow industry best-practices.

<h2 id="installation">Installation</h2>

We need to install two packages to use Apollo Server:

* [`apollo-server`](//npm.im/apollo-server): The Apollo Server package, which provides most of the functionality.
* [`graphql`](//npm.im/graphql): A support library, provided by Facebook.  It won't be explicitly used in these examples, but is a required module and shared amongst all GraphQL libraries in the project.

To install, run:

    npm install --save apollo-server graphql

<h2 id="creating">Creating a server</h2>

The fastest way to get started with GraphQL is by creating a new server. Apollo Server will set an Express server up for you as long as you provide it with `typeDefs`, which is a string representing your GraphQL schema, and `resolvers`, which is a map of functions that implement your schema.

In the following examples, we'll import two things from `apollo-server`:

* The `ApolloServer` class, which we'll use to instantiate and start the server.
* The `gql` template literal tag, used for writing GraphQL within JavaScript code.

```js
const { ApolloServer, gql } = require('apollo-server');

// Your GraphQL schema
const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: String
  }
`;

// Your resolver map
const resolvers = {
  Query: {
    hello: () => 'world'
  }
};

const server = new ApolloServer({
  // Both of these properties are required to create an Apollo Server
  typeDefs,
  resolvers,
});
```

> See the [API Reference](../api/apollo-server.html) for additional options which can be passed to the `ApolloServer` constructor.

<h2 id="starting">Starting a server</h2>

At this point, we're ready to start accepting connections to the server.  This is done by calling the `listen` method on the instance of `ApolloServer` which was created in the previous step:

```js
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

> By default, Apollo Server listens on port 4000.  See the [API reference](../api/apollo-server.html) for additional `listen` options, including how to configure the port.

<h3 id="running">Running the server</h3>

With the above configuration complete, we can now start the Node application, with Apollo Server, for the first time.  This varies, but assuming a standard `index.js` configuration, might be as simple as `node index.js`.

After you start the server it should print a message to the console indicating that it's ready:

```shell
$ node index.js
🚀 Server ready at http://localhost:4000/
```

At this point, if the message isn't printed to the console, it's possible that something went wrong.  Double-check the previous steps in this guide, and try comparing the configuration to our [pre-configured example on Glitch]().

<h3 id="running">GraphQL Playground</h3>

To explore the newly created GraphQL server, open a browser to the link shown in the console, http://localhost:4000/graphql. Apollo Server sets up GraphQL Playground for you so that you can start running queries and exploring schemas quickly.

To run a query, copy the following query and then press the "▶️" button:

```graphql
query {
  hello
}
```

And the server should return a simple response:

```json
{
  "data": {
    "hello": "world"
  }
}
```

Your server itself is hosted at http://localhost:4000/graphql. This would be the endpoint you pass to set up Apollo Client.

<h2 id="integrations">Server integrations</h2>

Depending on whether we are creating a new application or an existing application, the method of importing `apollo-server` will vary slightly since Apollo Server must adapt to the semantics of existing servers (e.g. Express, Hapi, etc.)

Both import methods will use the `apollo-server` module we installed in the previous step, but existing applications will append the desired middleware as a path-based import (e.g. `apollo-server/<variant>`, where `<variant>` would be `express`, `koa`, etc.).

<h3 id="middleware">Middleware</h3>

Existing applications generally already have middleware in place and Apollo Server works with those middleware options.  To integrate Apollo Server with our existing server, we need to import the `ApolloServer` which corresponds to the type of server which is already in use.

For example, if the application is already using an Express server, it is important to use the `apollo-server/express` import.

It will also be necessary to access the instance of the existing "app" to add the new Apollo Server middleware.  Be sure to add this new import where your existing application is available.

For existing applications, we'll also pass the existing application into the constructor as `app`.  New applications should not pass `app`.

> The existing application is frequently already named `app`, especially when using Express.  If the application is identified by a different variable, pass the existing app in as `app`.

```js
const { ApolloServer, gql } = require('apollo-server/express');
const { typeDefs, resolvers } = require('./schema');

const server = new ApolloServer({
  // Important: Only set `app` for existing applications!
  app: app,

  // These will be defined for both new or existing servers
  typeDefs,
  resolvers,
});
```

When adding Apollo Server to an existing server, it's necessary to indicate where to activate the middleware relative to other middlewares already in the app.  To do this, add the following line along with your other middleware, preferably before any of the others:

```js
server.applyMiddleware();
```

<h3 id="serverless">Serverless</h3>

Apollo Server works great in "serverless" environments such as Amazon Lambda and Microsoft Azure Functions.  These implementations have some extra considerations which won't be covered in this guide.

## Next steps

Now that the GraphQL server is running, it's time to dive deeper into how we'll fetch data for our types.  We'll get started on that in the [next step](./data.html).
