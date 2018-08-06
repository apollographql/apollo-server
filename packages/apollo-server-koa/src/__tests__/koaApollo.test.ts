import * as Koa from 'koa';
import { ApolloServer } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { GraphQLOptions, Config } from 'apollo-server-core';

function createApp(options: CreateAppOptions = {}) {
  const app = new Koa();

  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );
  server.applyMiddleware({ app });
  return app.listen();
}

async function destroyApp(app) {
  if (!app || !app.close) {
    return;
  }
  await new Promise(resolve => app.close(resolve));
}

describe('koaApollo', () => {
  it('throws error if called without schema', function() {
    expect(() => new ApolloServer(undefined as GraphQLOptions)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

describe('integration:Koa', () => {
  testSuite(createApp, destroyApp);
});
