---
title: Adding Subscriptions To Schema
---

Apollo Server 2.0 supports GraphQL subscriptions without additional configuration.
As example we want to display a list of post that contains author and comment (Query) and we want to add a post to them (Mutation).

Our schema will be:

```graphql
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
```

Our resolver:

```js
const postResolver = {
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

To enable subscription we need to apply just few changes:

- In our schema:

```graphql
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
type Subscription {
  postAdded: Post
}
```

We just added `type Subscription`,

- In the resolver:

```js
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

1.  we added in the mutation `pubsub.publish`
2.  we added the Subscription `postAdded`

In our server we don't need to make any big changes:

1.  we need to export

```js
export const pubsub = new PubSub();
```

2.  those using subscriptions include `connection` and `req` in their context creation function have checks depending on the input. This is especially important, since the auth tokens are handled differently depending on the transport:

```js
context: ({ connection }) => { ... }`
```

A good workaround to this problem is to return in case `req` or `req.headers` are not defined:

```js
const server = new ApolloServer({
  schema,
  context: async ({ req, connection }: any) => {
    if (connection) {
      // check your stuff as token etc
      return;
    } else {
      // check your stuff from req
      const token = req.headers.authorization || "";
      ....
      return checkToken;
    }
  },
});
```

As you can see Apollo Server 2.0 allows realtime data without invasive changes to existing code.
For a full working example please have a look to this repo provided by [Daniele Zurico](https://github.com/daniele-zurico/apollo2-subscriptions-how-to)

<h2 id="middleware">middleware</h2>
If you already have an existing HTTP server (created with `createServer`), you can easily add subscriptions.
For example: if you have an Express server already running on port 3000 and accepts GraphQL HTTP connections (POST) you can expose the subscriptions:

```js
const http = require('http');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');

const PORT = 3000;
const app = express();
const server = new ApolloServer({ typeDefs, resolvers });

server.applyMiddleware({app})

const httpServer = http.createServer(app);
server.createSubscriptionServer(httpServer);

httpServer.listen(PORT, () => console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`))
```

the only line we added in our existing code is:

```js
server.createSubscriptionServer(httpServer);
```
