import {
  ApolloServerBase,
  convertNodeHttpToRequest,
  GraphQLOptions,
  runHttpQuery,
} from 'apollo-server-core';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import accepts from 'fastify-accepts';

const fastJson = require('fast-json-stringify');

export interface ServerRegistration {
  path?: string;
  cors?: Record<string, unknown> | boolean;
  onHealthCheck?: (req: FastifyRequest) => Promise<any>;
  disableHealthCheck?: boolean;
}

const stringifyHealthCheck = fastJson({
  type: 'object',
  properties: {
    status: {
      type: 'string',
    },
  },
});

export class ApolloServer extends ApolloServerBase {
  async createGraphQLServerOptions(
    request?: FastifyRequest,
    reply?: FastifyReply,
  ): Promise<GraphQLOptions> {
    return this.graphQLServerOptions({ request, reply });
  }

  public createHandler({
    path,
    cors,
    disableHealthCheck,
    onHealthCheck,
  }: ServerRegistration = {}) {
    this.graphqlPath = path || '/graphql';

    this.assertStarted('createHandler');

    const landingPage = this.getLandingPage();

    return async (app: FastifyInstance) => {
      if (!disableHealthCheck) {
        app.get('/.well-known/apollo/server-health', async (request, reply) => {
          // Response follows https://tools.ietf.org/html/draft-inadarei-api-health-check-01
          reply.type('application/health+json');

          if (onHealthCheck) {
            try {
              await onHealthCheck(request);
              reply.send(stringifyHealthCheck({ status: 'pass' }));
            } catch (e) {
              reply.status(503).send(stringifyHealthCheck({ status: 'fail' }));
            }
          } else {
            reply.send(stringifyHealthCheck({ status: 'pass' }));
          }
        });
      }

      app.register(
        async (instance) => {
          instance.register(accepts);
          if (cors === true) {
            instance.register(require('fastify-cors'));
          } else if (cors !== false) {
            instance.register(require('fastify-cors'), cors);
          }

          instance.setNotFoundHandler((_request, reply) => {
            reply.code(405);
            reply.header('allow', 'GET, POST');
            reply.send();
          });

          const preHandler = landingPage
            ? async (request: FastifyRequest, reply: FastifyReply) => {
                if (request.raw.method === 'GET') {
                  const accept = request.accepts();
                  const types = accept.types() as string[];
                  const prefersHtml =
                    types.find(
                      (x: string) =>
                        x === 'text/html' || x === 'application/json',
                    ) === 'text/html';

                  if (prefersHtml) {
                    reply.type('text/html');
                    reply.send(landingPage.html);
                  }
                }
              }
            : undefined;

          instance.route({
            method: ['GET', 'POST'],
            url: '/',
            preHandler,
            handler: async (request: FastifyRequest, reply: FastifyReply) => {
              try {
                const { graphqlResponse, responseInit } = await runHttpQuery(
                  [],
                  {
                    method: request.raw.method as string,
                    options: () =>
                      this.createGraphQLServerOptions(request, reply),
                    query: (request.raw.method === 'POST'
                      ? request.body
                      : request.query) as any,
                    request: convertNodeHttpToRequest(request.raw),
                  },
                );

                if (responseInit.headers) {
                  for (const [name, value] of Object.entries<string>(
                    responseInit.headers,
                  )) {
                    reply.header(name, value);
                  }
                }
                reply.serializer((payload: string) => payload);
                reply.send(graphqlResponse);
              } catch (error) {
                if ('HttpQueryError' !== error.name) {
                  throw error;
                }

                if (error.headers) {
                  Object.keys(error.headers).forEach((header) => {
                    reply.header(header, error.headers[header]);
                  });
                }

                reply.code(error.statusCode);
                reply.serializer((payload: string) => payload);
                reply.send(error.message);
              }
            },
          });
        },
        {
          prefix: this.graphqlPath,
        },
      );
    };
  }
}
