import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastify from 'fastify';
import request from 'supertest';

import {
  gql,
  AuthenticationError,
  Config,
  ApolloServerPluginCacheControlDisabled,
  ApolloServerPluginDrainHttpServer,
} from 'apollo-server-core';
import { ApolloServer, ServerRegistration } from '../ApolloServer';

import {
  testApolloServer,
  createServerInfo,
  createApolloFetch,
} from 'apollo-server-integration-testsuite';
import type { ApolloServerPlugin } from 'apollo-server-plugin-base';

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

const port = 9999;

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

describe('apollo-server-fastify', () => {
  let serverToCleanUp: ApolloServer | null = null;

  testApolloServer(
    async (config: any, options) => {
      serverToCleanUp = null;
      const app = fastify();
      const server = new ApolloServer({
        ...config,
        plugins: [
          ...(config.plugins ?? []),
          // I *think* racing these two plugins against each other works.
          // They will both end up calling server.close, and one will
          // get ERR_SERVER_NOT_RUNNING, but our stoppable implementation
          // ignores errors from close. An alternative would be to use
          // Fastify's serverFactory to return a server whose 'close' actually
          // does the stoppable stuff. (The tests do seem to pass without this
          // close call, but it seems like a good idea to invoke app.close in
          // case the user registered any onClose hooks?)
          fastifyAppClosePlugin(app),
          ApolloServerPluginDrainHttpServer({
            httpServer: app.server,
          }),
        ],
      });
      if (!options?.suppressStartCall) {
        await server.start();
        serverToCleanUp = server;
      }
      app.register(server.createHandler({ path: options?.graphqlPath }));
      await app.listen(port);
      return createServerInfo(server, app.server);
    },
    async () => {
      await serverToCleanUp?.stop();
    },
  );
});

describe('apollo-server-fastify', () => {
  let server: ApolloServer;
  let replyDecorator: jest.Mock | undefined;
  let requestDecorator: jest.Mock | undefined;

  async function createServer(
    serverOptions: Config,
    options: Partial<ServerRegistration> = {},
    mockDecorators: boolean = false,
  ) {
    const app = fastify();
    server = new ApolloServer({
      stopOnTerminationSignals: false,
      ...serverOptions,
      plugins: [
        ...(serverOptions.plugins ?? []),
        fastifyAppClosePlugin(app),
        ApolloServerPluginDrainHttpServer({
          httpServer: app.server,
        }),
      ],
    });
    await server.start();

    if (mockDecorators) {
      replyDecorator = jest.fn();
      requestDecorator = jest.fn();

      app.decorateReply('replyDecorator', replyDecorator);
      app.decorateRequest('requestDecorator', requestDecorator);
    }

    app.register(server.createHandler(options));
    await app.listen(port);

    return createServerInfo(server, app.server);
  }

  afterEach(async () => {
    await server?.stop();
  });

  describe('constructor', () => {
    it('accepts typeDefs and resolvers', () => {
      return createServer({ typeDefs, resolvers });
    });
  });

  describe('createGraphQLServerOptions', () => {
    it('provides FastifyRequest and FastifyReply to ContextFunction', async () => {
      interface ContextArgs {
        request: FastifyRequest & {
          requestDecorator: () => any;
        };
        reply: FastifyReply & { replyDecorator: () => any };
      }

      const context = ({ request, reply }: ContextArgs) => {
        request!.requestDecorator();
        reply!.replyDecorator();
        return {};
      };

      const { url: uri } = await createServer(
        { typeDefs, resolvers, context },
        {},
        true,
      );

      const apolloFetch = createApolloFetch({ uri });
      await apolloFetch({ query: '{hello}' });

      expect(requestDecorator!.mock.calls.length).toEqual(1);
      expect(replyDecorator!.mock.calls.length).toEqual(1);
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
        __testing_nodeEnv__: undefined, // default landing page
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

      const apolloFetch = createApolloFetch({ uri }).useAfter(
        (response, next) => {
          expect(
            response.response.headers.get('access-control-allow-origin'),
          ).toEqual('apollographql.com');
          next();
        },
      );
      await apolloFetch({ query: '{hello}' });
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

      it('contains no cacheControl Headers when uncachable', async () => {
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
