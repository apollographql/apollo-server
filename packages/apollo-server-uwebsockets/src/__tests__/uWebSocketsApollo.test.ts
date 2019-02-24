import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';

import { ApolloServer } from '../ApolloServer';

function createApp(options: CreateAppOptions = {}) {
  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );
  console.log(server)
  //return micro(server.createHandler());
}

describe('uWebSocketsApollo', function () {
  it('should throw an error if called without a schema', function () {
    expect(() => new ApolloServer(undefined as any)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

describe.skip('integration:uWebSockets', function () {
  testSuite(createApp);
});
