import * as hapi from 'hapi';
import { HapiApollo } from './hapiApollo';

import testSuite, { Schema, CreateAppOptions } from './integrations.test';

function createApp(options: CreateAppOptions = {}) {
  const server = new hapi.Server();

  server.connection({
      host: 'localhost',
      port: 8000,
  });

  server.register({
      register: new HapiApollo(),
      options: { schema: Schema },
      routes: { prefix: '/graphql' },
  });

  return server;
}

testSuite(createApp);
