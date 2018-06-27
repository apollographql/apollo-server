---
title: Subscriptions
subtitle: Adding subscriptions to Apollo Server
---

The native Apollo Server 2.0 supports GraphQL subscriptions without additional configuration.
Subscriptions are GraphQL operations that watch events emitted from Apollo Server.
All integration that allow http servers, such as express and hapi, contain the ability support GraphQL subscriptions.
As example we want to display a list of post that contains author and comment (Query) and we want to add a post to them (Mutation).

The following examples use a publish and subscribe primitive to generate the events that notify a subscription.

```js
const { PubSub } = require('apollo-server');

const pubsub = new PubSub();
```

To enable subscription we add them to our schema:

```js line=2-4
const typeDefs = gql`
type Subscription {
  postAdded: Post
}
type Query {
  posts: [Post]
}
type Mutation {
  addPost(author: String, comment: String): Post
}
type Post {
  author: String
  comment: String
}
`
```

Our resolver map:

```js line=4-8
const POST_ADDED = 'POST_ADDED';

const resolvers = {
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator([POST_ADDED]),
    },
  },
  Query: {
    posts(root: any, args: any, context: any) {
      return postController.posts();
    },
  },
  Mutation: {
    addPost(root: any, args: any, context: any) {
      pubsub.publish(POST_ADDED, { postAdded: args });
      return postController.addPost(args);
    },
  },
};
```

## Context with Subscriptions

The function to create a context for subscriptions includes `connection`, while the function for Queries and Mutations contains the arguments for the integration, in express's case `req` and `res`. This means that the context creation function needs to check the input. This is especially important, since the auth tokens are handled differently depending on the transport:

```js
const server = new ApolloServer({
  schema,
  context: async ({ req, connection }) => {
    if (connection) {
      // check connection for metadata
      return {};
    } else {
      // check from req
      const token = req.headers.authorization || "";

      return { token };
    }
  },
});
```

As you can see Apollo Server 2.0 allows realtime data without invasive changes to existing code.
For a full working example please have a look to [this repo](https://github.com/daniele-zurico/apollo2-subscriptions-how-to) provided by [Daniele Zurico](https://github.com/daniele-zurico/apollo2-subscriptions-how-to)

<h2 id="subscriptions-filters">Subscription Filters</h2>

Sometimes a client will want filter out specific events based on context and arguments.

To do so, we can use `withFilter` helper from this package, which wraps `AsyncIterator` with a filter function, and let you control each publication for each user.

Let's see an example - for the `commentAdded` server-side subscription, the client want to subscribe only to comments added to a specific repo:

```
subscription($repoName: String!){
  commentAdded(repoFullName: $repoName) {
    id
    content
  }
}
```

When using `withFilter`, provide a filter function, which executed with the payload (the published value), variables, context and operation info, and it must return boolean or Promise<boolean> indicating if the payload should pass to the subscriber.

Here is the following definition of the subscription resolver, with `withFilter` that will filter out all of the `commentAdded` events that are not the requested repository:

```js
const { withFilter } = require('apollo-server');

const rootResolver = {
    Query: () => { ... },
    Mutation: () => { ... },
    Subscription: {
        commentAdded: {
          subscribe: withFilter(() => pubsub.asyncIterator('commentAdded'), (payload, variables) => {
             return payload.commentAdded.repository_name === variables.repoFullName;
          }),
        }
    },
};
```

## Authentication Over WebSocket

The subscription lifecycle hooks to create an authenticated transport by using `onConnect` to validate the connection.

`SubscriptionsClient` supports `connectionParams` ([example available here](../react/advanced/subscriptions.html#authentication)) that will be sent with the first WebSocket message. All GraphQL subscriptions are delayed until the connection has been fully authenticated and your `onConnect` callback returns a truthy value.

`connectionParams` in the `onConnect` callback provide the ability to validate user credentials.
The GraphQL context can  also be extended with the authenticated user data.

```js
const { ApolloServer } = require('apollo-server');
const { resolvers, typeDefs } = require('./schema');

const validateToken = authToken => {
  // ... validate token and return a Promise, rejects in case of an error
};

const findUser = authToken => {
  return tokenValidationResult => {
    // ... finds user by auth token and return a Promise, rejects in case of an error
  };
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  subscriptions: {
    onConnect: (connectionParams, webSocket) => {
      if (connectionParams.authToken) {
        return validateToken(connectionParams.authToken)
          .then(findUser(connectionParams.authToken))
          .then(user => {
            return {
              currentUser: user,
            };
          });
      }

      throw new Error('Missing auth token!');
    },
  },
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});
```

The example above validates the user's token that is sent with the first initialization message on the transport, then it looks up the user and returns the user object as a Promise. The user object found will be available as `context.currentUser` in your GraphQL resolvers.

In case of an authentication error, the Promise will be rejected, and the client's connection will be rejected as well.

<h2 id="middleware">Subscriptions with Additional Middleware</h2>

With an existing HTTP server (created with `createServer`), we can add subscriptions using the `installSubscriptionHandlers`. Additionally, the subscription-capable integrations export `PubSub` and other subscription functionality.

For example: with an Express server already running on port 4000 that accepts GraphQL HTTP connections (POST) we can expose the subscriptions:

```js line=12
const http = require('http');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');

const PORT = 4000;
const app = express();
const server = new ApolloServer({ typeDefs, resolvers });

server.applyMiddleware({app})

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`)
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`)
})
```

## Lifecycle Events

`ApolloServer` exposes lifecycle hooks you can use to manage subscriptions and clients:

* `onConnect` - called upon client connection, with the `connectionParams` passed to `SubscriptionsClient` - you can return a Promise and reject the connection by throwing an exception. The resolved return value will be appended to the GraphQL `context` of your subscriptions.
* `onDisconnect` - called when the client disconnects.

```js
const server = new ApolloServer(
  subscriptions: {
    onConnect: (connectionParams, webSocket, context) => {
      // ...
    },
    onDisconnect: (webSocket, context) => {
      // ...
    },
  },
);
```
