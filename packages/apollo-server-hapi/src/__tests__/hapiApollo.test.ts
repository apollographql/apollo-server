import { ApolloServer } from '../ApolloServer';
import { Config } from 'apollo-server-core';

import testSuite, {
  schema as Schema,
  CreateAppOptions,
  atLeastMajorNodeVersion,
} from 'apollo-server-integration-testsuite';

// NODE: Intentionally skip on Node.js < 8 since Hapi 17 doesn't support less
(atLeastMajorNodeVersion(8) ? describe : describe.skip)(
  'integration:Hapi',
  () => {
    async function createApp(options: CreateAppOptions = {}) {
      const { Server } = require('hapi');

      const app: import('hapi').Server = new Server({
        host: 'localhost',
        port: 8000,
      });

      const server = new ApolloServer(
        (options.graphqlOptions as Config) || { schema: Schema },
      );
      await server.applyMiddleware({
        app,
      });

      await app.start();

      return app.listener;
    }

    async function destroyApp(app) {
      if (!app || !app.close) {
        return;
      }
      await new Promise(resolve => app.close(resolve));
    }

    testSuite(createApp, destroyApp);
  },
);
