import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';

function createApp(options: CreateAppOptions = {}) {
  const Koa = require('koa');
  const { ApolloServer } = require('../ApolloServer');
  const app = new Koa();

  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );
  server.applyMiddleware({ app });
  return app.listen();
}

async function destroyApp(app: any) {
  if (!app || !app.close) {
    return;
  }
  await new Promise(resolve => app.close(resolve));
}

describe('koaApollo', () => {
  const { ApolloServer } = require('../ApolloServer');
  it('throws error if called without schema', function() {
    expect(() => new ApolloServer(undefined as any)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

describe('integration:Koa', () => {
  testSuite(createApp, destroyApp);
});
