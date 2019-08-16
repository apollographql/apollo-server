---
title: Building a server
---

> Estimated time: About 8 minutes.

Apollo Server provides an easy way for new, or existing, applications to get running quickly.  Existing applications can take advantage of middleware and new applications can utilize an integrated web server. Both of these servers can be configured with minimal configuration and follow industry best practices.

## Installation

We need to install two packages to use Apollo Server, and a third package when using Apollo Server as middleware in an existing application:

* [`apollo-server`](https://npm.im/apollo-server): The Apollo Server package, which provides most of the functionality.
* [`graphql`](https://npm.im/graphql): A support library, provided by Facebook.  It won't be explicitly used in these examples, but is a required module and shared amongst all GraphQL libraries in the project.

To install, run:

    npm install apollo-server graphql

When adding Apollo Server to an existing application, a corresponding HTTP server support package needs to be installed as well.  For example, for Express this is:

    npm install apollo-server-express graphql


## Creating a server

The fastest way to get started with GraphQL is by creating a new server. Apollo Server will set an Express server up for you as long as you provide it with `typeDefs`, which is a string representing your GraphQL schema, and `resolvers`, which is a map of functions that implement your schema.

In the following examples, we'll import two things from `apollo-server`:

* The `ApolloServer` class, which we'll use to instantiate and start the server.
* The `gql` template literal tag, used for writing GraphQL within JavaScript code.

```js
const { ApolloServer, gql } = require('apollo-server');

// The GraphQL schema
const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => 'world'
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});
```

> See the [API Reference][] for additional options which can be passed to the `ApolloServer` constructor.

## Starting a server

At this point, we're ready to start accepting connections to the server.  This is done by calling the `listen` method on the instance of `ApolloServer` which was created in the previous step:

```js
server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

> By default, Apollo Server listens on port 4000.  See the [API reference][] for additional `listen` options, including how to configure the port.

[API reference]: /api/apollo-server/

### Running the server

With the above configuration complete, we can now start the Node application, with Apollo Server, for the first time.  This varies, but assuming a standard `index.js` configuration, might be as simple as `node index.js`.

After you start the server it should print a message to the console indicating that it's ready:

```shell
$ node index.js
🚀 Server ready at http://localhost:4000/
```

At this point, if the message isn't printed to the console, it's possible that something went wrong.  Double-check the previous steps in this guide, and try comparing the configuration to our [pre-configured example on Glitch](https://glitch.com/edit/#!/apollo-launchpad?path=server.js).

### GraphQL Playground

To explore the newly created GraphQL API, open a browser to the link shown in the console, `http://localhost:4000/`. Apollo Server sets up GraphQL Playground for you so that you can start running queries and exploring schemas quickly.

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

> GraphQL operations should _also_ be sent directly to `http://localhost:4000/` and Apollo Client should be configured with this endpoint.  Only `GET` requests from a web browser will result the GraphQL Playground interface being served.  Furthermore, by default, GraphQL Playground will only be enabled during development.

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

### Serverless

Apollo Server works great in "serverless" environments such as Amazon Lambda and Microsoft Azure Functions. See [deploying with AWS Lambda](/deployment/lambda/) and [deploying with Azure Functions](/deployment/azure-functions/) for more details.

### SSL/TLS Support

If you require an HTTPS connection to your Apollo Server, you can use the `https` module with `apollo-server-express`. Subscriptions can also go through an encrypted WebSocket (WSS)

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

// Add subscription support
apollo.installSubscriptionHandlers(server)

server.listen({ port: config.port }, () =>
  console.log(
    '🚀 Server ready at',
    `http${config.ssl ? 's' : ''}://${config.hostname}:${config.port}${apollo.graphqlPath}`
  )
)
```

## Next steps

Now that the GraphQL server is running, it's time to dive deeper into how we'll fetch data for our types.  We'll get started on that in the [next step](/essentials/data/).
