import * as hapi from 'hapi';
import { ApolloHAPI, GraphiQLHAPI, HAPIPluginOptions } from './hapiApollo';

import testSuite, { Schema } from './integrations.test';

function createApp(createOptions: HAPIPluginOptions) {
  const server = new hapi.Server();

  server.connection({
      host: 'localhost',
      port: 8000,
  });

  server.register({
      register: ApolloHAPI,
      options: {
        apolloOptions: createOptions ? createOptions.apolloOptions : { schema: Schema },
        path: '/graphql',
      },
  });

  server.register({
      register: GraphiQLHAPI,
      options: {
        path: '/graphiql',
        graphiqlOptions: {
          endpointURL: '/graphql',
        },
      },
  });

  return server.listener;
}

describe('integration:HAPI', () => {
  testSuite(createApp);
});
