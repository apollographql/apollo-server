---
title: Security
---

Apollo Server is a safer way to build applications thanks to GraphQL's strong typing and the conversion of raw operations into a trusted syntax tree.  By validating each part of an operation, GraphQL is mostly exempt from injection-attacks which are of concern in other data-driven applications.

 This guide will discuss additional security measures which further harden the excellent foundation which GraphQL is already built upon.  While Apollo Server will enable some additional protections automatically, others require attention on the part of the developer.

<h2 id="introspection">Introspection in production</h2>

Introspection is a powerful tool to have enabled during development and allows developers to get real-time visibility of a GraphQL server's capabilities.

In production, such insight might be less desireable unless the server is intended to be a "public" API.

Therefore, Apollo Server introspection is automatically disabled when the `NODE_ENV` is set to `production` in order to reduce visibility into the API.

Of course, no system should rely solely on so-called "security through obscurity" and this practice should be combined with other security techniques like open security and security by design.

<h2 id="injection">Injection prevention</h2>

As we build out our schema, it may be tempting to allow for shortcut arguments to creep in which have security risks. This most commonly happens on filters and on mutation inputs:

```graphql
query OhNo {
  users(filter: "id = 1;' sql injection goes here!") {
    id
  }
}

mutation Dang {
  updateUser(user: { firstName: "James", id: 1 }) {
    success
  }
}
```

In the first operation we are passing a filter that is a database filter directly as a string. This opens the door for SQL injection since the string is preserved from the client to the server.

In the second operation we are passing an id value which may let an attacker update information for someone else! This often happens if generic Input Types are created for corresponding data sources:

```graphql
# used for both creating and updating a user
input UserInput {
  id: Int
  firstName: String
}

type Mutation {
  createUser(user: UserInput): User
  updateUser(user: UserInput): User
}
```

The fix for both of these attack vectors is to create more detailed arguments and let the validation step of Apollo Server filter out bad values as well as **never** pass raw values from a client into our datasource.

<h2 id="dos">Denial-of-Service (DoS) Protection</h2>

Apollo Server is a Node.js application and standard precautions should be taken in order to avoid Denial-of-Service (DoS) attacks.

Since GraphQL involves the traversal of a graph in which circular relationships of arbitrary depths might be accessible, some additional precautions can be taken to limit the risks of Complexity Denial-of-Service (CDoS) attacks, where a bad actor could craft expensive operations and lock up resources indefinitely.

There are two common techniques to mitigate CDoS risks, and can be enabled together:

1. **Operation white-listing**

    By hashing the potential operations a client might send (e.g. based on field names) and storing these "permitted" hashes on the server (or a shared cache), it becomes possible to check incoming operations against the permitted hashes and skip execution if the hash is not allowed.

    Since many consumers of non-public APIs have their operations statically defined within their source code, this technique is often sufficient and is best implemented as an automated deployment step.

2. **Complexity limits**

    These can be used to limit the use of queries which, for example, request a list of books including the authors of each book, plus the books of those authors, and _their_ authors, and so on.  By limiting operations to an application-defined depth of "_n_", these can be easily prevented.

    We suggest implementing complexity limits using community-provided packages like [graphql-depth-limit](https://github.com/stems/graphql-depth-limit) and [graphql-validation-complexity](https://github.com/4Catalyzer/graphql-validation-complexity).

> For additional information on securing a GraphQL server deployment, check out [Securing your GraphQL API from malicious queries](https://dev-blog.apollodata.com/securing-your-graphql-api-from-malicious-queries-16130a324a6b) by Spectrum co-founder, Max Stoiber.
