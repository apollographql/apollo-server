import micro from 'micro';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';

import { ApolloServer } from '../ApolloServer';

async function createApp(options: CreateAppOptions = {}) {
  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );
  await server.start();
  return micro(
    server.createHandler({ __testing__microSuppressErrorLog: true }),
  );
}

describe('microApollo', function () {
  it('should throw an error if called without a schema', function () {
    expect(() => new ApolloServer(undefined as any)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

describe('integration:Micro', function () {
  testSuite({ createApp, integrationName: 'micro' });
});
