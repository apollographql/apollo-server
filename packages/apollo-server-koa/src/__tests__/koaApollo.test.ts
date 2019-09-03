import testSuite, {
  NODE_MAJOR_VERSION,
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { GraphQLOptions, Config } from 'apollo-server-core';

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

async function destroyApp(app) {
  if (!app || !app.close) {
    return;
  }
  await new Promise(resolve => app.close(resolve));
}

// If we're on Node.js v6, skip this test, since `koa-bodyparser` has dropped
// support for it and there was an important update to it which we brought in
// through https://github.com/apollographql/apollo-server/pull/3229.
// It's worth noting that Node.js v6 has been out of Long-Term-Support status
// for four months and is no longer recommended by the Node.js Foundation.
(
  NODE_MAJOR_VERSION === 6 ?
  describe.skip :
  describe
)('koaApollo', () => {
  const { ApolloServer } = require('../ApolloServer');
  it('throws error if called without schema', function() {
    expect(() => new ApolloServer(undefined as GraphQLOptions)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

// If we're on Node.js v6, skip this test, since `koa-bodyparser` has dropped
// support for it and there was an important update to it which we brought in
// through https://github.com/apollographql/apollo-server/pull/3229.
// It's worth noting that Node.js v6 has been out of Long-Term-Support status
// for four months and is no longer recommended by the Node.js Foundation.
(
  NODE_MAJOR_VERSION === 6 ?
  describe.skip :
  describe
)('integration:Koa', () => {
  testSuite(createApp, destroyApp);
});
