---
title: Adding Subscriptions To Schema
---

Adding GraphQL subscriptions to your graphQL schema is simple. since since Subscription is just another GraphQL operation type like Query and Mutation.

To enable subscription you need to install 2 packages: graphql-subscriptions and subscriptions-transport-ws:

```
    npm install --save graphql-subscriptions subscriptions-transport-ws
```

When the installation is complete we need to make few changes to our existing schema, controller and server.
Our initial application was able to display the list of the posts and to add a new one:

Our schema was something like that:

```
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

Our resolver instead:
```js

const postResolver = {
    Query: {
        posts(root: any, args: any, context: any) {
            return postController.posts();
        }
    },
    Mutation: {
        addPost(root: any, args: any, context: any) {
            pubsub.publish(POST_ADDED, { postAdded: args });
            return postController.addPost(args);
        }
    }
};

export default postResolver;

```

To enable subscription we need to make a couple of small changes:

- In the schema:

```
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

We just added `type Subscription` to our existing schema

- In the resolver:
```js
const POST_ADDED = 'POST_ADDED';

const postResolver = {
    Subscription: {
        postAdded: {
            subscribe: () => pubsub.asyncIterator([POST_ADDED])
        }
    },
    Query: {
		posts(root: any, args: any, context: any) {
			return postController.posts();
		}
    },
    Mutation: {
        addPost(root: any, args: any, context: any) {
            pubsub.publish(POST_ADDED, { postAdded: args });
            return postController.addPost(args);
        }
    }
};

export default postResolver;
```
We changes a couple of things:
1. we added in the mutation `pubsub.publish`
2. we added the Subscription `postAdded`

In our server we don't need to make any big changes:
1. we need to export 
```js
export const pubsub = new PubSub();
```
2. In case you defined a context remember to exclude return in case you don't pass any header:

```js
const server = new ApolloServer({
	schema,
	context: async ({ req }: any) => {
		if (!req || !req.headers) {
      		return;
    	}
		const token = req.headers.authorization || "";
		....
		return checkToken;
	},
});
```

As you can see apollo server 2.0 make the life super easy and allow to have realtime data without change a lot in our existing code.
In case you've trouble to setup a full working example please have a look to this repro provided by [Daniele Zurico](https://github.com/daniele-zurico/apollo2-subscriptions-how-to)
