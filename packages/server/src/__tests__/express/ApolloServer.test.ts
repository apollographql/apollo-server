import type { BaseContext } from '@apollo/server-types';
import { OptionsJson, json } from 'body-parser';
import cors from 'cors';
import express from 'express';

import http from 'http';

import request from 'supertest';

import { gql, ApolloServerPluginDrainHttpServer, ApolloServer } from '../..';
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
  testApolloServer(
    async (config: ApolloServerOptions<BaseContext>, options) => {
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
      }
      const graphqlPath = options?.graphqlPath ?? '/graphql';
      app.use(
        graphqlPath,
        cors<cors.CorsRequest>(),
        json(),
        expressMiddleware(server, {
          context: options?.context,
        }),
      );
      await new Promise((resolve) => {
        httpServer.once('listening', resolve);
        httpServer.listen({ port: 0 });
      });
      return createServerInfo(server, httpServer, graphqlPath);
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
          context: options?.context,
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

  describe('applyMiddleware', () => {
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
  });
});
