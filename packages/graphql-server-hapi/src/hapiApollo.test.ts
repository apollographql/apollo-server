import * as hapi from 'hapi';
import { graphqlHapi, graphiqlHapi } from './hapiApollo';
import 'mocha';

import testSuite, { schema as Schema, CreateAppOptions  } from 'graphql-server-integration-testsuite';

function createApp(options: CreateAppOptions) {
  const server = new hapi.Server();

  server.connection({
      host: 'localhost',
      port: 8000,
  });

  server.register({
      register: graphqlHapi,
      options: {
        graphqlOptions: (options && options.graphqlOptions) || { schema: Schema },
        path: '/graphql',
      },
  });

  server.register({
      register: graphiqlHapi,
      options: {
        path: '/graphiql',
        graphiqlOptions: (options && options.graphiqlOptions) || { endpointURL: '/graphql' },
      },
  });

  return server.listener;
}

describe('integration:Hapi', () => {
  testSuite(createApp);
});
