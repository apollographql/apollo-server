import * as hapi from 'hapi';
import { ApolloHAPI, GraphiQLHAPI } from './hapiApollo';

import testSuite, { Schema, CreateAppOptions } from './integrations.test';

function createApp(options: CreateAppOptions = {}) {
  const server = new hapi.Server();

  server.connection({
      host: 'localhost',
      port: 8000,
  });

  options.apolloOptions = options.apolloOptions || { schema: Schema };

  server.register({
      register: new ApolloHAPI(),
      options: options.apolloOptions,
      routes: { prefix: '/graphql' },
  });

  server.register({
      register: new GraphiQLHAPI(),
      options: { endpointURL: '/graphql' },
      routes: { prefix: '/graphiql' },
  });

  return server.listener;
}

function destroyApp(app) {}

describe('integration:HAPI', () => {
  testSuite(createApp, destroyApp);
});
