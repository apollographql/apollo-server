import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import { ApolloServer } from '../..';
import { expressMiddleware } from '../../express';
import testSuite, { schema as Schema } from '../integration';

describe('integration:Express', () => {
  let serverToCleanUp: ApolloServer | null = null;
  testSuite({
    createApp: async function createApp(config, context) {
      serverToCleanUp = null;
      const app = express();
      const server = new ApolloServer(
        config ?? {
          schema: Schema,
        },
      );
      await server.start();
      serverToCleanUp = server;
      app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        json(),
        expressMiddleware(server, {
          contextFunction: context,
        }),
      );
      return app;
    },
    destroyApp: async function () {
      await serverToCleanUp?.stop();
    },
  });
});
