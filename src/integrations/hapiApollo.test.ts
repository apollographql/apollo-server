import * as hapi from 'hapi';
import { ApolloHAPI, GraphiQLHAPI } from './hapiApollo';

import testSuite, { Schema, CreateAppOptions } from './integrations.test';

function createApp(options: CreateAppOptions = {}) {
  const server = new hapi.Server();

  server.connection({
      host: 'localhost',
      port: 8000,
  });

  server.register({
      register: new ApolloHAPI(),
      options: { schema: Schema },
      routes: { prefix: '/graphql' },
  });

  server.register({
      register: new GraphiQLHAPI(),
      options: { endpointURL: '/graphql' },
      routes: { prefix: '/graphql' },
  });

  return server.listener;
}

describe('integration:HAPI', () => {
  testSuite(createApp);
});
