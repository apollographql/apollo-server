---
title: Integration testing
description: Utilities for testing Apollo Server
---

Testing `apollo-server` can be done in many ways. One simple way is to use ApolloServer's `executeOperation` method to directly execute a GraphQL operation without going through a full HTTP operation.

## `executeOperation`

Integration testing a GraphQL server means testing many things. `apollo-server` has a request pipeline that can support many plugins that can affect the way an operation is executed. The `executeOperation` method provides a single hook to run operations through the request pipeline, enabling the most thorough tests possible without starting up an HTTP server.

```javascript
const server = new ApolloServer(config);

const result = await server.executeOperation({
  query: GET_USER,
  variables: { id: 1 }
});
expect(result.errors).toBeUndefined();
expect(result.data?.user.name).toBe('Ida');
```

For example, you can set up a full server with your schema and resolvers and run an operation against it.

```javascript
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
  await server.start();

  // mock the dataSource's underlying fetch methods
  launchAPI.get = jest.fn(() => [mockLaunchResponse]);
  userAPI.store = mockStore;
  userAPI.store.trips.findAll.mockReturnValueOnce([
    { dataValues: { launchId: 1 } },
  ]);

  // run query against the server and snapshot the output
  const res = await server.executeOperation({ query: GET_LAUNCH, variables: { id: 1 } });
  expect(res).toMatchSnapshot();
});
```

This is an example of a full integration test being run against a test instance of `apollo-server`. This test imports the important pieces to test (`typeDefs`, `resolvers`, `dataSources`) and creates a new instance of `apollo-server`.

The example above shows writing a test-specific [`context` function](../data/resolvers/#the-context-argument) which provides data directly instead of calculating it from the request context. If you'd like to use your server's real `context` function, you can pass a second argument to `executeOperation` which will be passed to your `context` function as its argument. You will need to put to gether an object with the [middleware-specific context fields](../api/apollo-server/#middleware-specific-context-fields) yourself.

You can use `executeOperation` to execute queries and mutations. Because the interface matches the GraphQL HTTP protocol, you specify the operation text under the `query` key even if the operation is a mutation. You can specify `query` either as a string or as a `DocumentNode` (an AST created by the `gql` tag).

In addition to `query`, the first argument to `executeOperation` can take `operationName`, `variables`, `extensions`, and `http` keys.

Note that errors in parsing, validating, and executing your operation are returned in the `errors` field of the result (just like in a GraphQL response) rather than thrown.


## End-to-end testing

Instead of bypassing the HTTP layer, you may just want to fully run your server and test it with a real HTTP client.

Apollo Server doesn't have any built-in support for this. You can combine any HTTP or GraphQL client such as [`supertest`](https://www.npmjs.com/package/supertest) or [Apollo Client's HTTP Link](https://www.apollographql.com/docs/react/api/link/apollo-link-http/) to run operations against your server. There are also community packages available such as [`apollo-server-integration-testing`](https://www.npmjs.com/package/apollo-server-integration-testing) which uses mocked Express request and response objects.
