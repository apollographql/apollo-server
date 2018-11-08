import Route from '@adonisjs/framework/src/Route/Manager';
import { ApolloServer } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { GraphQLOptions, Config } from 'apollo-server-core';
import request from 'supertest';
import createAdonisServer from './createAdonisServer';

function createApp(options: CreateAppOptions = {}) {
  const server = createAdonisServer();

  const apollo = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );
  apollo.registerRoutes({ Route });

  return server.listen(3333);
}

async function destroyApp(app) {
  if (!app || !app.close) {
    return;
  }
  await new Promise(resolve => app.close(resolve));
}

describe('adonisApollo', () => {
  it('throws error if called without schema', function() {
    expect(() => new ApolloServer(undefined as GraphQLOptions)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

describe('integration:Adonis', () => {
  testSuite(createApp, destroyApp);
});
