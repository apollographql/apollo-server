---
title: Organization
description: Scaling your Apollo Server from a single file to your entire team
---

The schema contains the information to define all requests that the client can request from an instance of Apollo Server along with the resolvers necessary to route the requests to retrieve data. For most applications, the schema type definitions are be placed in a single file along side the resolvers. Placing reolvers in the same file as their accompanying type definitions is the best way to organize the code, since it enables developers to locate and modify the two inter-dependent portions.

Sometimes production servers contain a typeDefs string of over a thousand lines, which makes it difficult to maintain a file containing the resolvers as well. For applications with multiple teams or product domains, this section describes an example application and methods for organizing types and resolvers to make a large instance more modular. The separation between types should follow real-world domains, for example movies vs books, rather than the backend organization. To facilitate this organization, common practice is to create a data model layer that enables resolvers across domains to request data from a common interface. A data layer further enables the different schema domains to share data, such as a user profile.

Along with modularizing large schemas, GraphQL enables schemas to include documentation inline that is viewable in GraphQL Playground.

## Prerequisites

* Understanding of GraphQL types
* Resolvers

## Example Application

The application contains a schema, resolvers with fake data, and the Apollo Server start code.

### Types

When using `apollo-server`, the schema is defined as a string in the [GraphQL SDL]().

```js
const typeDefs = `
  type Author {
    id: Int!
    firstName: String
    lastName: String
    """
    the list of Posts by this author
    """
    posts: [Post]
  }

  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }

  # the schema allows the following query:
  type Query {
    posts: [Post]
    author(id: Int!): Author
  }

  # this schema allows the following mutation:
  type Mutation {
    upvotePost (
      postId: Int!
    ): Post
  }
`;
```

### Resolvers

In the same file as the type defintinos, the resolvers are organized as a nested object that maps type and field names to functions:

```js
const { find, filter } = require('lodash');

// example data
const authors = [
  { id: 1, firstName: 'Tom', lastName: 'Coleman' },
  { id: 2, firstName: 'Sashko', lastName: 'Stubailo' },
  { id: 3, firstName: 'Mikhail', lastName: 'Novikov' },
];

const posts = [
  { id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2 },
  { id: 2, authorId: 2, title: 'Welcome to Meteor', votes: 3 },
  { id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1 },
  { id: 4, authorId: 3, title: 'Launchpad is Cool', votes: 7 },
];

const resolvers = {
  Query: {
    posts: () => posts,
    author: (_, { id }) => find(authors, { id }),
  },

  Mutation: {
    upvotePost: (_, { postId }) => {
      const post = find(posts, { id: postId });
      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`);
      }
      post.votes += 1;
      return post;
    },
  },

  Author: {
    posts: author => filter(posts, { authorId: author.id }),
  },

  Post: {
    author: post => find(authors, { id: post.authorId }),
  },
};
```

### Server Instantiation

At the end, Apollo server accepts the schema and resolvers:

```js
const { ApolloServer, gql } = require('apollo-server');

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

For small to medium applications, collocating all type definition in one string and resolvers in one object is ideal, since central storage reduces complexity. Eventually for larger applications and teams, defining types and resolvers in separate files and combining them is ideal. The next section describes how Apollo Server enables this separation.

<h2 id="modularizing-types">Modularizing the schema types</h2>

When schemas get large, we can start to define types in different files and import them to create the complete schema. We accomplish this by importing and exporting schema strings, combining them into arrays as necessary.

```js
// comment.js
const typeDefs = gql`
  type Comment {
    id: Int!
    message: String
    author: String
  }
`;

export typeDefs;
```

```js
// post.js
const Comment = require('./comment');

const typeDefs = [`
  type Post {
    id: Int!
    title: String
    content: String
    author: String
    comments: [Comment]
  }
`].concat(Comment.typeDefs);

// we export Post and all types it depends on
// in order to make sure we don't forget to include
// a dependency
export typeDefs;
```

```js
// schema.js
const Post = require('./post.js');

const RootQuery = `
  type RootQuery {
    post(id: Int!): Post
  }
`;

const SchemaDefinition = `
  schema {
    query: RootQuery
  }
`;

const server = new ApolloServer({
  //we may destructure Post if supported by our Node version
  typeDefs: [SchemaDefinition, RootQuery].concat(Post.typeDefs),
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
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

<h3 id="sharing-modular-types">Sharing types across domains</h3>

Schemas often contain circular dependencies or a shared type that has been hoisted to be referenced in separate files. When exporting array of schema strings with circular dependencies, the array can be wrapped in a function. The Apollo Server will only include each type definition once, even if it is imported multiple times by different types. Preventing deduplication of type definitions means that domains can be self contained and fully functional regardless of how they are combined.

```js
// author.js
const Book = require('./book');

const Author = `
  type Author {
    id: Int!
    firstName: String
    lastName: String
    books: [Book]
  }
`;

// we export Author and all types it depends on
// in order to make sure we don't forget to include
// a dependency and we wrap it in a function
// to avoid strings deduplication
export const typeDefs = () => [Author].concat(Book.typeDefs);
```

```js
// book.js
const Author = require('./author');

const Book = `
  type Book {
    title: String
    author: Author
  }
`;

export const typeDefs = () => [Book].concat(Author.typeDefs);
```

```js
// schema.js
const Author = require('./author.js');

const RootQuery = `
  type RootQuery {
    author(id: Int!): Author
  }
`;

const SchemaDefinition = `
  schema {
    query: RootQuery
  }
`;

const server = new ApolloServer({
  //we may destructure Post if supported by our Node version
  typeDefs: [SchemaDefinition, RootQuery].concat(Author.typeDefs),
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

<h2 id="extend-types">Extending Types</h2>

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

const fooTypeDefs = `
type Foo {
  id: String
}

extend type Query {
  foos: [Foo]
}
`

const typeDefs = [barTypeDefs, fooTypeDefs]
```

<h2 id="descriptions">Documenting your Schema</h2>

GraphQL Playground has built-in support for displaying docstrings with markdown syntax. This schema includes docstrings for types, fields and arguments.

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

TODO point at graphql-tools `makeExecutableSchema` api
