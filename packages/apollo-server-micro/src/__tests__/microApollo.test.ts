import micro from 'micro';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { GraphQLOptions, Config } from 'apollo-server-core';

import { ApolloServer } from '../ApolloServer';

function createApp(options: CreateAppOptions = {}) {
  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );
  return micro(server.createHandler());
}

describe('microApollo', function() {
  it('should throw an error if called without a schema', function() {
    expect(() => new ApolloServer(undefined as GraphQLOptions)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

describe('integration:Micro', function() {
  testSuite(createApp);
});
