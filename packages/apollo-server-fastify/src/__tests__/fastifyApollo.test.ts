import fastify, { FastifyInstance } from 'fastify';
import { ApolloServer } from '../ApolloServer';
import testSuite, {
  schema as Schema,
  CreateAppOptions,
} from 'apollo-server-integration-testsuite';
import type { Config } from 'apollo-server-core';
import type { ApolloServerPlugin } from 'apollo-server-plugin-base';

describe('fastifyApollo', () => {
  it('throws error if called without schema', function () {
    expect(() => new ApolloServer(undefined as any)).toThrow(
      'ApolloServer requires options.',
    );
  });
});

function fastifyAppClosePlugin(app: FastifyInstance): ApolloServerPlugin {
  return {
    async serverWillStart() {
      return {
        async drainServer() {
          await app.close();
        },
      };
    },
  };
}

describe('integration:Fastify', () => {
  let serverToCleanUp: ApolloServer | null = null;
  let app: FastifyInstance | null = null;
  testSuite({
    async createApp(options: CreateAppOptions = {}) {
      serverToCleanUp = null;
      app = fastify();
      const config = (options.graphqlOptions as Config) || { schema: Schema };
      const server = new ApolloServer({
        ...config,
        plugins: [...(config.plugins ?? []), fastifyAppClosePlugin(app)],
      });
      await server.start();
      serverToCleanUp = server;
      app.register(server.createHandler());
      await app.listen(0);

      return app.server;
    },
    async destroyApp() {
      await serverToCleanUp?.stop();
    },
    integrationName: 'fastify',
  });
});
