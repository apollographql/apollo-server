import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { ApolloServer, ApolloServerOptions, BaseContext } from '../..';
import { expressMiddleware } from '../../express4';
import { ApolloServerPluginDrainHttpServer } from '../../plugin/drainHttpServer';
import { urlForHttpServer } from '../../utils/urlForHttpServer';
import type {
  CreateServerForIntegrationTestsOptions,
  CreateServerForIntegrationTestsResult,
} from '../../testSuite';
import { defineIntegrationTestSuite } from '../../testSuite';

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
        httpServer,
      }),
    ],
  });

  await server.start();

  app.use(
    cors(),
    json(),
    expressMiddleware(server, {
      context: testOptions?.context,
    }),
  );
  await new Promise<void>((resolve) => {
    httpServer.listen({ port: 0 }, resolve);
  });
  return { server, url: urlForHttpServer(httpServer) };
});
