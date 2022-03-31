import type { BaseContext } from '@apollo/server-types';
import { OptionsJson, json } from 'body-parser';
import cors from 'cors';
import express from 'express';

import http from 'http';

import request from 'supertest';

import {
  gql,
  AuthenticationError,
  ApolloServerPluginCacheControlDisabled,
  ApolloServerPluginDrainHttpServer,
  ApolloServer,
} from '../..';
import { ExpressContext, expressMiddleware } from '../../express';
import type { ApolloServerOptions } from '../../types';

import {
  testApolloServer,
  createServerInfo,
  createApolloFetch,
} from '../integration';

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

describe('apollo-server-express', () => {
  let serverToCleanUp: ApolloServer | null = null;
  testApolloServer(
    async (config: ApolloServerOptions<BaseContext>, options) => {
      serverToCleanUp = null;
      const app = express();
      const httpServer = http.createServer(app);
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
      const graphqlPath = options?.graphqlPath ?? '/graphql';
      app.use(
        graphqlPath,
        cors<cors.CorsRequest>(),
        json(),
        expressMiddleware(server, {
          contextFunction: options?.context,
        }),
      );
      await new Promise((resolve) => {
        httpServer.once('listening', resolve);
        httpServer.listen({ port: 0 });
      });
      return createServerInfo(server, httpServer, graphqlPath);
    },
    async () => {
      await serverToCleanUp?.stop();
    },
  );
});

describe('apollo-server-express', () => {
  let server: ApolloServer;

  let app: express.Application;
  let httpServer: http.Server;

  async function createServer(
    serverOptions: ApolloServerOptions<BaseContext>,
    options?: {
      context?: (expressContext: ExpressContext) => Promise<BaseContext>;
      skipBodyParser?: true;
      bodyParserConfig?: OptionsJson;
    },
  ) {
    server = new ApolloServer({
      stopOnTerminationSignals: false,
      ...serverOptions,
    });
    await server.start();
    app = express();
    app.use(
      '/graphql',
      ...[
        cors(),
        ...(options?.skipBodyParser
          ? []
          : options?.bodyParserConfig
          ? [json(options.bodyParserConfig)]
          : [json()]),
        expressMiddleware(server, {
          contextFunction: options?.context ?? (async () => ({})),
        }),
      ],
    );

    httpServer = await new Promise<http.Server>((resolve) => {
      const l: http.Server = app.listen({ port: 0 }, () => resolve(l));
    });

    return createServerInfo(server, httpServer, '/graphql');
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

    it('accepts body parser configuration', async () => {
      const { url: uri } = await createServer(
        {
          typeDefs,
          resolvers,
        },
        {
          bodyParserConfig: { limit: 0 },
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

    it('gives helpful error if body is not parsed', async () => {
      const { httpServer } = await createServer(
        {
          typeDefs,
          resolvers,
        },
        { skipBodyParser: true },
      );

      await request(httpServer)
        .post('/graphql')
        .send({ query: '{hello}' })
        .expect(500, /forgot to set up the `body-parser`/);
    });

    describe('errors', () => {
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

      it('runs when cache-control is disabled', async () => {
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
