---
title: Schema Design
description: The best way to fetch data, update it, and keep things running for a long time
---

GraphQL schemas are at their best when they are designed around the need of client applications, instead of the shape of how the data is stored. Often times teams will create schemas that are literal mappings on top of their collections or tables with CRUD like root fields. While this may be a fast way to get up and running, a strong long term GraphQL schema is built around the products usage.

## Style conventions

The GraphQL specification is flexible in the style that it dictates and doesn't impose specific naming guidelines.  In order to facilitate development and continuity across GraphQL deployments, we suggest the following style conventions :

- **Fields**: are recommended to be written in `camelCase`, since the majority of consumers will be client applications written in JavaScript.
- **Types**: should be `PascalCase`.
- **Enums**: should have their name in `PascalCase` and their values in `ALL_CAPS` to denote their special meaning.

## Using interfaces

Interfaces are a powerful way to build and use GraphQL schemas through the use of _abstract types_.  Abstract types can't be used directly in schema, but can be used as building blocks for creating explicit types.

Consider an example where different types of books share a common set of attributes, such as _text books_ and _coloring books_.  A simple foundation for these books might be represented as the following `interface`:

```graphql
interface Book {
  title: String
  author: Author
}
```

We won't be able to directly use this interface to query for a book, but we can use it to implement concrete types.  Imagine a screen within an application which needs to display a feed of all books, without regard to their (more specific) type.  To create such functionality, we could define the following:

```graphql
type TextBook implements Book {
  title: String
  author: Author
  classes: [Class]
}

type ColoringBook implements Book {
  title: String
  author: Author
  colors: [Color]
}

type Query {
  schoolBooks: [Book]
}
```

In this example, we've used the `Book` interface as the foundation for the  `TextBook` and `ColoringBook` types.  Then, a `schoolBooks` field simply expresses that it returns a list of books (i.e. `[Book]`).

Implementing the book feed example is now simplified since we've removed the need to worry about what kind of `Book`s will be returned.  A query against this schema, which could return _text books_ and _coloring_ books, might look like:

```graphql
query GetBooks {
  schoolBooks {
    title
    author
  }
}
```

This is really helpful for feeds of common content, user role systems, and more!

Furthermore, if we need to return fields which are only provided by either `TextBook`s or `ColoringBook`s (not both) we can request fragments from the abstract types in the query.  Those fragments will be filled in only as appropriate; in the case of the example, only coloring books will be returned with `colors`, and only text books will have `classes`:

```graphql
query GetBooks {
  schoolBooks {
    title
    ... on TextBook {
      classes {
        name
      }
    }
    ... on ColoringBook {
      colors {
        name
      }
    }
  }
}
```

To see an interface in practice, check out this [example]()

## A `Node` interface

A so-called "`Node` interface" is an implementation of a generic interface, on which other types can be built on, which enables the ability to fetch other _types_ in a schema by only providing an `id`.  This interface isn't provided automatically by GraphQL (not does it _have_ to be called `Node`), but we highly recommend schemas consider implementing one.

To understand its value, we'll present an example with two collections: _authors_ and _posts_, though the usefulness of such an interface grows as more collections are introduced.  As is common with most database collections, each of these collections have unique `id` columns which uniquely represent the individual documents within the collection.

To implement a so-called "`Node` interface", we'll add a `Node` interface to the schema, as follows:

```graphql
interface Node {
  id: ID!
}
```

This `interface` declaration has the only field it will ever need: an `ID!` field, which is required to be non-null in all operations (as indicated by the `!`).

To take advantage of this new interface, we can use as the underlying implementation for the other types that our schema will define.  For our example, this means we'll use it to build `Post` and `Author` object types:

```graphql
type Post implements Node {
  id: ID!
  title: String!
  author: Author!
}

type Author implements Node {
  id: ID!
  name: String!
  posts: [Post]
}
```

By implementing the `Node` interface as the foundation for `Post` and `Author`, we know that anytime a client has obtained an `id` (from either type), we can send it back to the server and retrieve that exact piece of data back!

<h3 id="global-ids">Global Ids</h3>

When using the `Node` interface, we will want to create schema unique `id` fields. The most common way to do this is to take the `id` from the datasource and join it with the type name where it is being exposed (i.e `Post:1`, `Author:1`). In doing so, even though the database `id` is the same for the first Post and first Author, the client can refetch each sucessfully!

Global Ids are often encoded into a base64 string after joined together. This is for consistency but also to denote that the client shouldn't try to parse and use the information as the shape of the `id` may change over time with schema revisions, but the uniqueness of it will not.

<h3 id"using-node">Using the node interface</h3>

Now that we have the `Node` interface, we need a way to globally refetch any id that the client can send. To do this, we add a field called `node` to our `Query` which returns a `Node` abstract type:

```graphql
type Query {
  node(id: ID!): Node
}
```

Now our client can refetch any type they want to as long as they have an `id` value for it:


```graphql
query GetAuthor($authorId: ID!) {
  node(id: $authorId) {
    id
    ... on Author {
      name
      posts {
        id
        title
      }
    }
  }
}
```

Using the `Node` interface can remove a ton of uneccessary fields on the `Query` type, as well as solve common patterns like data fetching for routing. Say we had a route showing content our user has liked: `/favorites` and then we wanted to drill down into those likes: `/favorites/:id` to show more information. Instead of creating a route for each kind of liked content (i.e `/favories/authors/:id`, `/favorites/posts/:id`), we can use the `node` field to request any type of liked content:

```graphql
query GetLikedContent($id: ID!){
  favorite: node(id: $id){
    id
    ... on Author {
      pageTitle: name
    }
    ... on Post {
      pageTitle: title
    }
  }
}
```

Thanks to the `Node` interface and field aliasing, my response data is easily used by my UI no matter what my likes are:

```json
[
  { id: "Author:1", pageTitle: "Sashko" },
  { id: "Post:1", pageTitle: "GraphQL is great!" }
]
```

To see this in practice, check out the following [example]()

## Mutation responses

Mutations are an incredibly powerful part of GraphQL as they can easily return both information about the data updating transaction, as well as the actual data that has changed very easily. One pattern that we recommend to make this consistent is to have a `MutationResponse` interface that can be easily implemented for any `Mutation` fields. The `MutationResponse` is designed to allow transactional information alongside returning valuable data to make client side updates automatic! The interface looks like this:

```graphql
interface MutationResponse {
  code: String!
  success: Boolean!
  message: String!
}
```

An implementing type would look like this:

```graphql
type AddPostMutationResponse {
  code: String!
  success: Boolean!
  message: String!
  post: Post
}
```

Lets break this down by field:

- **code** is a string representing a transactional value explaning details about the status of the data change. Think of this like HTTP status codes.
- **success** is a boolean telling the client if the update was successful. It is a coarse check that makes it easy for the client application to respond to failures
- **message** is a string that is meant to be a human readable description of the status of the transaction. It is intended to be used in the UI of the product
- **post** is added by the implementing type `AddPostMutationResponse` to return back the newly created post for the client to use!

Following this pattern for mutations provides detailed information about the data that has changed and how the operation to change it went! Client developers can easily react to failures and fetch the information they need to update their local cache.

<h2 id="organization">Organizing your schema</h2>

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

<h3 id="extend-types">Extending types</h3>

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

<h3 id="share-types">Sharing types</h3>

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


