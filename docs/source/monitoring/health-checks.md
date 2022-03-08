---
title: Health checks
description: Determining the health status of your server
---

Load balancers often use health checks to determine if a server is available and ready to serve traffic.

## GraphQL-level health checks

The easiest way to determine if your GraphQL server is healthy is to run a GraphQL operation!

Every GraphQL server supports a trivial query that requests the [`__typename`](https://www.apollographql.com/docs/apollo-server/schema/schema/#the-__typename-field) of the top-level `Query` type.  This means every GraphQL server can respond to a `GET` request with a URL like:

```
https://your.server/graphql?query=%7B__typename%7D
```

Note that this health check will run an actual GraphQL operation. If your server requires special headers or cookies to run any query, you'll need to provide those in your request.
## Adding HTTP-level health checks

If you'd like to check if your HTTP server is successfully serving, you can choose to add an HTTP-level health check. If you are using an [integration with Apollo Server](http://localhost:8000/integrations/middleware/) you can create your own health check handler by defining [framework-specific middleware function](../api/apollo-server/#framework-specific-middleware-function) that returns 200 to the URL path of your choice.

Note that that the [`ApolloStandAlone` package](LINKHERE) doesn't provide you with direct access to your HTTP server, we instead recommend running a GraphQL-level health check to ensure your GraphQL server is working properly.

<!-- ## HTTP-level health checks

Apollo Server also supports a simple HTTP-level health check. This is enabled by default and is served at the URL path `/.well-known/apollo/server-health`. This returns the 200 status code if the HTTP server is successfully serving. It does not invoke any of the GraphQL execution machinery. This means it may be better for your needs if your server's [context function](../data/resolvers/#the-context-argument) requires you to be logged in, but it may be worse for your needs if you want your health check to test that your server's context function runs successfully. -->

<!-- ### In the batteries-included `apollo-server` package

The batteries-included `apollo-server` package doesn't provide you with direct access to your HTTP server, so we provide a few knobs to let you adjust the HTTP-level health check.

You can pass a string `healthCheckPath` to the `ApolloServer` constructor to change the URL where the health check is served. You can also pass `healthCheckPath: null` to disable the health check.

If you'd like the health check to do more than just "always return success", you can pass an async function `onHealthCheck` function to the `ApolloServer` constructor. If defined, this `onHealthCheck` async function should return if the server is deemed _ready_ or `throw` if there is an error. Returning (resolving the `Promise`) will result in an HTTP status code of 200, which is generally desired by most health-check tooling (e.g. Kubernetes, AWS, etc.), while `throw`ing (rejecting the `Promise`) will result in an HTTP status code of 503.

```js{10-17}
import { ApolloServer, gql } from 'apollo-server';

// Undefined for brevity.
const typeDefs = gql``;
const resolvers = {};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async onHealthCheck() {
    if (everythingLooksHealthy()) {
      return;
    } else {
      throw new Error('...');
    }
  },
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(
    `Try your health check at: ${url}.well-known/apollo/server-health`,
  );
});
```

Note that the `healthCheckPath` and `onHealthCheck`  options are *only* accepted by the batteries-include `apollo-server` constructor, not by other framework integration packages.

### In framework integration packages

Like `apollo-server`, framework integration packages like `apollo-server-express` and `apollo-server-lambda` also serve a health check at the URL path `/.well-known/apollo/server-health` by default. Customizing this health check is done in the [framework-specific middleware function](../api/apollo-server/#framework-specific-middleware-function) such as `applyMiddleware` or `createHandler` rather than in the `ApolloServer` constructor.

To disable serving the health check endpoint, pass `disableHealthCheck: true` to the framework-specific middleware function.

These packages also support an `onHealthCheck` function like `apollo-server`; this function is passed to the framework-specific middleware function rather than to the `ApolloServer` constructor. If you're using `apollo-server-azure-functions` (which doesn't provide a general way to customize its HTTP serving behavior), this option may be helpful. For other integrations such as `apollo-server-express`, we don't recommend that you customize the health check via Apollo. Since you're already setting up your web framework, if you need to customize the behavior of the health check then it is probably more straightforward to simple define a health check handler yourself directly in your web framework (and pass `disableHealthCheck: true` to disable Apollo Server's health check). A future major version of Apollo Server may change the health check feature to be specific to the "batteries-included" `apollo-server` package rather than part of all framework integration packages. For similar reasons, you can't customize the health check path in framework integration packages; just disable the built-in health check and add your own at your preferred path. -->
