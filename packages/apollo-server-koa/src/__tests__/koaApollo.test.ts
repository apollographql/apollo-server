import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';

async function createApp(options: CreateAppOptions = {}) {
  const Koa = require('koa');
  const { ApolloServer } = require('../ApolloServer');
  const app = new Koa();
  // Let's have errors be exposed to "users" instead of logged
  // since it's a pain for us to check logs generically in this
  // test suite.
  app.on('error', (e: any) => {
    e.expose = true;
  });

  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );
  await server.start();
  server.applyMiddleware({ app });
  return app.listen();
}

async function destroyApp(app: any) {
  if (!app || !app.close) {
    return;
  }
  await new Promise((resolve) => app.close(resolve));
}

describe('koaApollo', () => {
  const { ApolloServer } = require('../ApolloServer');
  it('throws error if called without schema', function () {
    expect(() => new ApolloServer(undefined as any)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

describe('integration:Koa', () => {
  testSuite({ createApp, destroyApp, integrationName: 'koa' });
});
