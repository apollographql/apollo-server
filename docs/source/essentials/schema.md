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
* Self-explain what capabilities are available to the client (via introspection).

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

By drawing these logical connections in the schema, we allow the client (which is often a human developer, designing a front-end) to see what data is available and request it in a single optimized query.

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

Mutations are operations sent to the server to create, update or delete data.  Those familiar with REST-based communication verbs would associate these with the `PUT`, `POST`, `PATCH` and `DELETE` methods.

* Mutations are the main entry point to make updates to the data backing Queries
* Here is what one looks like coming from the client
* Here is the corresponding server schema
* A mutation can contain arguments and fields
* Input types are passed to Apollo Server and inform it how to make the update
* The fields describe the object that is returned by a mutation, often times the object that was created or the entire collection that was modified. Or a confirmation of deletion
  * Here is what the return looks like from the previous mutation call

## Introspection

Introspection is an automatic benefit built into the GraphQL specification which allows users to ask a server what operations it supports.  This facilitates SDL-generation since GraphiQL and other tools will can provide you specific insight into the fields available at each level of a GraphQL operation.  Protecting data exposed by a GraphQL schema is important and more information on security can be found in [security best practices]().


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
