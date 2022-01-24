---
title: Integration testing
description: Utilities for testing Apollo Server
---

Integration testing a GraphQL server means testing the combination of many interlocking parts at once. One  way to test your setup of `apollo-server` is to use `ApolloServer`'s `executeOperation` method to directly execute a GraphQL operation without going through a full HTTP operation.

## Testing using `executeOperation`

The `apollo-server` library has a request pipeline that can support many plugins which can each affect the way an operation is executed. The `executeOperation` method is available to run operations through the request pipeline enabling the most thorough tests possible without starting up an HTTP server. 

The `executeOperation` method can accept multiple arguments: 
* The first is an object containing configuration options which must include a `query` key specifying the GraphQL operation to be run. 
  * You can optionally include additional keys for `variables`,  `operationName`, `extensions`, and `http`, much like with [HTTP requests](../requests).
* An argument that will be passed in to the `ApolloServer` instance's [`context` function](../data/resolvers/#the-context-argument)

You can use `executeOperation` to execute both queries and mutations. Because the interface matches the GraphQL HTTP protocol, you must specify the operation text under the `query` key even if the operation is a mutation. You can specify `query` either as a string or as a `DocumentNode` (an AST created by using the `gql` tag).

Below is a simplified example of setting up a test using the JavaScript testing library [Jest](https://jestjs.io/). You are, of course, free to use whichever testing library you like best.
```js:title=index.test.js
// For clarity in this example we included our typeDefs and resolvers above our test, but in a real world situation
// you'd be importing these from other files in your application
const typeDefs = gql`
  type Query {
    hello(name: String): String!
  }
`;

const resolvers = {
  Query: {
    hello: (_, { name }) => `Hello ${name}!`,
  },
};

test('returns hello with the provided name', async () => {
  const mockServer = new ApolloServer({
    typeDefs,
    resolvers
  });

  const result = await mockServer.executeOperation({
    query: 'query SayHelloWorld($name: String) { hello(name: $name) }',
    variables: { name: 'world' },
  });

  expect(result.errors).toBeUndefined();
  expect(result.data?.hello).toBe('Hello world!');
});
```

Note that when testing, any errors in parsing, validating, and executing your GraphQL operation are returned in the `errors` field of the result (just like with a normal GraphQL response) rather than thrown.

Unlike with a normal instance of `ApolloServer`,  don't have to call [`start`](../../api/apollo-server/#start) before calling `executeOperation`. The server instance will call it automatically for you if it has not been called, and any startup errors will be thrown.

To expand on the example above, here is a full integration test being run against a test instance of `ApolloServer`. This test imports all of the important pieces to test (`typeDefs`, `resolvers`, `dataSources`) and creates a new instance of `ApolloServer`.

```js:title=integration.test.js
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

  // run the query against the server and snapshot the output
  const res = await server.executeOperation({ query: GET_LAUNCH, variables: { id: 1 } });
  expect(res).toMatchSnapshot();
});
```

The example above includes a test-specific [`context` function](../data/resolvers/#the-context-argument) which provides data directly to the `ApolloServer` instance, instead of calculating it from the request's context. 

If you'd like to use your server's real `context` function, you can pass a second argument into `executeOperation` which is then passed to your server's `context` function. Note that in order to use your server's `context` function you will need to put together an object with the correct [middleware-specific context fields](../api/apollo-server/#middleware-specific-context-fields) for your implementation.

## End-to-end testing

Instead of bypassing the HTTP layer, you may want to fully run your server and test it with a real HTTP client.

Apollo Server doesn't have any built-in support for this at this time. You can combine any HTTP or GraphQL client such as [`supertest`](https://www.npmjs.com/package/supertest) or [Apollo Client's HTTP Link](https://www.apollographql.com/docs/react/api/link/apollo-link-http/) to run operations against your server. There are also community packages available such as [`apollo-server-integration-testing`](https://www.npmjs.com/package/apollo-server-integration-testing) which uses mocked Express request and response objects.
