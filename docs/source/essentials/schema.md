---
title: Understanding schema concepts
sidebar_title: Writing a schema
---

> Estimated time: About 6 minutes.

A GraphQL schema is at the center of any GraphQL server implementation and describes the functionality available to the clients which connect to it.

The core building block within a schema is the "type".  Types provide a wide-range of functionality within a schema, including the ability to:

* Create relationships between types (e.g. between a `Book` and an `Author`).
* Define which data-fetching (querying) and data-manipulation (mutating) operations can be executed by the client.
* If desired, self-explain what capabilities are available to the client (via introspection).

By the end of this page, we hope to have explained the power of types and how they relate to a GraphQL server.

<h2 id="sdl">Schema Definition Language</h2>

To make it easy to understand the capabilities of a server, GraphQL implements a human-readable schema syntax known as its Schema Definition Language, or "SDL".  The SDL is used to express the _types_ available within a schema and how those types relate to each other.

At first glance the SDL may appear to be similar to JavaScript, but this GraphQL-specific syntax must be stored as a `String`.  Right now, we'll focus on explaining SDL and then go into examples of using it within JavaScript later on.

In a simple example involving books and authors, the SDL might declare:

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

It's important to note that these declarations express the _relationships_ and the _shape_ of the data to return, not where the data comes from or how it might be stored - which will be covered outside the SDL.

By drawing these logical connections in the schema definition, we can allow the client (which is often a human developer, designing a front-end) to see what data is available and request it in a single optimized query.

GraphQL clients (such as [Apollo Client](/docs/react)) benefit from the precision of GraphQL operations, especially when compared to traditional REST-based approaches, since they can avoid over-fetching and stitching data, which are particularly costly on slow devices or networks.

<h3 id="scalar">Scalar types</h3>

Scalar types represent the leaves of an operation and always resolve to concrete data. The default scalar types which GraphQL offers are:

* `Int`: Signed 32‐bit integer
* `Float`: Signed double-precision floating-point value
* `String`: UTF‐8 character sequence
* `Boolean`: true or false
* `ID` (serialized as `String`): A unique identifier, often used to refetch an object or as the key for a cache. While serialized as a String, ID signifies that it is not intended to be human‐readable

These primitive types cover a majority of use cases. For other use cases, we can create [custom scalar types](../features/scalars-enums.html).

<h3 id="object">Object types</h3>

The object type is the most common type used in a schema and represents a group of fields. Each field inside of an object type maps to another type, allowing nested types and circular references.

```graphql
type TypeName {
  fieldA: String
  fieldB: Boolean
  fieldC: Int
  fieldD: CustomType
}

type CustomType {
  circular: TypeName
}
```

<h3 id="query">The Query type</h3>

A GraphQL query is for _fetching_ data and compares to the `GET` verb in REST-based APIs.

In order to define what queries are possible on a server, the `Query` type is used within the SDL.  The `Query` type is one of many root-level types which defines functionality (it doesn't actually trigger a query) for clients and acts as an entry-point to other more specific types within the schema.

Using the books and author example we created in the SDL example of the last section, we can define multiple independent queries which are available on a server:

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

As mentioned in the previous section, the structure in which types are organized in the SDL is important because of the relationships it creates.  When a client makes a query to the server, the server will return results in a shape that matches that of the query.

Based on the SDL defined above, a client could request a list of all books _and_ a separate list of all authors by sending a single `query` with exactly what it wishes to receive in return:

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

Which would return data to the client as:

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

While having two separate lists&mdash;a list of books and a list of authors&mdash;might be useful for some purposes, a separate desire might be to display a single list of books which includes the author for each book.

Thanks to the relationship between `Book` and `Author`, which is defined in the SDL above, such a `query` could be expressed as:

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

<h3 id="mutation">The Mutation type</h3>

Mutations are operations sent to the server to create, update or delete data.  These are comparable to the `PUT`, `POST`, `PATCH` and `DELETE` verbs on REST-based APIs.

Much like how the `Query` type defines the entry-points for data-fetching operations on a GraphQL server, the root-level `Mutation` type specifies the entry points for data-manipulation operations.

For example, when imagining a situation where the API supported adding a new `Book`, the SDL might implement the following `Mutation` type:

```graphql
type Mutation {
  addBook(title: String, author: String): Book
}
```

This implements a single `addBook` mutation which accepts `title` and `author` as arguments (both `String` types).  We'll go further into arguments (also known as "input types") in [types](../schemas/types.html), but the important thing to note here is that this mutation will return the newly-created `Book` object.

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

<h2 id="documentation">Documenting your schema</h2>

<h3 id="comments">Describing types</h3>

GraphQL supports providing markdown-enabled descriptions within the schema, which makes it easy for consumers of the API to discover a field and how to use it.

For example, the following type definition shows how to use both single-line string literals, as well as multi-line blocks.

```graphql
"Description for the type"
type MyObjectType {
  """
  Description for field
  Supports **multi-line** description for your [API](http://example.com)!
  """
  myField: String!

  otherField(
    "Description for argument"
    arg: Int
  )
}
```

This makes SDL-generation even easier since many GraphQL tools (like GraphQL Playground) auto-complete field names, along with the descriptions, when available.

<h3 id="introspection">Introspection</h3>

Introspection is an **optional** feature, enabled by default during development, which allows clients (which are frequently developers, building an application) to automatically discover the types implemented within a GraphQL schema.

By allowing the consumer of the API to see the full possibilities that an API can, developers can easily add new fields to existing queries.

<h2 id="next-steps">Next steps</h2>

At this point, we hope to have explained the basic information necessary to understand a GraphQL schema.

In the [next step](./server.html), we'll show how to start implementing a simple GraphQL server.
