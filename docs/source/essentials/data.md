---
title: Fetching data with resolvers
---

GraphQL is the best way to work with data from **any** back-end that your product needs. It is not a mapping of your database, but rather a graph of the data sources and shapes your product is made of. Resolvers are the key to this graph. Each resolver represents a single field, and can be used to fetch data from any source(s) you may have.

Resolvers provide the instructions for turning a GraphQL operation into data. Resolvers are organized into a one to one mapping to the fields in a GraphQL schema. This section describes resolvers' organization, every field's default resolver, and their signature.

<h2 id="resolver-map">Resolver map</h2>

In order to respond to queries, a schema needs to have resolve functions for all fields. This collection of functions is called the "resolver map". This map relates the schema fields and types to a function.

```js

const { gql } = require('apollo-server');
const { find, filter } = require('lodash');

const schema = gql`
  type Book {
    title: String
    author: Author
  }

  type Author {
    books: [Book]
  }

  type Query {
    author: Author
  }
`;

const resolvers = {
  Query: {
    author(parent, args, context, info) {
      return find(authors, { id: args.id });
    },
  },
  Author: {
    books(author) {
      return filter(books, { author: author.name });
    },
  },
};
```

With the resolver map above, the query, `{ author { books } }`, will call the `Query.author` resolver first and pass its result to `Author.books`. The query result will contain the return value of `Author.books` nested under `data.author.books`.

Note that you don't have to put all of your resolvers in one object. Refer to the ["modularizing the schema"](/docs/graphql-tools/generate-schema.html#modularizing) section to learn how to combine multiple resolver maps into one.

<h2 id="type-signature">Resolver type signature</h2>

In addition to the parent resolvers' value, resolvers receive a couple more arguments. The full resolver function signature contains four positional arguments: `(parent, args, context, info)` and can return an object or [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises). Once a promise resolves, then the children resolvers will continue executing. This is useful for fetching data from a backend.

The resolver parameters generally follow this naming convention and are described in detail:

1. `parent`: The object that contains the result returned from the resolver on the parent field, or, in the case of a top-level `Query` field, the `rootValue` passed from the [server configuration](./server.html). This argument enables the nested nature of GraphQL queries.
2. `args`: An object with the arguments passed into the field in the query. For example, if the field was called with `query{ key(arg: "you meant") }`, the `args` object would be: `{ "arg": "you meant" }`.
3. `context`: This is an object shared by all resolvers in a particular query, and is used to contain per-request state, including authentication information, dataloader instances, and anything else that should be taken into account when resolving the query. Read [this section](#context) for an explanation of when and how to use context.
4. `info`: This argument contains information about the execution state of the query, including the field name, path to the field from the root, and more. It's only documented in the [GraphQL.js source code](https://github.com/graphql/graphql-js/blob/c82ff68f52722c20f10da69c9e50a030a1f218ae/src/type/definition.js#L489-L500), but is extended with additional functionality by other modules, like [`apollo-cache-control`](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-cache-control).

In addition to returning GraphQL defined [scalars](./schema.html#scalar), you can return [custom scalars](../features/scalars-enums.html) for special use cases, such as JSON or big integers.

<h3 id="result">Resolver results</h3>

Resolvers in GraphQL can return different kinds of results which are treated differently:

1. `null` or `undefined` - this indicates the object could not be found. If your schema says that field is _nullable_, then the result will have a `null` value at that position. If the field is `non-null`, the result will "bubble up" to the nearest nullable field and that result will be set to `null`. This is to ensure that the API consumer never gets a `null` value when they were expecting a result.
2. An array - this is only valid if the schema indicates that the result of a field should be a list. The sub-selection of the query will run once for every item in this array.
3. A promise - resolvers often do asynchronous actions like fetching from a database or backend API, so they can return promises. This can be combined with arrays, so a resolver can return a promise that resolves to an array, or an array of promises, and both are handled correctly.
4. A scalar or object value - a resolver can also return any other kind of value, which doesn't have any special meaning but is simply passed down into any nested resolvers, as described in the next section.

<h3 id="parent">Parent argument</h3>

The first argument to every resolver, `parent`, can be a bit confusing at first, but it makes sense when you consider what a GraphQL query looks like:

```graphql
query {
  getAuthor(id: 5){
    name
    posts {
      title
      author {
        name # this will be the same as the name above
      }
    }
  }
}
```

Every GraphQL query is a tree of function calls in the server. So the `parent` contains the result of parent resolver, in this case:

1. `parent` in `Query.getAuthor` will be whatever the server configuration passed for `rootValue`.
2. `parent` in `Author.name` and `Author.posts` will be the result from `getAuthor`, likely an Author object from the backend.
3. `parent` in `Post.title` and `Post.author` will be one item from the `posts` result array.
4. `parent` in `Author.name` is the result from the above `Post.author` call.

Every resolver function is called according to the nesting of the query. To understand this transition from query to resolvers from another perspective, read this [blog post](https://blog.apollographql.com/graphql-explained-5844742f195e#.fq5jjdw7t).

<h3 id="context">Context argument</h3>

The context is how you access your shared connections and fetchers in resolvers to get data.

The `context` is the third argument passed to every resolver. It is useful for passing things that any resolver may need, like [authentication scope](https://blog.apollographql.com/authorization-in-graphql-452b1c402a9), database connections, and custom fetch functions. Additionally, if you're using [dataloaders to batch requests](../features/data-sources#what-about-dataloader)  across resolvers, you can attach them to the `context` as well.

As a best practice, `context` should be the same for all resolvers, no matter the particular query or mutation, and resolvers should never modify it. This ensures consistency across resolvers, and helps increase development velocity.

To provide a `context` to your resolvers, add a `context` object to the Apollo Server constructor. This constructor gets called with every request, so you can set the context based off the details of the request (like HTTP headers).

```
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    authScope: getScope(req.headers.authorization)
  })
}));

// resolver
(parent, _, context) => {
  if(context.authScope !== ADMIN) throw AuthenticationError('not admin');
  ...
}
```

The context can also be created asynchronously, allowing database connections and other operations to complete.

```
context: async () => ({
  db: await client.connect(),
})

// resolver
(parent, _, context) => {
  return context.db.query('SELECT * FROM table_name');
}
```

<h2 id="default">Default resolvers</h2>

Explicit resolvers are not needed for every type, since Apollo Server provides a [default](https://github.com/graphql/graphql-js/blob/69d90c601ad5a6f49c06b4ebbc8c73d51ef03566/src/execution/execute.js#L1264-L1278) that can perform two actions depending on the contents of `parent`:

1. Return the property from `parent` with the relevant field name
2. Calls a function on `parent` with the relevant field name and provide the remaining resolver parameters as arguments

For the following schema, the `title` field of `Book` would not need a resolver if the result of the `books` resolver provided a list of objects that already contained a `title` field.

```graphql
type Book {
  title: String
}

type Author {
  books: [Book]
}
```

<h2 id="modularizing-resolvers">Modularizing resolvers</h2>

We can accomplish the same modularity with resolvers by passing around multiple resolver objects and combining them together with Lodash's `merge` or other equivalent:

```js
// comment.js
const resolvers = {
  Comment: { ... }
}

export resolvers;
```

```js
// post.js
const { merge } = require('lodash');

const Comment = require('./comment');
const resolvers = merge({
  Post: { ... }
}, Comment.resolvers);

export resolvers;
```

```js
// schema.js
const { merge } = require('lodash');
const Post = require('./post.js');

// Merge all of the resolver objects together
const resolvers = merge({
  Query: { ... }
}, Post.resolvers);

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

<h2 id="querying">Sending queries</h2>

Once your resolver map is complete, it's time to start testing out your queries in GraphQL Playground.

<h3 id="operation">Naming operations</h3>

When sending the queries and mutations in the above examples, we've used either `query { ... }` or `mutation { ... }` respectively.  While this is fine, and particularly convenient when running queries by hand, it makes sense to name the operation in order to quickly identify operations during debugging or to aggregate similar operations together for application performance metrics, for example, when using [Apollo Engine](https://engine.apollographql.com/) to monitor an API.

Operations can be named by placing an identifier after the `query` or `mutation` keyword, as we've done with `HomeBookListing` here:

```graphql
query HomeBookListing {
  getBooks {
    title
  }
}
```

<h3 id="variables">Queries with variables</h3>

In the examples above, we've used static strings as values for both queries and mutations.  This is a great shortcut when running "one-off" operations, but GraphQL also provides the ability to pass variables as arguments and avoid the need for clients to dynamically manipulate operations at run-time.

By defining a map of variables on the root `query` or `mutation` operation, which are sent from the client, variables can be used (and re-used) within the types and fields themselves.

For example, with a slight change to the mutation we used in the previous step, we enable the client to pass `title` and `author` variables alongside the operation itself.  We can also provide defaults for those variables for when they aren't explicitly set:

```graphql
mutation HomeQuickAddBook($title: String, $author: String = "Anonymous") {
  addBook(title: $title, author: $author) {
    title
  }
}
```

GraphQL clients, like [Apollo Client](https://www.apollographql.com/docs/react/), take care of sending the variables to the server separate from the operation itself:

```json
{
  "query": "...",
  "variables": { "title": "Green Eggs and Ham", "author": "Dr. Seuss" }
}
```

This functionality is also supported by tools like GraphQL Playground.
