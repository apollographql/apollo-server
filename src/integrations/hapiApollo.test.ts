import * as hapi from 'hapi';
import { ApolloHapi, GraphiQLHapi, HapiPluginOptions } from './hapiApollo';

import testSuite, { Schema } from './integrations.test';

function createApp(createOptions: HapiPluginOptions) {
  const server = new hapi.Server();

  server.connection({
      host: 'localhost',
      port: 8000,
  });

  server.register({
      register: ApolloHapi,
      options: {
        apolloOptions: createOptions ? createOptions.apolloOptions : { schema: Schema },
        path: '/graphql',
      },
  });

  server.register({
      register: GraphiQLHapi,
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
