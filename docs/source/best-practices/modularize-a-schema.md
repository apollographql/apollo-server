---
title: Managing Large Schema
description: Scaling your Apollo Server from a single file to your entire team
---

## Prerequisites

* schemas/organization to understand basic split

## Overview

Most application are able collocate the server's type definitions and resolvers in a single file, which enables developers to make atomic modification to the schema. Sometime a large schema requires multiple files. To maintain developer experience, the following examples show how to effectively separate a schema into multiple files.

For schema with simple dependencies, combining type definitions directly in an array is sufficient. In more complicated situations with circular dependencies, type definitions can be returned as functions. Using functions allows Apollo Server to store a single copy of the duplicate type definitions to conserve memory and maintain performance. Throughout all the examples, the resolvers delegate to a data model, as explained in [this section]().

> Note: This schema separation should be done by product or real-world domain, which create natural boundaries that are easier to reason about.

<h2 id="organizing-types">Organizing schema types</h2>

When schemas get large, we can start to define types in different files and import them to create the complete schema. We accomplish this by importing and exporting schema strings, combining them into arrays as necessary. The following example demonstrates separating the type definitions of [the schema]() at the end of this page.

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
const Comment = require('./comment');

// concat allows the comment typeDefs to be a value or an array
const typeDefs = [`
  type Post {
    id: ID!
    title: String
    content: String
    author: String
    comments: [Comment]
  }
`].concat(Comment.typeDefs);

// Export Post and all dependent types
export typeDefs;
```

Finally the root Query type, which uses Post, is created and passed to the server instantiation:

```js
// schema.js
const Post = require('./post');

const RootQuery = `
  type Query {
    post(id: ID!): Post
  }
`;

const server = new ApolloServer({
  typeDefs: [RootQuery].concat(Post.typeDefs),
  resolvers, //defined in next section
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

<h2 id="organizing-resolvers">Organizing resolvers</h2>

For the type definitions above, we can accomplish the same modularity with resolvers by passing around multiple resolver objects and combining them together with Lodash's `merge` or other equivalent. The [end of this page]() contains a complete view of the resolver map.

```js
// comment.js
const CommentModel = require('./models/comment');

const resolvers = {
  Comment: {
    votes: (parent) => CommentModel.getVotesById(parent.id)
  }
}

export resolvers;
```

The post type contains a reference to `Comment`, so we must include the `Comment` resolvers:

```js
// post.js
const { merge } = require('lodash');
const Comment = require('./comment');
const PostModel = require('./models/post');

const resolvers = merge({
  Post: {
    comments: (parent) => PostModel.getCommentsById(parent.id)
  }
}, Comment.resolvers);

export resolvers;
```

Finally, the Query type's resolvers are merged and the result is passed to the server instantiation:

```js
// schema.js
const { merge } = require('lodash');
const Post = require('./post');

const PostModel = require('./models/post');

// Merge all of the resolver objects together
const resolvers = merge({
  Query: {
    post: (_, args) => PostModel.getPostById(args.id)
  }
}, Post.resolvers);

const server = new ApolloServer({
  typeDefs, //defined in previous section
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

<h3 id="sharing-modular-types">Sharing types across domains</h3>

Schemas often contain circular dependencies or a shared type that is referenced in separate files. When exporting type definitions, the result should be wrapped in a function. Apollo Server will only include each type definition once, even if it is imported multiple times by different types. Preventing duplication of type definitions means that domains can be self contained and fully functional regardless of how they are combined. Conversely, resolvers are safely combined with a `merge`, since they are namespaced by the schema types.

In this example, `Author` depends on `Book`.

```js
// author.js
const { merge } = require('lodash');
const Book = require('./book');

const Author = `
  type Author {
    id: ID!
    name: String
    books: [Book]
  }
`;

// export Author and all dependent types wrapped
// in a function to avoid string duplication
export const typeDefs = () => [Author].concat(Book.typeDefs);

export const resolvers = merge({
  Author: { ... }
}, Book.resolvers);
```

In turn, `Book` depends on `Author`.

```js
// book.js
const { merge } = require('lodash');
const Author = require('./author');

const Book = `
  type Book {
    title: String
    author: Author
  }
`;

export const typeDefs = () => [Book].concat(Author.typeDefs);

export const resolvers = merge({
  Book: { ... }
}, Author.resolvers);
```

Finally, the schema combines the Author type definitions and resolvers with the root Query.

```js
// schema.js
const { merge } = require('lodash');
const Author = require('./author');

const resolvers = merge({
  Query: { ... }
}, Author.resolvers);

const RootQuery = `
  type Query {
    author(id: ID!): Author
  }
`;

const server = new ApolloServer({
  typeDefs: [RootQuery].concat(Author.typeDefs),
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

Type definitions wrapped in functions can be combined with raw type definition strings.

<h2 id="extend-types">Extending types</h2>

The `extend` keyword provides the ability to add fields to existing types. Using `extend` is particularly useful in avoiding a large list of fields on root Queries and Mutations.

```js
const barTypeDefs = `
"Query can and must be defined once per schema to be extended"
type Query {
  bars: [Bar]
}

type Bar {
  id: String
}
`;

// These type definitions are often in a separate file
const fooTypeDefs = `
type Foo {
  id: String
}

extend type Query {
  foos: [Foo]
}
`

export const typeDefs = [barTypeDefs, fooTypeDefs]
```

<h2 id="api">API</h2>

Apollo Server pass `typeDefs` and `resolvers` to the `graphql-tools`'s

TODO point at graphql-tools `makeExecutableSchema` api

<h2 id="example-app">Example Application Details</h2>

<h3 id="example-schema">Schema</h3>

The application contains a schema, resolvers with fake data, and the Apollo Server start code.

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
