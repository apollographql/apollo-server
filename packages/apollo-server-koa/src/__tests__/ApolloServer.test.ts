import http from 'http';
import Koa from 'koa';
import request from 'supertest';

import {
  gql,
  AuthenticationError,
  Config,
  ApolloServerPluginCacheControlDisabled,
  ApolloServerPluginDrainHttpServer,
} from 'apollo-server-core';

import {
  testApolloServer,
  createServerInfo,
  createApolloFetch,
} from 'apollo-server-integration-testsuite';
import type { ApolloServer } from '../ApolloServer';

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

describe('apollo-server-koa', () => {
  const { ApolloServer } = require('../ApolloServer');
  let serverToCleanUp: ApolloServer | null = null;
  testApolloServer(
    async (config: any, options) => {
      serverToCleanUp = null;
      const httpServer = http.createServer();
      const server = new ApolloServer({
        ...config,
        plugins: [
          ...(config.plugins ?? []),
          ApolloServerPluginDrainHttpServer({
            httpServer: httpServer,
          }),
        ],
      });
      if (!options?.suppressStartCall) {
        await server.start();
        serverToCleanUp = server;
      }
      const app = new Koa();
      server.applyMiddleware({ app, path: options?.graphqlPath });
      httpServer.on('request', app.callback());
      await new Promise<void>((resolve) => {
        httpServer.listen({ port: 0 }, () => resolve());
      });
      return createServerInfo(server, httpServer);
    },
    async () => {
      await serverToCleanUp?.stop();
    },
  );
});

describe('apollo-server-koa', () => {
  const Koa = require('koa');
  const { ApolloServer } = require('../ApolloServer');
  let server: import('../ApolloServer').ApolloServer;
  let app: import('koa');
  let httpServer: http.Server;

  async function createServer(
    serverOptions: Config,
    options: Partial<import('../ApolloServer').ServerRegistration> = {},
  ) {
    server = new ApolloServer({
      stopOnTerminationSignals: false,
      ...serverOptions,
    });
    await server.start();
    app = new Koa();

    server.applyMiddleware({ ...options, app });

    httpServer = await new Promise((resolve) => {
      const l: http.Server = app.listen({ port: 0 }, () => resolve(l));
    });

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
          cors: { origin: 'apollographql.com' },
        },
      );

      const apolloFetch = createApolloFetch({ uri })
        .use(({ options }, next) => {
          if (!options.headers) {
            options.headers = {}; // Create the headers object if needed.
          }
          (options.headers as any)['origin'] = 'apollographql.com';

          next();
        })
        .useAfter((response, next) => {
          expect(
            response.response.headers.get('access-control-allow-origin'),
          ).toEqual('apollographql.com');
          next();
        });
      await apolloFetch({ query: '{hello}' });
    });

    it('accepts body parser configuration', async () => {
      const { url: uri } = await createServer(
        {
          typeDefs,
          resolvers,
        },
        {
          bodyParserConfig: { jsonLimit: '0' },
        },
      );

      const apolloFetch = createApolloFetch({ uri });

      return new Promise<void>((resolve, reject) => {
        apolloFetch({ query: '{hello}' })
          .then(reject)
          .catch((error) => {
            expect(error.response).toBeDefined();
            expect(error.response.status).toEqual(413);
            expect(error.toString()).toMatch('Payload Too Large');
            resolve();
          });
      });
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

  describe('extensions', () => {
    const books = [
      {
        title: 'H',
        author: 'J',
      },
    ];

    const typeDefs = gql`
      type Book {
        title: String
        author: String
      }

      type Cook @cacheControl(maxAge: 200) {
        title: String
        author: String
      }

      type Pook @cacheControl(maxAge: 200) {
        title: String
        books: [Book] @cacheControl(maxAge: 20, scope: PRIVATE)
      }

      type Query {
        books: [Book]
        cooks: [Cook]
        pooks: [Pook]
      }

      enum CacheControlScope {
        PUBLIC
        PRIVATE
      }

      directive @cacheControl(
        maxAge: Int
        scope: CacheControlScope
      ) on FIELD_DEFINITION | OBJECT | INTERFACE
    `;

    const resolvers = {
      Query: {
        books: () => books,
        cooks: () => books,
        pooks: () => [{ title: 'pook', books }],
      },
    };

    describe('Cache Control Headers', () => {
      it('applies cacheControl Headers', async () => {
        const { url: uri } = await createServer({ typeDefs, resolvers });

        const apolloFetch = createApolloFetch({ uri }).useAfter(
          (response, next) => {
            expect(response.response.headers.get('cache-control')).toEqual(
              'max-age=200, public',
            );
            next();
          },
        );
        const result = await apolloFetch({
          query: `{ cooks { title author } }`,
        });
        expect(result.data).toEqual({ cooks: books });
      });

      it('contains no cacheControl Headers when uncacheable', async () => {
        const { url: uri } = await createServer({ typeDefs, resolvers });

        const apolloFetch = createApolloFetch({ uri }).useAfter(
          (response, next) => {
            expect(response.response.headers.get('cache-control')).toBeNull();
            next();
          },
        );
        const result = await apolloFetch({
          query: `{ books { title author } }`,
        });
        expect(result.data).toEqual({ books });
      });

      it('contains private cacheControl Headers when scoped', async () => {
        const { url: uri } = await createServer({ typeDefs, resolvers });

        const apolloFetch = createApolloFetch({ uri }).useAfter(
          (response, next) => {
            expect(response.response.headers.get('cache-control')).toEqual(
              'max-age=20, private',
            );
            next();
          },
        );
        const result = await apolloFetch({
          query: `{ pooks { title books { title author } } }`,
        });
        expect(result.data).toEqual({
          pooks: [{ title: 'pook', books }],
        });
      });

      it('runs when cache-control is false', async () => {
        const { url: uri } = await createServer({
          typeDefs,
          resolvers,
          plugins: [ApolloServerPluginCacheControlDisabled()],
        });

        const apolloFetch = createApolloFetch({ uri }).useAfter(
          (response, next) => {
            expect(response.response.headers.get('cache-control')).toBeNull();
            next();
          },
        );
        const result = await apolloFetch({
          query: `{ pooks { title books { title author } } }`,
        });
        expect(result.data).toEqual({
          pooks: [{ title: 'pook', books }],
        });
      });
    });
  });
});
