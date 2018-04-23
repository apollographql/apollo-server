---
title: Schema Design
description: The best way to fetch data, update it, and keep things running for a long time
---

GraphQL schemas are at their best when they are designed around the need of client applications, instead of the shape of how the data is stored. Often times teams will create schemas that are literal mappings on top of their collections or tables with CRUD like root fields. While this may be a fast way to get up and running, a strong long term GraphQL schema is built around the products usage.

## Naming

One of the classic problems in computer science, how to name types and fields is a common question for teams getting started with GraphQL. While there is a ton of flexibility, by design, with the specification, here are a few recommendations that have proven themselves in production applications:

- **Fields** should be camelCase since the majority of consumers will be in client applications written in JavaScript
- **Types** should be PascalCase
- **Enums** should be PascalCase and their values should be `ALL_CAPS` to denote a special value

## Using interfaces

**Interfaces** are a powerful way to build and use GraphQL schemas. A GraphQL Interface is an abstract type (meaning it can't be used directly in the schema as an Object type) which describes required fields that implementing types must include. A simple example would look like this:

```graphql
interface Book {
  title: String
  author: Author
}
```

This interface describes what all books in our schema will look like. At this point, we can't actually query for a `Book`, but we can use the interface to create concrete types. For example, we may have a screen in our app that wants to display `TextBooks` and `ColoringBooks` no matter what they actually are. To create something like this, we can do something like this:

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

Since we return `Book` for the field `schoolBooks`, when writing a query we don't need to worry about what kind of `Book` we actually return. This is really helpful for feeds of common content, user role systems, and more! Here is what a query would look like for the above schema:

```graphql
query GetBooks {
  schoolBooks {
    title
    author
  }
}
```

If we wanted to return specific data for `TextBook`s or `ColoringBook`s, we could include and inline fragment specificying what concrete type we want to select fields on. For example:

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

The amazing thing about interfaces is that if the first book was a `TextBook`, it wouldn't have a field called `colors` in the response, but if it was a `ColoringBook` it would! To see an interface in practice, check out this [example]()

## Node interface

Given the power of interfaces, one pattern that can add a safe layer of flexibility to our schema is the `Node` interface pattern. We really recommend all schemas to follow this pattern if possible! The `Node` interface provides a way to fetch potentially any type in our schema with just an `id` field. We will explain how it works though a common example:

Say we have a database with two different tables; `Author` and `Post`. Each of these tables have an `id` column that is unique for that table. To use the `Node` interface we would add the following to our schema:

```graphql
interface Node {
  id: ID!
}
```

This is the actual `Node` interface. It has only one field which is an `ID!`, meaning it is a schema unique string that is required to exist. To use the `Node` interface in our example, we would write our types like so:

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

By implementing the `Node` interface, we know that anytime we have an `id` field from either `Author` or `Post`, we can send it back to our server and retreive that exact piece of data back! But earlier we said our database has ids that are unique only to each table, so how is this possible? 

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


