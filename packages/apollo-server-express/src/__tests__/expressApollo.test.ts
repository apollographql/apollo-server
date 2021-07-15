import express from 'express';
import { ApolloServer, ApolloServerExpressConfig } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';

async function createApp(options: CreateAppOptions = {}) {
  const app = express();

  const server = new ApolloServer(
    (options.graphqlOptions as ApolloServerExpressConfig) || { schema: Schema },
  );
  await server.start();
  server.applyMiddleware({ app });
  return app;
}

describe('expressApollo', () => {
  it('throws error if called without schema', function () {
    expect(() => new ApolloServer(undefined as any)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

describe('integration:Express', () => {
  testSuite({ createApp });
});
