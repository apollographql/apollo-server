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

```js lines=2-4
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

```js lines=3-7
const POST_ADDED = 'POST_ADDED';

const postResolver = {
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

export default postResolver;
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

<h2 id="middleware">Subscriptions with Additional Middleware</h2>

With an existing HTTP server (created with `createServer`), we can easily add subscriptions.
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

httpServer.listen(PORT, () => console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`))
```
