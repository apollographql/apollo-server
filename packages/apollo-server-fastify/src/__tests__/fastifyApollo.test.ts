import fastify from 'fastify';
import { FastifyInstance } from 'fastify';
import { ApolloServer } from '../ApolloServer';
import { graphqlFastify } from '../fastifyApollo';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { GraphQLOptions, Config } from 'apollo-server-core';

async function createApp(options: CreateAppOptions = {}) {
  const app = fastify();

  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );
  await server.applyMiddleware({ app });

  try {
    await app.listen(3007);
  } catch (err) {
    app.log.error('error in starting server', err);
    process.exit(1);
  }

  return app.server;
}

async function destroyApp(app: any) {
  if (!app || !app.close) {
    return;
  }
  await new Promise(cb => app.close(cb));
}

describe('fastifyApollo', () => {
  it('throws error if called without schema', function() {
    expect(() =>
      graphqlFastify(
        {} as FastifyInstance,
        undefined as GraphQLOptions,
        undefined,
      ),
    ).toThrow('Apollo Server requires options.');
  });

  it('throws an error if called with argument not equal to 3', function() {
    expect(() => (<any>graphqlFastify)({}, { graphqlOptions: {} })).toThrow(
      'Apollo Server expects exactly 3 argument, got 2',
    );
  });
});

// Uncomment this to see the breaking tests
describe('integration:Fastify', () => {
  testSuite(createApp, destroyApp);
});
