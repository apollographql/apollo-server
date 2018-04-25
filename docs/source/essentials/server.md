---
title: Running a server
---

## Overview

> Estimated time: About 8 minutes.

Apollo Server provides an easy way for new, or existing, applications to get running quickly.  Existing applications can take advantage of middleware and new applications can utilize an integrated web-server.  Both of these servers can be configured with minimal configuration and follow industry best-practices.

## Prerequisites

* The basic steps to creating a GraphQL schema, including the concept of "types". ([Building a schema](./schema.html));

> If you don't understand these prerequisites, we recommend starting at the [Getting Started](../getting-started.html) page for a simplified example.  Alternatively, visit the links to the right of the prerequisites above for more information.

## Installation

We need to install two packages for Apollo Server:

* [`apollo-server`](//npm.im/apollo-server): The Apollo Server package, which provides most of the functionality.
* [`graphql`](//npm.im/graphql): A GraphQL support library, provided by Facebook.  While we won't use it explicitly in these examples, it is required component and shared amongst all GraphQL libraries in the project.

To install, run:

    npm install --save apollo-server graphql

## Importing

Depending on whether we are creating a new application or an existing application, the method of importing `apollo-server` will vary slightly since Apollo Server must adapt to the semantics of existing servers (e.g. Express, Hapi, etc.)

Both import methods will use the `apollo-server` module we installed in the previous step and import an `ApolloServer` class.  But existing applications will specify the desired middleware as a path-specific import (e.g. `apollo-server/<variant>`).

In the below examples, we'll import two things from `apollo-server`:

* The `ApolloServer` class, which we'll use to instantiate and start the server.
* The `gql` template literal tag, used for writing GraphQL within JavaScript code.

These imports will be explained in the next sections.
### New applications

For new applications, it's not necessary to use a middleware variant and Apollo Server comes ready to run.  In this case, we'll **add this line** to the top of an application's main entry-point then skip ahead to "Import type definitions" below:

```js
const { ApolloServer, gql } = require('apollo-server');
```

### Existing applications (Middleware)

Existing applications generally already have existing middleware in place and Apollo Server works with those existing middleware options.  But in order to play along, we need to import the `ApolloServer which corresponds to the type of server which is already in use.

For example, if the application is already using an Express server, it is important to use the `apollo-server/express` import.

It will also be necessary to have access to the existing "app" in order to add the additional Apollo Server middleware.  In many applications (especially Express) this is usually called `app`.

#### Express

```js
const { ApolloServer, gql } = require('apollo-server/express')
```

#### Koa

```js
const { ApolloServer, gql } = require('apollo-server/koa')
```

#### Other (AWS Lambda, Azure Functions)

Apollo Server works great in so-called "serverless" environments such as Amazon Lambda and Microsoft Azure Functions.  These implementations have some extra considerations which won't be covered in this guide, but more information is provided in [Server-less]().

## Import type definitions

Before we can use the `ApolloServer` we've imported above, we'll need create an empty starting point for type definitions.  We'll also create an empty "resolver map", but we won't discuss it further until the next page of this guide.

Add the following code to the same file you added the `apollo-server` import above:

```js
// This is a string of the SDL.
const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: String
  }
`;

// We'll fill these in on the next page!
const resolvers = {};
```

## Instantiating

Using the `ApolloServer` class, we'll instantiate a server by passing the type definitions (`typeDefs`) and our empty resolvers (`resolvers`) map.

For existing applications, we'll also pass the existing application into the constructor as `app`.  New applications should not pass `app`.

```js
const server = new ApolloServer({
  app, // Only pass this for existing applications!
  typeDefs,
  resolvers,
});
```

> See the [API Reference](../api/apollo-server.html) for additional options which can be passed to the `ApolloServer` constructor.

### Listening for requests

At this point, we're ready to start accepting connections to the server.  This is done by calling the `listen` method on the instance of `ApolloServer` which was created in the previous step:

```js
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

> By default, Apollo Server listens on port 4000.  See the [API reference](../api/apollo-server.html) for additional `listen` options, including how to configure the port.

### Run the application

With the above configuration complete, we can now start the Node application, with Apollo Server, for the first time.  This varies, but assuming a standard `index.js` configuration, might be as simple as `node index.js`.

After you start the server it should print a message to the console indicating that it's ready:

```shell
$ node index.js
🚀 Server ready at http://localhost:4000/graphiql
```

At this point, if the message isn't printed to the console, it's possible that something went wrong.  Double-check the previous steps in this guide, and try comparing the configuration to our [pre-configured example on Glitch]().

## Explore

To explore the newly created GraphQL server, open a browser to the link shown in the console, http://localhost:4000/graphiql.

Next, type in following query and then press the "▶️" button:

```graphql
query {
  hello
}
```

And the server should return a simple response:

```json
{
  "data": {
    "hello": null
  }
}
```

## Next steps

Now that the GraphQL server is running, it's time to start exploring how we'll fetch data for our types.  We'll get started on that in the [next step](./data.html).
