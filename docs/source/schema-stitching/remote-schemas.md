---
title: Remote schemas
description: Generate GraphQL schema objects that delegate to a remote server
---

It can be valuable to be able to treat remote GraphQL endpoints as if they were local executable schemas. This is especially useful for [schema stitching](./schema-stitching.html), but there may be other use cases.

Generally, to create a remote schema, you need three steps:

1. Create a [link](#link) that can retrieve results from that schema
2. Use [`introspectSchema`](#introspectSchema) to get the schema of the remote server
3. Use [`makeRemoteExecutableSchema`](#makeRemoteExecutableSchema) to create a schema that uses the link to delegate requests to the underlying service

We've chosen to split this functionality up to give you the flexibility to choose when to do the introspection step. For example, you might already have the remote schema information, allowing you to skip the `introspectSchema` step entirely. Here's a complete example:

```js
import { HttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';

const link = new HttpLink({ uri: 'http://api.githunt.com/graphql', fetch });

const schema = await introspectSchema(link);

const executableSchema = makeRemoteExecutableSchema({
  schema,
  link,
});
```

Now, let's look at all the parts separately.

<h2 id="link" title="Creating a link">
  Creating a Link
</h2>

A link is a function capable of retrieving GraphQL results. It is the same way that Apollo Client handles fetching data and is used by several `graphql-tools` features to do introspection or fetch results during execution. Using an Apollo Link brings with it a large feature set for common use cases. For instance, adding error handling to your request is super easy using the `apollo-link-error` package. You can set headers, batch requests, and even configure your app to retry on failed attempts all by including new links into your request chain.

<h3 id="link-api" title="Link API">
  Link API
</h3>

Since graphql-tools supports using a link for the network layer, the API is the same as you would write on the client. To learn more about how Apollo Link works, check out the [docs](https://www.apollographql.com/docs/link/); Both GraphQL and Apollo Links have slightly varying concepts of what `context` is used for. To make it easy to use your GraphQL context to create your Apollo Link context, `makeRemoteExecutableSchema` attaches the context from the graphql resolver onto the link context under `graphqlContext`.

Basic usage

```js
import { HttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';

const link = new HttpLink({ uri: 'http://api.githunt.com/graphql', fetch });

const schema = await introspectSchema(link);

const executableSchema = makeRemoteExecutableSchema({
  schema,
  link,
});
```

Authentication headers from context

```js
import { setContext } from 'apollo-link-context';
import { HttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';

const http = new HttpLink({ uri: 'http://api.githunt.com/graphql', fetch });

const link = setContext((request, previousContext) => ({
  headers: {
    'Authentication': `Bearer ${previousContext.graphqlContext.authKey}`,
  }
})).concat(http);

const schema = await introspectSchema(link);

const executableSchema = makeRemoteExecutableSchema({
  schema,
  link,
});
```

<h3 id="fetcher-api" title="Fetcher API">
  Fetcher API
</h3>

You can also use a fetcher (like apollo-fetch or node-fetch) instead of a link. A fetcher is a function that takes one argument, an object that describes an operation:

```js
type Fetcher = (operation: Operation) => Promise<ExecutionResult>;

type Operation {
  query: string;
  operationName?: string;
  variables?: Object;
  context?: Object;
}
```

<h3 id="fetcher-apollo-fetch" title="Using apollo-fetch">
  Using <a href="https://github.com/apollographql/apollo-fetch">apollo-fetch</a>
</h3>

Basic usage

```js
import { createApolloFetch } from 'apollo-fetch';

const fetcher = createApolloFetch({ uri: 'http://api.githunt.com/graphql'});
const schema = makeRemoteExecutableSchema({
  schema: await introspectSchema(fetcher),
  fetcher,
});
```

Authentication headers from context

```js
const fetcher = createApolloFetch({ uri: 'http://api.githunt.com/graphql'});
fetcher.use(({ request, options }, next) => {
  if (!options.headers) {
    options.headers = {};
  }
  options.headers['Authorization'] = `Bearer ${request.context.authKey}`;

  next();
});
const schema = makeRemoteExecutableSchema({
  schema: await introspectSchema(fetcher),
  fetcher,
});
```

<h3 id="fetcher-node-fetch" title="Using node-fetch">
  Using <a href="https://github.com/bitinn/node-fetch">node-fetch</a>
</h3>

Basic usage

```js
import fetch from 'node-fetch';

const fetcher = async ({ query, variables, operationName, context }) => {
  const fetchResult = await fetch('http://api.githunt.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables, operationName })
  });
  return fetchResult.json();
};
const schema = makeRemoteExecutableSchema({
  schema: await introspectSchema(fetcher),
  fetcher,
});
```

Authentication headers from context

```js
import fetch from 'node-fetch';

const fetcher = async ({ query, variables, operationName, context }) => {
  const fetchResult = await fetch('http://api.githunt.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authentication': `Bearer ${context.authKey}`,
    },
    body: JSON.stringify({ query, variables, operationName })
  });
  return fetchResult.json();
};
const schema = makeRemoteExecutableSchema({
  schema: await introspectSchema(fetcher),
  fetcher,
});
```

## API

<h3 id="makeRemoteExecutableSchema" title="Making a remote schema">
  makeRemoteExecutableSchema(options)
</h3>

`makeExecutableSchema` takes a single argument: an object of options. The `schema` and either a `fetcher` or a `link` options are required.

```js
import { makeRemoteExecutableSchema } from 'graphql-tools';

const schema = makeRemoteExecutableSchema({
  schema,
  link,
  // fetcher, you can pass a fetcher instead of a link
});
```

Given a GraphQL.js schema (can be a non-executable client schema made by `buildClientSchema`) and a [Link](#link) or [Fetcher](#fetcher), produce a GraphQL Schema that routes all requests to the link or fetcher.

You can also pass a `createResolver` function to `makeRemoteExecutableSchema` to override how the fetch resolvers are created and executed. The `createResolver` param accepts a `Fetcher` as its first argument and returns a resolver function. This opens up the possibility for users to create batching mechanisms for fetches.
```js
const createResolver: (fetcher: Fetcher) => GraphQLFieldResolver<any, any> = // . . .

const schema = makeRemoteExecutableSchema({
  schema,
  link,
  createResolver
});
```

<h3 id="introspectSchema" title="introspectSchema">
  introspectSchema(fetcher, [context])
</h3>

Use `link` to build a client schema using introspection query. This function makes it easier to use `makeRemoteExecutableSchema`. As a result, you get a promise to a non-executable GraphQL.js schema object. Accepts optional second argument `context`, which is passed to the link; see the docs about links above for more details.

```js
import { introspectSchema } from 'graphql-tools';

introspectSchema(link).then((schema) => {
  // use the schema
});

// or, with async/await:
const schema = await introspectSchema(link);
```
