---
title: Understanding schema concepts
sidebar_title: Writing a schema
---

> Estimated time: About 10 minutes.

A GraphQL schema is at the center of any GraphQL server implementation and describes the functionality available to the clients which connect to it.

The core building block within a schema is the "type".  Types provide a wide-range of functionality within a schema, including the ability to:

* Create relationships between types (e.g. between a `Book` and an `Author`).
* Define which data-fetching (querying) and data-manipulation (mutating) operations can be executed by the client.
* If desired, self-explain what capabilities are available to the client via introspection.

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

By allowing the consumer of the API to view the full possibilities of the API, developers can easily write new queries, or add new fields to existing ones.

One of the main aspects of GraphQL is that it allows you to describe the space of data available in your system with a strongly typed schema. While GraphQL makes it possible to evolve your API over time without breaking your clients, it's always easier if you think about some schema design decisions up front to reduce the amount of refactoring you need to do later.

This article details some practices around schema design which will help you design a great GraphQL API to stand the test of time.

<h2 id="style">Style conventions</h2>

The GraphQL specification is flexible and doesn't impose specific naming guidelines. However, in order to facilitate development and continuity across GraphQL deployments, it's useful to have a general set of conventions. We suggest the following:

* **Fields** should be named in `camelCase`, since the majority of consumers will be client applications written in JavaScript, Java, Kotlin, or Swift, all of which recommend `camelCase` for variable names.
* **Types**: should be `PascalCase`, to match how classes are defined in the languages above.
* **Enums**: should have their type name in `PascalCase`, and their value names in `ALL_CAPS`, since they are similar to constants.

If you use the conventions above, you won't need to have any extra logic in your clients to convert names to match the conventions of these languages.

<h2 id="design-for-client">Design for client needs</h2>

GraphQL schemas are at their best when they are designed around the needs of client applications.  When a team is building their first GraphQL schema, they might be tempted to create literal mappings on top of existing database collections or tables using CRUD-like root fields. While this literal database-to-schema mapping may be a fast way to get up and running, we strongly suggest avoiding it and instead building the schema based on how the GraphQL API will be used by the front-end.

If a database has fields or relationships that the client doesn't yet need, don’t include them in the schema up front. Adding fields later is much easier than removing them, so add fields to your API as your clients need them rather than exposing all of the possible data up front. This is especially useful because GraphQL allows you to create associations between your data that don't exist in the underlying data, enabling you to move complex data manipulation logic out of your clients.

For example, let's say you want to create a view that lists some events, their locations, and the weather at that location. In that case, you might want to do a query like this:

```graphql
query EventList {
  upcomingEvents {
    name
    date
    location {
      name
      weather {
        temperature
        description
      }
    }
  }
}
```

The desire to display this data could inform the design of a schema like the following:

```graphql
type Query {
  upcomingEvents: [Event]
  # Other fields, etc
}

type Event {
  name: String
  date: String
  location: Location
}

type Location {
  name: String
  weather: WeatherInfo
}

type WeatherInfo {
  temperature: Float
  description: String
}
```

This doesn't necessarily need to match the data returned from a single REST endpoint or database. For example, if you have a REST endpoint exposing a list of events and their locations, but not weather information, you would just need to fetch the weather information from a second endpoint (or even a 3rd party API) in your resolvers. This way, you can design a schema that will allow your frontend to be as simple as possible, without limiting yourself to the exact shape of data that's in your underlying data sources.

<h2 id="mutations">Designing mutations</h2>

The `Mutation` type is a core type in GraphQL which specializes in _modifying_ data, which contrasts the `Query` type used for _fetching_ data.

Unlike REST, where the behavior can be more ad-hoc, the `Mutation` type is designed with the expectation that there will be a response object.  This ensures that the client receives the most current data without a subsequent round-trip re-query.

A mutation for updating the age of a `User` might look like this:

```graphql
type Mutation {
  updateUserAge(id: ID!, age: Int!): User
}

type User {
  id: ID!
  name: String!
  age: Int!
}
```

With this definition, the following mutation becomes possible:

```graphql
mutation updateMyUser {
  updateUserAge(id: 1, age: 25){
    id
    age
    name
  }
}
```

Once executed by the server, the response returned to the client might be:

```json
{
  "data": {
    "updateUserAge": {
      "id": "1",
      "age": "25",
      "name": "Jane Doe"
    }
  }
}
```

While it's not mandatory to return the object which has been updated, the inclusion of the updated information allows the client to confidently update its local state without performing additional requests.

As with queries, it's best to design mutations with the client in mind and in response to a user's action.  In simple cases, this might only result in changes to a single document, however in many cases there will be updates to multiple documents from different resources, for example, a `likePost` mutation might update the total likes for a user as well as their post.

In order to provide a consistent shape of response data, we recommend adopting a pattern which returns a standardized response format which supports returning any number of documents from each resource which was modified.  We'll outline a recommended pattern for this in the next section.

<h3 id="mutation-responses">Responses</h3>

GraphQL mutations can return any information the developer wishes, but designing mutation responses in a consistent and robust structure makes them more approachable by humans and less complicated to traverse in client code.  There are two guiding principles which we have combined into our suggested mutation response structure.

First, while mutations might only modify a single resource type, they often need to touch several at a time.  It makes sense for this to happen in a single round-trip to the server and this is one of the strengths of GraphQL!  When different resources are modified, the client code can benefit from having updated fields returned from each type and the response format should support that.

Secondly, mutations have a higher chance of causing errors than queries since they are modifying data.  If only a portion of a mutation update succeeds, whether that is a partial update to a single document's fields or a failed update to an entire document, it's important to convey that information to the client to avoid stale local state on the client.

A common way to handle errors during a mutation is to simply `throw` an error.  While that's fine, throwing an error in a resolver will return an error for the entire operation to the caller and prevent a more meaningful response.  Consider the following mutation example, which tries to update a user's `name` and `age`:

```graphql
mutation updateUser {
  updateUser(id: 1, user: { age: -1, name: "Foo Bar" }){
    name
    age
  }
}
```

With validation in place, this mutation might cause an error since the `age` is a negative value.  While it’s possible that the entire operation should be stopped, there’s an opportunity to partially update the user’s record with the new `name` and return the updated record with the `age` left untouched.

Fortunately, the powerful structure of GraphQL mutations accommodates this use case and can return transactional information about the update alongside the records which have been changed which enables client-side updates to occur automatically.

In order to provide consistency across a schema, we suggest introducing a `MutationResponse` interface which can be implemented on every mutation response in a schema and enables transactional information to be returned in addition to the normal mutation response object.

A `MutationResponse` interface would look like this:

```graphql
interface MutationResponse {
  code: String!
  success: Boolean!
  message: String!
}
```

An implementing type would look like this:

```graphql
type UpdateUserMutationResponse implements MutationResponse {
  code: String!
  success: Boolean!
  message: String!
  user: User
}
```

Calling a mutation that returns that `UpdateUserMutationResponse` type would result in a response that looks something like this:

```json
{
  "data": {
    "updateUser": {
      "code": "200",
      "success": true,
      "message": "User was successfully updated",
      "user": {
        "id": "1",
        "name": "Jane Doe",
        "age": 35
      }
    }
  }
}
```

Let’s break this down, field by field:

* `code` is a string representing a transactional value explaining details about the status of the data change. Think of this like an HTTP status code.
* `success` is a boolean indicating whether the update was successful or not. This allows a coarse check by the client to know if there were failures.
* `message` is a string that is meant to be a human-readable description of the status of the transaction. It is intended to be used in the UI of the product.
* `user` is added by the implementing type `UpdateUserMutationResponse` to return back the newly created user for the client to use!

For mutations which have touched multiple types, this same structure can be used to return updated objects from each one.  For example, a `likePost` type, which could affect a user's "reputation" and also update the post itself, might implement `MutationResponse` in the following manner:

```graphql
type LikePostMutationResponse implements MutationResponse {
  code: String!
  success: Boolean!
  message: String!
  post: Post
  user: User
}
```

In this response type, we've provided the expectation that both the `user` and the `post` would be returned and an actual response to a `likePost` mutation could be:

```json
{
  "data": {
    "likePost": {
      "code": "200",
      "success": true,
      "message": "Thanks!",
      "post": {
        "likes": 5040
      },
      "user": {
        "reputation": 11
      }
    }
  }
}
```

Following this pattern for mutations provides detailed information about the data that has changed and feedback on whether the operation was successful or not.  Armed with this information, developers can easily react to failures within the client

<h3 id="mutation-input-types">Input types</h3>

Input types are a special type in GraphQL which allows an object to be passed as an argument to both queries and mutations and is helpful when simple scalar types aren't sufficient.

This allows arguments to be structured in an more manageable way, similar to how switching to an `options` argument might be appreciated when `function` arguments become too iterative.

For example, consider this mutation which creates a post along with its accompanying media URLs (e.g. images):

```graphql
type Mutation {
  createPost(title: String, body: String, mediaUrls: [String]): Post
}
```

This could be easier to digest, and the arguments would be easier to re-use within the mutation, by using an `input` type with the relevant fields.

An input type is defined like a normal object type but using the `input` keyword.  To introduce an `input` type for this example, we'd do:

```graphql
type Mutation {
  createPost(post: PostAndMediaInput): Post
}

input PostAndMediaInput {
  title: String
  body: String
  mediaUrls: [String]
}
```

Not only does this facilitate passing the `PostAndMediaInput` around within the schema, it also provides a basis for annotating fields with descriptions which are automatically exposed by GraphQL-enabled tools:

```graphql
input PostAndMediaInput {
  "A main title for the post"
  title: String
  "The textual body of the post."
  body: String
  "A list of URLs to render in the post."
  mediaUrls: [String]
}
```

Input types can also be used when different operations require the exact same information, though we urge caution on over-using this technique since changes to `input` types are breaking changes for all operations which utilize them.

Additionally, while it is possible to reuse an `input` type between a query and mutation which target the same resource, it's often best to avoid this since in many cases certain null fields might be tolerated for one but not the other.

<h2 id="next-steps">Next steps</h2>

At this point, we hope to have explained the basic information necessary to understand a GraphQL schema.

In the [next step](./server.html), we'll show how to start implementing a simple GraphQL server.
