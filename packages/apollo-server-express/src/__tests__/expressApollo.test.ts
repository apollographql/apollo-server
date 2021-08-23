import express from 'express';
import { ApolloServer, ApolloServerExpressConfig } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';

describe('expressApollo', () => {
  it('throws error if called without schema', function () {
    expect(() => new ApolloServer(undefined as any)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

describe('integration:Express', () => {
  let serverToCleanUp: ApolloServer | null = null;
  testSuite({
    createApp: async function createApp(options: CreateAppOptions = {}) {
      serverToCleanUp = null;
      const app = express();
      const server = new ApolloServer(
        (options.graphqlOptions as ApolloServerExpressConfig) || {
          schema: Schema,
        },
      );
      await server.start();
      serverToCleanUp = server;
      server.applyMiddleware({ app });
      return app;
    },
    destroyApp: async function () {
      await serverToCleanUp?.stop();
    },
  });
});
