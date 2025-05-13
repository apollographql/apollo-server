import cors from 'cors';
import express, { json } from 'express';
import http from 'http';
import { ApolloServer, ApolloServerOptions, BaseContext } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { urlForHttpServer } from '../../utils/urlForHttpServer';
import {
  defineIntegrationTestSuite,
  CreateServerForIntegrationTestsOptions,
} from '@apollo/server-integration-testsuite';

defineIntegrationTestSuite(
  async function (
    serverOptions: ApolloServerOptions<BaseContext>,
    testOptions?: CreateServerForIntegrationTestsOptions,
  ) {
    const app = express();
    const httpServer = http.createServer(app);
    // For started-in-background servers (ie serverless) we typically don't
    // drain in practice (serverless environments run one operation at a
    // time). Also, in certain tests where server startup fails we won't be
    // legally allowed to call stop() (because you can't stop something that
    // hasn't started)... but unlike in the started-in-foreground case, we
    // will have already started the http server listening. So we can't just
    // rely on the drain plugin to do our server-closing; we do it ourselves
    // in the extraCleanup block.
    const server = new ApolloServer(serverOptions);

    server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

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
    return {
      server,
      url: urlForHttpServer(httpServer),
      async extraCleanup() {
        await new Promise((resolve) => {
          httpServer.close(resolve);
        });
      },
    };
  },
  { serverIsStartedInBackground: true },
);
