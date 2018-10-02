const NODE_VERSION = process.version.split('.');
const NODE_MAJOR_VERSION = parseInt(NODE_VERSION[0].replace(/^v/, ''));

// Skip fastify tests for unsupported versions of node
if (NODE_MAJOR_VERSION < 8) {
  it('does not run for node versions < 8', () => {});
  return;
}

import fastify from 'fastify';
import http from 'http';

import { gql, Config } from 'apollo-server-core';
import { ApolloServer, ServerRegistration } from '../ApolloServer';

import { createServerInfo } from 'apollo-server-integration-testsuite';

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello: () => 'hi',
  },
};

const port = 6666;

describe('apollo-server-fastify', () => {
  let server: ApolloServer;

  let app: fastify.FastifyInstance;
  let httpServer: http.Server;

  async function createServer(
    serverOptions: Config,
    options: Partial<ServerRegistration> = {},
  ) {
    server = new ApolloServer(serverOptions);
    app = fastify();

    server.applyMiddleware({ ...options, app });

    try {
      await app.listen(port);
    } catch (err) {
      app.log.error('error in starting server', err);
      process.exit(1);
    }
    httpServer = await app.server;
    return createServerInfo(server, httpServer);
  }

  afterEach(async () => {
    if (server) await server.stop();
    if (httpServer) await httpServer.close();
  });

  describe('constructor', () => {
    it('accepts typeDefs and resolvers', () => {
      return createServer({ typeDefs, resolvers });
    });
  });
});
