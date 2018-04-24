---
title: Building a GraphQL schema
sidebar_title: Building a schema
---

## Overview

> Estimated time: About 6 minutes.

A GraphQL schema is at the center of any GraphQL server implementation and describes the functionality available to the clients which connect to it.

The core building block within a schema is the "type".  Types provide a wide-range of functionality within a schema, including the ability to:

* Create relationships between types (e.g. between a `Book` and an `Author`).
* Define which data-fetching (querying) and data-manipulation (mutating) operations can be executed by the client.
* If desired, self-explain what capabilities are available to the client (via introspection).

By the end of this page, we hope to have explained the power of types and how they relate to a GraphQL server.

## Schema Definition Language (SDL)

To make it easy to understand the capabilities of a server, GraphQL implements a human-readable schema syntax known as its Schema Definition Language, or "SDL".  This GraphQL-specific syntax is encoded as a `String` type.

The SDL is used to express the "types" available within a schema and how those types relate to each other.  In a simple example involving books and authors, the SDL might declare:

```graphql
type Book {
  title: String
  author: Author
}

type Author {
  name: String
  books: [Book]
}
```

It's important to note that these declarations express the relationships and the shape of the data to return, not where the data comes from or how it might be stored - which will be covered outside the SDL.

By drawing these logical connections in the schema, we can allow the client (which is often a human developer, designing a front-end) to see what data is available and request it in a single optimized query.

GraphQL clients (such as [Apollo Client](/docs/react)) benefit from the precision of GraphQL operations, especially when compared to traditional REST-based approaches, since they can avoid over-fetching and stitching data, which are particularly costly on slow devices or networks.

## Queries

A GraphQL query is for _reading_ data and comparable to the `GET` verb in REST-based APIs.

Thanks to the relationships which have been defined in the SDL, the client can expect that the shape of the data returned will match the shape of the query it sends.

In order to define what queries are possible on a server, a special `Query` type is defined within the SDL.  The `Query` type is one of many root-level types, but the `Query` type specializes in fetching data and acts as the entry-point to other types within the schema.

Using the books and author example we created in the SDL example above, we can define _multiple_ queries which are available on a server:

```graphql
type Query {
  getBooks: [Book]
  getAuthors: [Author]
}
```

In this `Query` type, we define two types of queries which are available on this GraphQL server:

* `getBooks`: which returns a list of `Book` objects.
* `getAuthors`: which returns a list of `Author` objects.

Those familiar with REST-based APIs would normally find these located on separate end-points (e.g. `/api/books` and `/api/authors`), but GraphQL allows them to be queried at the same time and returned at once.

Using this query, a client could request a list of all books _and_ a separate list of all authors by sending a single `query` with exactly the types it wishes to receive in return:

```graphql
query {
  getBooks {
    title
  }

  getAuthors {
    name
  }
}
```

The data returned from this `query` would look like:

```json
{
  "data": {
    "getBooks": [
      {
        "title": "..."
      },
      ...
    ],
    "getAuthors": [
      {
        "name": "..."
      },
      ...
    ]
  }
}
```

Of course, when displaying this data on the client, it might be desirable for the `Author` to be within the `Book` that the author wrote.

Thanks to the relationship between `Book` and `Author`, which is defined in the SDL above, this `query` would look like:

```graphql
query {
  getBooks {
    title
    author {
      name
    }
  }
}
```

And, without additional effort on its part, the client would receive the information in the same shape as the request:

```json
{
  "data": {
    "getBooks": [
      {
        "title": "..."
        "author": {
          "name": "..."
        }
      },
      ...
    ]
  }
}
```

### Query arguments

> TODO? Should this section exist here?

## Mutations

Mutations are operations sent to the server to create, update or delete data.  These are comparable to the `PUT`, `POST`, `PATCH` and `DELETE` verbs on REST-based APIs.

Much like how the `Query` type defines the entry-points for data-fetching operations on a GraphQL server, the root-level `Mutation` type specifies the entry points for data-manipulation operations.

For example, when imagining a situation where the API supported adding a new `Book`, the SDL might implement the following `Mutation` type:

```graphql
type Mutation {
  addBook(title: String, author: String): Book
}
```

This implements a single `addBook` mutation which accepts a `title` and `author` argument (both `String` types).  We'll talk more about the arguments soon, but the important thing to note here is that this mutation will return the newly-created `Book` object.

The `Book` object will match the previously-created `Book` type (from above) and, much like the `Query` type, we specify the fields to include in the return object when sending the `mutation`:

```graphql
mutation {
  addBook(title: "Fox in Socks", author: "Dr. Seuss") {
    title
    author {
      name
    }
  }
}
```

In the above example, we've requested the book's `title` along with the `name` of the `author`.  The result returned from this mutation would be:

```json
{
  "data": {
    "addBook": {
      {
        "title": "Fox in Socks",
        "author": {
          "name": "Dr. Seuss"
        }
      }
    }
  }
}
```

Multiple mutations may be sent in the same request, however they will be executed in the order they are provided (in series), in order to avoid race-conditions within the operation.

## Introspection and documentation

Introspection is an **optional** feature, enabled by default during development, which allows clients to automatically discover the types implemented within a GraphQL schema.

The type declarations can be further extended with optional string literals to provide descriptions of a field's purpose to the client:

```graphql
type Book {
  "Returns the title of the book, as listed in the card catalog."
  title: String
}

type Query {
  "Fetch a list of our extensive book collection!"
  getBooks: [Book]
}
```

This makes SDL-generation even easier since many GraphQL tools auto-complete field names, along with the descriptions, when available.

## Operation names

When sending the queries and mutations in the above examples, we've used either `query { ... }` or `mutation { ... }` respectively.  While this is fine, and particularly convenient when running queries by hand, it makes sense to name the operation in order to quickly identify operations during debugging or to aggregate similar operations together for application performance metrics, for example, when using [Apollo Engine]() to monitor an API.

Operations can be named by placing an identifier after the `query` or `operation` keyword, as in:

```graphql
query HomepageBookListing {
  getBooks {
    title
  }
}

mutation HomepageQuickAddBook {
  addBook(title: "Fox in Socks", author: "Dr. Seuss") {
    title
  }
}
```

## Passing arguments as variables

TODO

## SCRATCHPAD

### Query
  * GraphQL query defines the shape of data that will be returned by a particular request
    * make sure it has arguments
  * This query is then checked again the server's schema
    * looks like this:

### Mutation
  * Mutations exist because they have special argument types called Input types
  * Input types only contain scalar types and cannot have any other input types
    * ensures that data from the client is always serializable and we don't lose any information, since circular references don't survive network call
