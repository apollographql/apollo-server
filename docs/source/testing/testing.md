---
title: Integration testing
description: Utilities for testing Apollo Server
---

Testing `apollo-server` can be done in many ways. The `apollo-server-testing` package provides tooling to make testing easier and accessible to users of all of the `apollo-server` integrations.

## `createTestClient`

Integration testing a GraphQL server means testing many things. `apollo-server` has a request pipeline that can support many plugins that can affect the way an operation is executed. `createTestClient` provides a single hook to run operations through the request pipeline, enabling the most thorough tests possible without starting up an HTTP server.

```javascript
const { createTestClient } = require('apollo-server-testing');

const { query, mutate } = createTestClient(server);

query({
  query: GET_USER,
  variables: { id: 1 }
});

mutate({
  mutation: UPDATE_USER,
  variables: { id: 1, email: 'nancy@foo.co' }
});
```

When passed an instance of the `ApolloServer` class, `createTestClient` returns a `query` and `mutate` function that can be used to run operations against the server instance. Currently, queries and mutations are the only operation types supported by `createTestClient`.

```javascript
const { createTestClient } = require('apollo-server-testing');

it('fetches single launch', async () => {
  const userAPI = new UserAPI({ store });
  const launchAPI = new LaunchAPI();

  // create a test server to test against, using our production typeDefs,
  // resolvers, and dataSources.
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({ userAPI, launchAPI }),
    context: () => ({ user: { id: 1, email: 'a@a.a' } }),
  });

  // mock the dataSource's underlying fetch methods
  launchAPI.get = jest.fn(() => [mockLaunchResponse]);
  userAPI.store = mockStore;
  userAPI.store.trips.findAll.mockReturnValueOnce([
    { dataValues: { launchId: 1 } },
  ]);

  // use the test server to create a query function
  const { query } = createTestClient(server);

  // run query against the server and snapshot the output
  const res = await query({ query: GET_LAUNCH, variables: { id: 1 } });
  expect(res).toMatchSnapshot();
});
```

This is an example of a full integration test being run against a test instance of `apollo-server`. This test imports the important pieces to test (`typeDefs`, `resolvers`, `dataSources`) and creates a new instance of `apollo-server`. Once an instance is created, it's passed to `createTestClient` which returns `{ query, mutate }`. These methods can then be used to execute operations against the server.

For more examples of this tool in action, check out the [integration tests](https://github.com/apollographql/fullstack-tutorial/blob/master/final/server/src/__tests__/integration.js) in the [Fullstack Tutorial](https://www.apollographql.com/docs/tutorial/introduction.html).
