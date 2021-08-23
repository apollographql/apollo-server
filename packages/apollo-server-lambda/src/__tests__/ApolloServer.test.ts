import http from 'http';
import request from 'supertest';
import express from 'express';
import { createMockServer } from './mockAPIGatewayServer';
import {
  ApolloServerPluginDrainHttpServer,
  Config,
  gql,
} from 'apollo-server-core';
import {
  ApolloServer,
  CreateHandlerOptions,
  LambdaContextFunctionParams,
} from '../ApolloServer';
import {
  createServerInfo,
  testApolloServer,
} from 'apollo-server-integration-testsuite';

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

describe('apollo-server-lambda', () => {
  let serverToCleanUp: ApolloServer | null = null;
  testApolloServer(
    async (config: Config, options) => {
      serverToCleanUp = null;
      const httpServer = http.createServer();
      const server = new ApolloServer({
        ...config,
        plugins: [
          ...(config.plugins ?? []),
          // You don't typically need to use this plugin in a real Lambda
          // environment, but our test harness sets up an http.Server, so we use
          // it here.
          ApolloServerPluginDrainHttpServer({
            httpServer: httpServer,
          }),
        ],
      });
      // Ignore suppressStartCall because serverless ApolloServers don't
      // get manually `start`ed. However, if no requests will be made then
      // it won't get `start`ed and that's the condition we need to use to
      // decide whether or not to `stop`.
      if (!options?.noRequestsMade) {
        serverToCleanUp = server;
      }
      const lambdaHandler = server.createHandler({
        expressGetMiddlewareOptions: { path: options?.graphqlPath },
      });
      httpServer.on('request', createMockServer(lambdaHandler));
      await new Promise<void>((resolve) => {
        httpServer.listen({ port: 0 }, () => resolve());
      });
      const serverInfo = createServerInfo(server, httpServer);
      if (options?.noRequestsMade) {
        // Since no requests will be made (and the server won't even start), we
        // immediately close the HTTP server. (We made it at all so we can have
        // a typesafe return value from this function, though the only test that
        // uses this mode ignores the return value from this function.)
        await new Promise<void>((resolve) => httpServer.close(() => resolve()));
      }
      return serverInfo;
    },
    async () => {
      await serverToCleanUp?.stop();
    },
    { serverlessFramework: true },
  );

  const createLambda = (
    createHandlerOptions: CreateHandlerOptions = {},
    config: Config<LambdaContextFunctionParams> = { typeDefs, resolvers },
  ) => {
    const server = new ApolloServer(config);
    const handler = server.createHandler(createHandlerOptions);
    return createMockServer(handler);
  };

  describe('context', () => {
    it('context functions typecheck', async () => {
      // We want to make sure that TS allows you to write the context function
      // arguments. Note that the calls to createLambda that set context below
      // are only good enough if we're confident that the declaration of the
      // `config` argument on `createLambda` above matches the generics used in
      // ApolloServer itself, so it's reasonable for us to validate against
      // ApolloServer directly.
      new ApolloServer({
        typeDefs: 'type Query { x: Int }',
        context({ event: _event, context: _context, express }) {
          const { req: _req, res: _res } = express;
        },
      });
    });

    it('receives both Express and Lambda context', async () => {
      const app = createLambda(
        {},
        {
          typeDefs: 'type Query { context: String }',
          resolvers: {
            Query: {
              context: (_parent, _args, context) => JSON.stringify(context),
            },
          },
          // Add something interesting from each context argument part to the
          // context.
          context({ event, context, express }) {
            const { req, res } = express;
            return {
              reqHttpVersion: req.httpVersion,
              resHasApp: !!res.app,
              eventVersion: event.version,
              contextFunctionName: context.functionName,
            };
          },
        },
      );
      await request(app)
        .post('/graphql')
        .send({ query: '{context}' })
        .expect(200)
        .expect((res) => {
          expect(typeof res.body.data.context).toBe('string');
          const context = JSON.parse(res.body.data.context);
          expect(context).toEqual({
            reqHttpVersion: '1.1',
            resHasApp: true,
            eventVersion: '2.0',
            contextFunctionName: 'someFunc',
          });
        });
    });
  });

  it('expressAppFromMiddleware', async () => {
    const app = createLambda({
      expressAppFromMiddleware(middleware) {
        const app = express();
        app.get('/lambda-test', (_req, res) => {
          res.send('some body');
        });
        app.use(middleware);
        return app;
      },
    });
    await request(app).get('/lambda-test').expect(200, 'some body');
  });

  describe('healthchecks', () => {
    it('creates a healthcheck endpoint', async () => {
      const app = createLambda();

      const req = request(app).get('/.well-known/apollo/server-health');

      return req.then((res: any) => {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ status: 'pass' });
        expect(res.headers['content-type']).toEqual(
          'application/health+json; charset=utf-8',
        );
      });
    });

    it('provides a callback for the healthcheck', async () => {
      const app = createLambda({
        expressGetMiddlewareOptions: {
          onHealthCheck: async () => {
            return new Promise((resolve) => {
              return resolve('Success!');
            });
          },
        },
      });

      const req = request(app).get('/.well-known/apollo/server-health');

      return req.then((res: any) => {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({ status: 'pass' });
        expect(res.headers['content-type']).toEqual(
          'application/health+json; charset=utf-8',
        );
      });
    });

    it('returns a 503 if healthcheck fails', async () => {
      const app = createLambda({
        expressGetMiddlewareOptions: {
          onHealthCheck: async () => {
            return new Promise(() => {
              throw new Error('Failed to connect!');
            });
          },
        },
      });

      const req = request(app).get('/.well-known/apollo/server-health');

      return req.then((res: any) => {
        expect(res.status).toEqual(503);
        expect(res.body).toEqual({ status: 'fail' });
        expect(res.headers['content-type']).toEqual(
          'application/health+json; charset=utf-8',
        );
      });
    });
  });
});
