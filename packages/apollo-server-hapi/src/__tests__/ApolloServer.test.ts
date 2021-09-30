import {
  testApolloServer,
  createServerInfo,
  createApolloFetch,
} from 'apollo-server-integration-testsuite';

import request from 'supertest';

import Hapi from '@hapi/hapi';

import { gql, AuthenticationError, Config } from 'apollo-server-core';
import {
  ApolloServer,
  ApolloServerPluginStopHapiServer,
  ServerRegistration,
} from '../ApolloServer';

const port = 0;

describe('apollo-server-hapi', () => {
  let serverToCleanUp: ApolloServer | null = null;

  testApolloServer(
    async (config: any, options) => {
      serverToCleanUp = null;
      const app = Hapi.server({ host: 'localhost', port });
      const server = new ApolloServer({
        ...config,
        plugins: [
          ...(config.plugins ?? []),
          ApolloServerPluginStopHapiServer({
            hapiServer: app,
          }),
        ],
      });
      if (!options?.suppressStartCall) {
        await server.start();
        serverToCleanUp = server;
      }
      await server.applyMiddleware({ app, path: options?.graphqlPath });
      await app.start();
      const httpServer = app.listener;
      return createServerInfo(server, httpServer);
    },
    async () => {
      await serverToCleanUp?.stop();
    },
  );
});

describe('non-integration tests', () => {
  let serverToCleanUp: ApolloServer | null = null;

  beforeEach(() => {
    serverToCleanUp = null;
  });
  afterEach(async () => {
    await serverToCleanUp?.stop();
  });

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
    const app = Hapi.server({ port: 0 });
    const server = new ApolloServer({
      stopOnTerminationSignals: false,
      ...serverOptions,
      plugins: [
        ...(serverOptions.plugins ?? []),
        ApolloServerPluginStopHapiServer({
          hapiServer: app,
        }),
      ],
    });
    await server.start();
    serverToCleanUp = server;
    await server.applyMiddleware({ ...options, app });
    await app.start();

    return createServerInfo(server, app.listener);
  }

  describe('constructor', () => {
    it('accepts typeDefs and resolvers', async () => {
      return createServer({ typeDefs, resolvers });
    });
  });

  describe('applyMiddleware', () => {
    it('can be queried', async () => {
      const { url: uri } = await createServer({
        typeDefs,
        resolvers,
      });
      const apolloFetch = createApolloFetch({ uri });
      const result = await apolloFetch({ query: '{hello}' });

      expect(result.data).toEqual({ hello: 'hi' });
      expect(result.errors).toBeUndefined();
    });

    it('renders landing page by default when browser requests', async () => {
      const { httpServer } = await createServer({
        typeDefs,
        resolvers,
        nodeEnv: '', // default landing page
      });

      await request(httpServer)
        .get('/graphql')
        .set(
          'accept',
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        )
        .expect(
          200,
          /apollo-server-landing-page.cdn.apollographql.com\/_latest/,
        );
    });

    it('accepts cors configuration', async () => {
      const { url: uri } = await createServer(
        {
          typeDefs,
          resolvers,
        },
        {
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
      );

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
      const { url: uri } = await createServer(
        {
          typeDefs,
          resolvers,
        },
        {
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
        },
      );

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

      const { url: uri } = await createServer({
        typeDefs,
        resolvers,
        context,
      });

      const apolloFetch = createApolloFetch({ uri });
      const result = await apolloFetch({ query: '{hello}' });

      expect(result.data).toEqual({ hello: 'hi' });
      expect(result.errors).toBeUndefined();
    });

    describe('healthchecks', () => {
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
          nodeEnv: '',
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

      it('propagates error codes in dev mode', async () => {
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
          nodeEnv: '',
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

      it('propagates error codes in production', async () => {
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
          nodeEnv: 'production',
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

      it('propagates error codes with null response in production', async () => {
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
          nodeEnv: 'production',
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
