import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import { ApolloServerExpress } from '../../express';
import testSuite, { schema as Schema } from '../integration';

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
    createApp: async function createApp(config, context) {
      serverToCleanUp = null;
      const app = express();
      const server = new ApolloServerExpress(
        config ?? {
          schema: Schema,
        },
      );
      await server.start();
      serverToCleanUp = server;
      app.use(
        '/graphql',
        cors(),
        json(),
        server.getMiddleware(context ?? (async () => ({}))),
      );
      return app;
    },
    destroyApp: async function () {
      await serverToCleanUp?.stop();
    },
  });
});
