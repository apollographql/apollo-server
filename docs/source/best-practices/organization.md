---
title: Organizing your code
description: Scaling your Apollo Server from a single file to your entire team
---

The GraphQL schema defines the api for Apollo Server, providing the single source of truth between client and server. A complete schema contains type definitions and resolvers. Type definitions are written and documented in the [Schema Definition Language(SDL)]() to define the valid server entry points. Corresponding to one to one with type definition fields, resolvers are functions that retrieve the data described by the type definitions.

To accommodate this tight coupling, type definitions and resolvers should be kept together in the same file. This collocation allows developers to modify fields and resolvers with atomic schema changes without unexpected consequences. At the end to build a complete schema, the type definitions are combined in an array and resolvers are merged together. Throughout all the examples, the resolvers delegate to a data model, as explained in [this section]().

> Note: This schema separation should be done by product or real-world domain, which create natural boundaries that are easier to reason about.

## Prerequisites

* essentials/schema for connection between:
  * GraphQL Types
  * Resolvers

<h2 id="organizing-types">Organizing schema types</h2>

With large schema, defining types in different files and merge them to create the complete schema may become necessary. We accomplish this by importing and exporting schema strings, combining them into arrays as necessary. The following example demonstrates separating the type definitions of [this schema](#first-example-schema) found at the end of the page.

```js
// comment.js
const typeDefs = gql`
  type Comment {
    id: ID!
    message: String
    author: String
  }
`;

export typeDefs;
```

The `Post` includes a reference to `Comment`, which is added to the array of type definitions and exported:

```js
// post.js
const typeDefs = `
  type Post {
    id: ID!
    title: String
    content: String
    author: String
    comments: [Comment]
  }
`;

// Export Post and all dependent types
export typeDefs;
```

Finally the root Query type, which uses Post, is created and passed to the server instantiation:

```js
// schema.js
const Comment = require('./comment');
const Post = require('./post');

const RootQuery = `
  type Query {
    post(id: ID!): Post
  }
`;

const server = new ApolloServer({
  typeDefs: [RootQuery, Post.typeDefs, Comment.typeDefs],
  resolvers, //defined in next section
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

<h2 id="organizing-resolvers">Organizing resolvers</h2>

For the type definitions above, we can accomplish the same modularity with resolvers by combining each type's resolvers together with Lodash's `merge` or another equivalent. The [end of this page](#first-example-resolvers) contains a complete view of the resolver map.

```js
// comment.js
const CommentModel = require('./models/comment');

const resolvers = {
  Comment: {
    votes: (parent) => CommentModel.getVotesById(parent.id)
  }
};

export resolvers;
```

The `Post` type:

```js
// post.js
const PostModel = jequire('./models/post');

const resolvers = {
  Post: {
    comments: (parent) => PostModel.getCommentsById(parent.id)
  }
};

export resolvers;
```

Finally, the Query type's resolvers are merged and the result is passed to the server instantiation:

```js
// schema.js
const { merge } = require('lodash');
const Post = require('./post');
const Comment = require('./comment');

const PostModel = require('./models/post');

// Merge all of the resolver objects together
const resolvers = merge({
  Query: {
    post: (_, args) => PostModel.getPostById(args.id)
  }
}, Post.resolvers, Comment.resolvers);

const server = new ApolloServer({
  typeDefs, //defined in previous section
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

<h2 id="extend-types">Extending types</h2>

The `extend` keyword provides the ability to add fields to existing types. Using `extend` is particularly useful in avoiding a large list of fields on root Queries and Mutations.

```js
//schema.js
const bookTypeDefs = `
extend type Query {
  books: [Bar]
}

type Book {
  id: ID!
}
`;

// These type definitions are often in a separate file
const authorTypeDefs = `
extend type Query {
  authors: [Author]
}

type Author {
  id: ID
}
`;
export const typeDefs = [bookTypeDefs, authorTypeDefs]
```

```js
const {typeDefs, resolvers} = require('./schema');

const rootQuery = `
"Query can and must be defined once per schema to be extended"
type Query {
  _empty: String
}`;

const server = new ApolloServer({
  typeDefs: [RootQuery].concat(typeDefs),
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

> Note: In the current version of GraphQL, you can’t have an empty type even if you intend to extend it later. So we need to make sure the Query type has at least one field — in this case we can add a fake `_empty` field. Hopefully in future versions it will be possible to have an empty type to be extended later.

<h2 id="descriptions">Documenting a Schema</h2>

In addition to modularization, documentation within the SDL enables the schema to be effective as the single source of truth between client and server. Graphql gui's have built-in support for displaying docstrings with markdown syntax, such as those found in the following schema.

```graphql
"""
Description for the type
"""
type MyObjectType {
  """
  Description for field
  Supports multi-line description
  """
  myField: String!

  otherField(
    """
    Description for argument
    """
    arg: Int
  )
}
```

<h2 id="api">API</h2>

Apollo Server pass `typeDefs` and `resolvers` to the `graphql-tools`'s `makeExecutableSchema`.

TODO point at graphql-tools `makeExecutableSchema` api

<h2 id="example-app">Example Application Details</h2>

<h3 id="example-schema">Schema</h3>

The full type definitions for the first example:

```graphql
type Comment {
  id: ID!
  message: String
  author: String
  votes: Int
}

type Post {
  id: ID!
  title: String
  content: String
  author: String
  comments: [Comment]
}

type Query {
  post(id: ID!): Post
}
```

<h3 id="example-resolvers">Resolvers</h3>

The full resolver map for the first example:

```js
const CommentModel = require('./models/comment');
const PostModel = require('./models/post');

const resolvers = {
  Comment: {
    votes: (parent) => CommentModel.getVotesById(parent.id)
  }
  Post: {
    comments: (parent) => PostModel.getCommentsById(parent.id)
  }
  Query: {
    post: (_, args) => PostModel.getPostById(args.id)
  }
}
```
