---
title: Security
---

Apollo Server is a safe way to build applications thanks to GraphQL's strongly typed requirements and the conversion of the raw operation into a known AST. Instead of opening the door for SQL style injections, every operation is validated to ensure it is valid GraphQL and only that. There are a few practices that can make our application more secure and prevent operations that may shut down our servers.

<h2 id="introspection-in-production">Introspection in production</h2>

Introspection is a powerful tool to build exploration and amazing tool support into our API service. In development it powers GraphiQL, codegeneration tooling, and even editor integrations. However, in production we recommend turning off the ability to run introspection queries. By turning off introspection, it becomes harder for attackers to see what the shape of our schema is and plan potentially expensive attacks. By default, introspection is turned off in production with ApolloServer (i.e. if `NODE_ENV === "production"`). If we wanted to force it on, we could do so by setting `introspection: true` in our config:

```js
const server = new ApolloServer({ typeDefs, resolvers, introspection: true });
```

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
