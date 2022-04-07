import type { BaseContext } from '@apollo/server-types';
import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import {
  ApolloServer,
  ApolloServerOptions,
  ApolloServerPluginDrainHttpServer,
} from '../..';
import { expressMiddleware } from '../../express';
import type {
  CreateServerForIntegrationTestsOptions,
  CreateServerForIntegrationTestsResult,
} from '../integration';
import { defineIntegrationTestSuite } from '../integration';

defineIntegrationTestSuite(async function (
  serverOptions: ApolloServerOptions<BaseContext>,
  testOptions?: CreateServerForIntegrationTestsOptions,
): Promise<CreateServerForIntegrationTestsResult> {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    ...serverOptions,
    plugins: [
      ...(serverOptions.plugins ?? []),
      ApolloServerPluginDrainHttpServer({
        httpServer: httpServer,
      }),
    ],
  });
  if (!testOptions?.suppressStartCall) {
    await server.start();
  }
  const graphqlPath = testOptions?.graphqlPath ?? '/graphql';
  app.use(
    graphqlPath,
    cors<cors.CorsRequest>(),
    json(),
    expressMiddleware(server, {
      context: testOptions?.context,
    }),
  );
  await new Promise((resolve) => {
    httpServer.once('listening', resolve);
    httpServer.listen({ port: 0 });
  });
  return { server, httpServer };
});
