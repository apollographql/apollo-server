import {
  testApolloServer,
  createServerInfo,
  createApolloFetch,
} from 'apollo-server-integration-testsuite';

import http = require('http');
import request from 'supertest';

import { Server } from '@hapi/hapi';

import { gql, AuthenticationError, Config } from 'apollo-server-core';
import { ApolloServer, ServerRegistration } from '../ApolloServer';

const port = 0;

describe('apollo-server-hapi', () => {
  let server: ApolloServer;

  let app: Server;
  let httpServer: http.Server;

  async function cleanup() {
    if (server) await server.stop();
    if (app) await app.stop();
    if (httpServer && httpServer.listening) httpServer.close();
  }
  afterEach(cleanup);

  testApolloServer(
    async (config: any, options) => {
      server = new ApolloServer(config);
      app = new Server({ host: 'localhost', port });
      if (!options?.suppressStartCall) {
        await server.start();
      }
      await server.applyMiddleware({ app, path: options?.graphqlPath });
      await app.start();
      const httpServer = app.listener;
      return createServerInfo(server, httpServer);
    },
    cleanup,
  );

  //Non-integration tests
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

  async function createServer(
    serverOptions: Config,
    options: Partial<ServerRegistration> = {},
  ) {
    server = new ApolloServer({
      stopOnTerminationSignals: false,
      ...serverOptions,
    });
    await server.start();
    app = new Server({ port: 0 });
    await server.applyMiddleware({ ...options, app });
    await app.start();

    return createServerInfo(server, app.listener);
  }

  afterEach(async () => {
    if (server) await server.stop();
    if (httpServer) await httpServer.close();
  });

  describe('constructor', () => {
    it('accepts typeDefs and resolvers', async () => {
      const app = new Server();
      const server = new ApolloServer({ typeDefs, resolvers });
      await server.start();
      return server.applyMiddleware({ app });
    });
  });

  describe('applyMiddleware', () => {
    it('can be queried', async () => {
      server = new ApolloServer({
        typeDefs,
        resolvers,
      });
      await server.start();
      app = new Server({ port });

      await server.applyMiddleware({ app });
      await app.start();

      httpServer = app.listener;
      const uri = app.info.uri + '/graphql';

      const apolloFetch = createApolloFetch({ uri });
      const result = await apolloFetch({ query: '{hello}' });

      expect(result.data).toEqual({ hello: 'hi' });
      expect(result.errors).toBeUndefined();
    });

    it('renders landing page by default when browser requests', async () => {
      const { httpServer } = await createServer({
        typeDefs,
        resolvers,
        __testing_nodeEnv__: undefined, // default landing page
      });

      await request(httpServer)
        .get('/graphql')
        .set(
          'accept',
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        )
        .expect(200, /apollo-server-landing-page.cdn.apollographql.com\/_latest/);
    });

    it('accepts cors configuration', async () => {
      server = new ApolloServer({
        typeDefs,
        resolvers,
      });
      await server.start();
      app = new Server({
        port,
      });

      await server.applyMiddleware({
        app,
        cors: {
          additionalExposedHeaders: ['X-Apollo'],
          exposedHeaders: [
            'Accept',
            'Authorization',
            'Content-Type',
            'If-None-Match',
            'Another-One',
          ],
        },
      });
      await app.start();

      httpServer = app.listener;
      const uri = app.info.uri + '/graphql';

      const apolloFetch = createApolloFetch({ uri }).useAfter(
        (response, next) => {
          expect(
            response.response.headers.get('access-control-expose-headers'),
          ).toEqual(
            'Accept,Authorization,Content-Type,If-None-Match,Another-One,X-Apollo',
          );
          next();
        },
      );
      await apolloFetch({ query: '{hello}' });
    });

    it('accepts custom route configuration', async () => {
      server = new ApolloServer({
        typeDefs,
        resolvers,
      });
      await server.start();
      app = new Server({
        port,
      });

      await server.applyMiddleware({
        app,
        route: {
          cors: {
            additionalExposedHeaders: ['X-Apollo'],
            exposedHeaders: [
              'Accept',
              'Authorization',
              'Content-Type',
              'If-None-Match',
              'Another-One',
            ],
          },
        },
      });

      await app.start();

      httpServer = app.listener;
      const uri = app.info.uri + '/graphql';

      const apolloFetch = createApolloFetch({ uri }).useAfter(
        (response, next) => {
          expect(
            response.response.headers.get('access-control-expose-headers'),
          ).toEqual(
            'Accept,Authorization,Content-Type,If-None-Match,Another-One,X-Apollo',
          );
          next();
        },
      );

      await apolloFetch({ query: '{hello}' });
    });

    it('passes each request and response toolkit through to the context function', async () => {
      const context = async ({ request, h }: any) => {
        expect(request).toBeDefined();
        expect(h).toBeDefined();
        return {};
      };

      server = new ApolloServer({
        typeDefs,
        resolvers,
        context,
      });
      await server.start();
      app = new Server({ port });

      await server.applyMiddleware({ app });
      await app.start();

      httpServer = app.listener;
      const uri = app.info.uri + '/graphql';

      const apolloFetch = createApolloFetch({ uri });
      const result = await apolloFetch({ query: '{hello}' });

      expect(result.data).toEqual({ hello: 'hi' });
      expect(result.errors).toBeUndefined();
    });

    describe('healthchecks', () => {
      afterEach(async () => {
        await server.stop();
      });

      it('creates a healthcheck endpoint', async () => {
        const { httpServer } = await createServer({
          typeDefs,
          resolvers,
        });

        await request(httpServer)
          .get('/.well-known/apollo/server-health')
          .expect(200, { status: 'pass' });
      });

      it('provides a callback for the healthcheck', async () => {
        const { httpServer } = await createServer(
          {
            typeDefs,
            resolvers,
          },
          {
            onHealthCheck: async () => {
              throw Error("can't connect to DB");
            },
          },
        );

        await request(httpServer)
          .get('/.well-known/apollo/server-health')
          .expect(503, { status: 'fail' });
      });

      it('can disable the healthCheck', async () => {
        const { httpServer } = await createServer(
          {
            typeDefs,
            resolvers,
          },
          {
            disableHealthCheck: true,
          },
        );

        await request(httpServer)
          .get('/.well-known/apollo/server-health')
          .expect(404);
      });
    });

    describe('errors', () => {
      it('returns thrown context error as a valid graphql result', async () => {
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;
        const resolvers = {
          Query: {
            hello: () => {
              throw Error('never get here');
            },
          },
        };
        const { url: uri } = await createServer({
          typeDefs,
          resolvers,
          context: () => {
            throw new AuthenticationError('valid result');
          },
          // Stack trace not included for NODE_ENV=test
          __testing_nodeEnv__: undefined,
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: '{hello}' });
        expect(result.errors.length).toEqual(1);
        expect(result.data).toBeUndefined();

        const e = result.errors[0];
        expect(e.message).toMatch('valid result');
        expect(e.extensions).toBeDefined();
        expect(e.extensions.code).toEqual('UNAUTHENTICATED');
        expect(e.extensions.exception.stacktrace).toBeDefined();
      });

      it('propogates error codes in dev mode', async () => {
        const { url: uri } = await createServer({
          typeDefs: gql`
            type Query {
              error: String
            }
          `,
          resolvers: {
            Query: {
              error: () => {
                throw new AuthenticationError('we the best music');
              },
            },
          },
          // Stack trace not included for NODE_ENV=test
          __testing_nodeEnv__: undefined,
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{error}` });
        expect(result.data).toBeDefined();
        expect(result.data).toEqual({ error: null });

        expect(result.errors).toBeDefined();
        expect(result.errors.length).toEqual(1);
        expect(result.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).toBeDefined();
        expect(result.errors[0].extensions.exception.stacktrace).toBeDefined();
      });

      it('propogates error codes in production', async () => {
        const { url: uri } = await createServer({
          typeDefs: gql`
            type Query {
              error: String
            }
          `,
          resolvers: {
            Query: {
              error: () => {
                throw new AuthenticationError('we the best music');
              },
            },
          },
          __testing_nodeEnv__: 'production',
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{error}` });
        expect(result.data).toBeDefined();
        expect(result.data).toEqual({ error: null });

        expect(result.errors).toBeDefined();
        expect(result.errors.length).toEqual(1);
        expect(result.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).toBeUndefined();
      });

      it('propogates error codes with null response in production', async () => {
        const { url: uri } = await createServer({
          typeDefs: gql`
            type Query {
              error: String!
            }
          `,
          resolvers: {
            Query: {
              error: () => {
                throw new AuthenticationError('we the best music');
              },
            },
          },
          __testing_nodeEnv__: 'production',
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{error}` });
        expect(result.data).toBeNull();

        expect(result.errors).toBeDefined();
        expect(result.errors.length).toEqual(1);
        expect(result.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).toBeUndefined();
      });
    });
  });
});
