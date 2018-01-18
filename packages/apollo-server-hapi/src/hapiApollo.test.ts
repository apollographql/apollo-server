import * as hapi from 'hapi';
import { graphqlHapi, graphiqlHapi } from './hapiApollo';
import 'mocha';

import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';

async function createApp(options: CreateAppOptions) {
  const server = new hapi.Server({
    host: 'localhost',
    port: 8000,
  });

  await server.register({
    plugin: graphqlHapi,
    options: {
      graphqlOptions: (options && options.graphqlOptions) || { schema: Schema },
      path: '/graphql',
    },
  });

  await server.register({
    plugin: graphiqlHapi,
    options: {
      path: '/graphiql',
      graphiqlOptions: (options && options.graphiqlOptions) || {
        endpointURL: '/graphql',
      },
    },
  });

  await server.start();

  return server.listener;
}

async function destroyApp(app) {
  if (!app || !app.close) {
    return;
  }
  await new Promise(resolve => app.close(resolve));
}

describe('integration:Hapi', () => {
  testSuite(createApp, destroyApp);
});
