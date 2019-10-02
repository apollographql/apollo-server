---
title: Remote schemas
description: Generate GraphQL schema objects that delegate to a remote server
---

It can be valuable to be able to treat remote GraphQL endpoints as if they were local executable schemas. This is especially useful for [schema stitching](/features/schema-stitching/), but there may be other use cases.

Generally, there are three steps to create a remote schema:

1. Create a [link](#creating-a-link) that can retrieve results from that schema
2. Use [`introspectSchema`](#introspect-and-delegate-requests) to get the schema of the remote server
3. Use [`makeRemoteExecutableSchema`](#api) to create a schema that uses the link to delegate requests to the underlying service

## Creating a Link

A link is a function capable of retrieving GraphQL results. It is the same way that Apollo Client handles fetching data and is used by several `graphql-tools` features to do introspection or fetch results during execution. Using an Apollo Link brings with it a large feature set for common use cases. For instance, adding error handling to your request is super easy using the `apollo-link-error` package. You can set headers, batch requests, and even configure your app to retry on failed attempts all by including new links into your request chain.

```js
const fetch = require('node-fetch');

const link = new HttpLink({ uri: 'http://api.githunt.com/graphql', fetch });
```

To add authentication headers, modify the link to include an authentication header:

```js
const { setContext } = require('apollo-link-context');
const { HttpLink } = require('apollo-link-http');

const http = new HttpLink({ uri: 'http://api.githunt.com/graphql', fetch });

const link = setContext((request, previousContext) => ({
  headers: {
    'Authentication': `Bearer ${previousContext.graphqlContext.authKey}`,
  }
})).concat(http);
```

### Introspect and Delegate Requests

Since apollo-server supports using a link for the network layer, the API is the same as the client. To learn more about how Apollo Link works, check out the [docs](https://www.apollographql.com/docs/link/); Both GraphQL and Apollo Links have slightly varying concepts of `context`. For ease of use, `makeRemoteExecutableSchema` attaches the GraphQL context used in resolvers onto the link context under `graphqlContext`. The following example combined with the previous link construction shows basic usage:

```js
const { introspectSchema, makeRemoteExecutableSchema, ApolloServer } = require('apollo-server');

const schema = await introspectSchema(link);

const executableSchema = makeRemoteExecutableSchema({
  schema,
  link,
});

const server = new ApolloServer({ schema: executableSchema });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
});
```

## API

Point at `makeRemoteExecutableSchema(options)` and `introspectSchema(fetcher, [context])`
