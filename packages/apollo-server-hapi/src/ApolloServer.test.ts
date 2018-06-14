import { Server } from 'hapi';
import {
  testApolloServer,
  createServerInfo,
} from 'apollo-server-integration-testsuite';

import { registerServer, ApolloServer } from './ApolloServer';

describe('apollo-server-hapi', () => {
  let server;
  let app;
  let httpServer;
  testApolloServer(
    async options => {
      server = new ApolloServer(options);
      app = new Server({ host: 'localhost', port: 4000 });
      registerServer({ app, server });
      await app.start();
      const httpServer = app.listener;
      return createServerInfo(server, httpServer);
    },
    async () => {
      if (server) await server.stop();
      if (app) await app.stop();
      if (httpServer && httpServer.listening) await httpServer.close();
    },
  );
});
