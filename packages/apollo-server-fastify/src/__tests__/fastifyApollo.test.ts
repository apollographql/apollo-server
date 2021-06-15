import fastify from 'fastify';
import { Server } from 'http';
import { ApolloServer } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import { Config } from 'apollo-server-core';

async function createApp(options: CreateAppOptions = {}) {
  const app = fastify();

  const server = new ApolloServer(
    (options.graphqlOptions as Config) || { schema: Schema },
  );
  await server.start();

  app.register(server.createHandler());
  await app.listen(0);

  return app.server;
}

async function destroyApp(app: Server) {
  if (!app || !app.close) {
    return;
  }
  await new Promise((resolve) => app.close(resolve));
}

describe('fastifyApollo', () => {
  it('throws error if called without schema', function () {
    expect(() => new ApolloServer(undefined as any)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

describe('integration:Fastify', () => {
  testSuite({ createApp, destroyApp, integrationName: 'fastify' });
});
