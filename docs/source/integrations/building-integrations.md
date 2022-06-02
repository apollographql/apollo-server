---
title: Building Integrations for Apollo Server
description: ""
---

One of the driving forces behind Apollo Server 4 is the creation of a stable, well-defined API for processing HTTP requests and responses. Apollo Server 4's API enables external collaborators (like you) to build integrations with Apollo Server in their web framework of choice.

The primary responsibility of an Apollo Server integration is to translate requests and responses between a web framework's native format to the format that `ApolloServer` uses.

## General integration patterns

<!-- TODO: fix link to point to main once version-4 is merged  -->
> See the [`expressMiddleware` function](https://github.com/apollographql/apollo-server/blob/36482f5eb56a0421c1eb47e3ebf0e60e033573ab/packages/server/src/express/index.ts) for an example of integrating [Express](https://github.com/expressjs/express) with Apollo Server.

Your integration should accept an `ApolloServer` instance _after_ that instance has called the `server.start()` method:

```ts
// Create a new instance of ApolloServer
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// The async start method instructs Apollo Server to
// prepare to handle incoming operations.
await server.start();
```

> Serverless integrations will accept an `ApolloServer` instance _before_ its called any start-related functions. For more details, see [New approach to serverless frameworks](#new-approach-to-serverless-frameworks).

You can pass the "started" `ApolloServer` instance into your framework-specific middleware. With your framework-specific middleware set up, you can then start your chosen framework's server:

```ts
// 1. Create our ApolloServer instance and start it
const server = new ApolloServer({
  typeDefs,
  resolvers,
});
await server.start();

// 2. Create our framework specific server
const app = express();

// 3. Set up our middleware for our framework specific server.
app.use(cors(), bodyParser.json(), expressMiddleware(server));

// 4. Start the framework specific server
app.listen({ port: 4000 }, () => {
  console.log(`🚀 Server ready at http://localhost:4000`);
});
```

Note that your integration is responsible for setting up [body-parser](https://www.npmjs.com/package/body-parser) and [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS) configuration.

