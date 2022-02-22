import express from 'express';
import { ApolloServerExpress, ApolloServerExpressConfig } from '../../express';
import testSuite, { schema as Schema, CreateAppOptions } from '../integration';

describe('expressApollo', () => {
  it('throws error if called without schema', function () {
    expect(() => new ApolloServerExpress(undefined as any)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

describe('integration:Express', () => {
  let serverToCleanUp: ApolloServerExpress | null = null;
  testSuite({
    createApp: async function createApp(options: CreateAppOptions = {}) {
      serverToCleanUp = null;
      const app = express();
      const server = new ApolloServerExpress(
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
