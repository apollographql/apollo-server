---
title: ApolloServer
description: All of the things you need with no config needed!
---

## Overview

Apollo Server provides an easy way for a brand new application to get up and running quickly by providing an integrated web-server with minimal configuration.

> Running a dedicated GraphQL server is a great choice for many deployments, however, if you're looking to add Apollo Server functionality to an **existing webserver**, follow the [Middleware](./middleware.html) installation instructions instead.

## Prerequisites

* You have designed type definitions. ([Type definitions]())
* You have _resolvers_ for your type definitions. ([Resolvers]())

If you don't meet or don't understand all of these prerequisites, we recommend you start at the [Getting Started]() page for a more complete example.  Alternatively, visit the links to the right of the prerequisites above to find out more information.

## Installation

There are two packages which must be installed for Apollo Server to function:

* [`apollo-server`](//npm.im/apollo-server): The actual Apollo Server package.
* [`graphql`](//npm.im/graphql): The supporting GraphQL JavaScript library which is a peer dependency of `apollo-server` and shared amongst the various GraphQL-related components in your project.  We won't use this package directly, but a single copy of it must be installed in the application.

To install, run:

    npm install --save apollo-server graphql

### Importing

Start by importing the `ApolloServer` class:

```js
const { ApolloServer } = require('apollo-server');
```

### Import your type definitions

For this example, we'll import type definitions and resolvers from a file called `schema` which lives alongside the main server code.

```js
// Make sure you've created this file and defined type
// defintions along with their resolvers!
const { typeDefs, resolvers } = require('./schema');
```

### Instantiating

Now, using the `ApolloServer` class, pass in the type definitions (`typeDefs`) and resolvers (`resolvers`), which were imported in the previous section, to the `ApolloServer` constructor:

```js
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
```

> See the [API Reference]() for additional options which can be passed to the `ApolloServer` constructor and instructions for creating the options based on the incoming request.

### Listening for requests

Finally, when you're ready to start accepting connections, call the `listen` method on the instance of `ApolloServer` which was created in the previous step:

```js
server.listen({ port: 3000 });
```

> If the `port` is omitted, port 4000 will be used.  For additional options available on the `listen` method, see the [API reference]().

## Next steps

Once you have a GraphQL server up and running, there are a number of configurable options worth considering.  Some great resources for additional information are:

* [API documentation]()
* [Schema design]()
* [Schema directives]()
* [Deploying]()