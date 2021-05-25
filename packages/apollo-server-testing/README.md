# apollo-server-testing

This deprecated package contains a function `createTestClient` which is a very thin wrapper around the Apollo Server `server.executeOperation` method.

Code that uses this package looks like the following, where `server` is an `ApolloServer`:

```js
const { createTestClient } = require('apollo-server-testing');

const { query, mutate } = createTestClient(server);

await query({ query: QUERY });
await mutate({ mutation: MUTATION });
```

We recommend you stop using this package and replace the above code with the equivalent:

```js
await server.executeOperation({ query: QUERY });
await server.executeOperation({ query: MUTATION });
```

This package will not be distributed as part of Apollo Server 3.
