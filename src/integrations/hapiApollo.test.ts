import * as hapi from 'hapi';
import { apolloHapi, graphiqlHapi, HapiPluginOptions } from './hapiApollo';

import testSuite, { Schema } from './integrations.test';

function createApp(createOptions: HapiPluginOptions) {
  const server = new hapi.Server();

  server.connection({
      host: 'localhost',
      port: 8000,
  });

  server.register({
      register: apolloHapi,
      options: {
        apolloOptions: createOptions ? createOptions.apolloOptions : { schema: Schema },
        path: '/graphql',
      },
  });

  server.register({
      register: graphiqlHapi,
      options: {
        path: '/graphiql',
        graphiqlOptions: {
          endpointURL: '/graphql',
        },
      },
  });

  return server.listener;
}

describe('integration:Hapi', () => {
  testSuite(createApp);
});
