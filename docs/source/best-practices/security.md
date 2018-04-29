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

<h2 id="ddos">DDOS Protection</h2>

Since Apollo Server is a standard node app, best practices for prevent DDOS requests still apply. Howerver with GraphQL there is often concerns of a CDOS (Complexity Denial of Service) attack where a bad actor could create dangerously expensive operations locking up our data resources. There are two common ways to prevent this, and they work well in practice with each other.

- **Whitelist** operations to only allow approved operations from work with our server
- Implement **complexity** limits on our schema to prevent malicious operations from being executed.


Whitelisting can be done by hashing all of the operations that our client app will use, sending them to the server (or a shared data store), and on every request, see if the operation that is being sent matches the ones that we have approved previously. If it doesn't match, we error out and don't attempt to execute the request.

Complexity limits can be implemented using community packages such as [graphql-depth-limit](https://github.com/stems/graphql-depth-limit) and [graphql-validation-complexity](https://github.com/4Catalyzer/graphql-validation-complexity). For more information about securing your Apollo Server, check out this [incredible post](https://dev-blog.apollodata.com/securing-your-graphql-api-from-malicious-queries-16130a324a6b) by Spectrum co-founder Max Stoiber.
