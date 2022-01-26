---
title: Integration testing
description: Utilities for testing Apollo Server
---

Integration testing a GraphQL server means testing the combination of many interlocking parts at once. One way to test your server setup is to use `ApolloServer`'s `executeOperation` method to directly execute a GraphQL operation without going through a full HTTP operation.

## Testing using `executeOperation`

The `apollo-server` library has a request pipeline that can support many plugins which can each affect the way an operation is executed. The `executeOperation` method is available to run operations through the request pipeline, enabling the most thorough tests possible without starting up an HTTP server. 

The [`executeOperation` method](../api/apollo-server/#executeoperation) can accept the following arguments: 
* An object containing configuration options which must include a `query` key specifying the GraphQL operation to be run. 
  * You can use `executeOperation` to execute both queries and mutations, but both use the `query` key. 
* An argument that is passed in to the `ApolloServer` instance's [`context` function](../data/resolvers/#the-context-argument).

Below is a simplified example of setting up a test using the JavaScript testing library [Jest](https://jestjs.io/):
```js:title=index.test.js
// For clarity in this example we included our typeDefs and resolvers above our test,
// but in a real world situation you'd be importing these in
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

it('returns hello with the provided name', async () => {
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
Note that when testing, any errors in parsing, validating, and executing your GraphQL operation are returned in the `errors` field of the result rather than thrown (just like a normal GraphQL response).

Unlike with a normal instance of `ApolloServer`,  you don't need to call [`start`](../../api/apollo-server/#start) before calling `executeOperation`. The server instance will call `start` automatically for you if it has not been called, and any startup errors will be thrown.

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

If you'd like to use your server's real `context` function, you can pass a second argument into `executeOperation` which is then passed to your server's `context` function. Note that in order to use your server's `context` function you need to put together an object with the correct [middleware-specific context fields](../api/apollo-server/#middleware-specific-context-fields) for your implementation.

For examples of both integration and end-to-end testing we recommend checking out the [tests included in the Apollo fullstack tutorial](https://github.com/apollographql/fullstack-tutorial/tree/master/final/server/src/__tests__).
## End-to-end testing


Instead of bypassing the HTTP layer, you may want to fully run your server and test it with a real HTTP client. Apollo Server doesn't have any built-in support for this at this time. 

You can run operations against your server using a combination of any HTTP or GraphQL client such as [`supertest`](https://www.npmjs.com/package/supertest) or [Apollo Client's HTTP Link](https://www.apollographql.com/docs/react/api/link/apollo-link-http/) . There are also community packages available such as [`apollo-server-integration-testing`](https://www.npmjs.com/package/apollo-server-integration-testing) which uses mocked Express request and response objects. 

Below is an example of writing an end-to-end test using the [`apollo-server-express` package](../integrations/middleware/#apollo-server-express) and `supertest`:

```js:title=e2e.test.js
// we import our server instance
const { server } = require('./server.js');
const express = require('express');
const { createServer } = require('http');

// we will use supertest to test our server
const request = require('supertest');

// this is the query we use for our test
const queryData = {
  query: `query sayHello($name: String) {
    hello(name: $name)
  }`,
  variables: { name: 'world' },
};

// create a new http server for testing
const createTestServer = async () => {
  const app = express();

  await server.applyMiddleware({
    app,
    path: '/graphql',
  });

  const httpServer = createServer(app);
  const port = process.env.PORT || 3000;
  httpServer.listen({ port });

  return { httpServer, expressApp: app };
};

describe('e2e demo', () => {
  let httpServer;

  // before the tests we will create our http server
  beforeAll(async () => {
    const testServer = await createTestServer();
    expressApp = testServer.expressApp;
    httpServer = testServer.httpServer;
  });

  // after the tests we will stop our server
  afterAll(async () => await httpServer?.close());

  it('says hello', async () => {
    const response = await request(expressApp).post('/graphql').send(queryData);
    expect(response.errors).toBeUndefined();
    expect(response.body.data?.hello).toBe('Hello world!');
  });
});
```