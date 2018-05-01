---
title: Sending queries
---

## Operation names

When sending the queries and mutations in the above examples, we've used either `query { ... }` or `mutation { ... }` respectively.  While this is fine, and particularly convenient when running queries by hand, it makes sense to name the operation in order to quickly identify operations during debugging or to aggregate similar operations together for application performance metrics, for example, when using [Apollo Engine]() to monitor an API.

Operations can be named by placing an identifier after the `query` or `mutation` keyword, as we've done with `HomeBookListing` here:

```graphql
query HomeBookListing {
  getBooks {
    title
  }
}
```

## Variables

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

This functionality is also supported by tools like GraphQL Playground and GraphiQL.

