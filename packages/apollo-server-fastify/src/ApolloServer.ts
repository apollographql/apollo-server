import {
  ApolloServerBase,
  Config,
  convertNodeHttpToRequest,
  GraphQLOptions,
  isHttpQueryError,
  runHttpQuery,
} from 'apollo-server-core';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import accepts from '@fastify/accepts';
import fastifyCors from '@fastify/cors';

export interface ServerRegistration {
  path?: string;
  cors?: Record<string, unknown> | boolean;
  onHealthCheck?: (req: FastifyRequest) => Promise<any>;
  disableHealthCheck?: boolean;
}

export interface FastifyContext {
  request: FastifyRequest;
  reply: FastifyReply;
}

export type ApolloServerFastifyConfig = Config<FastifyContext>;

export class ApolloServer<
  ContextFunctionParams = FastifyContext,
> extends ApolloServerBase<ContextFunctionParams> {
  async createGraphQLServerOptions(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<GraphQLOptions> {
    const contextParams: FastifyContext = { request, reply };
    return this.graphQLServerOptions(contextParams);
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
              return reply.send('{"status":"pass"}');
            } catch (e) {
              return reply.status(503).send('{"status":"fail"}');
            }
          } else {
            return reply.send('{"status":"pass"}');
          }
        });
      }

      app.register(
        async (instance) => {
          instance.register(accepts);
          if (cors === true) {
            instance.register(fastifyCors);
          } else if (cors !== false) {
            instance.register(fastifyCors, cors);
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
                    return reply.send(landingPage.html);
                  }
                }

                return undefined;
              }
            : undefined;

          instance.route({
            method: ['GET', 'POST'],
            url: '/',
            preHandler,
            handler: async (request, reply) => {
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
                  this.csrfPreventionRequestHeaders,
                );

                if (responseInit.headers) {
                  for (const [name, value] of Object.entries<string>(
                    responseInit.headers,
                  )) {
                    reply.header(name, value);
                  }
                }
                reply.status(responseInit.status || 200);
                reply.serializer((payload: string) => payload);
                return reply.send(graphqlResponse);
              } catch (error) {
                if (!isHttpQueryError(error)) {
                  throw error;
                }

                if (error.headers) {
                  for (const [header, value] of Object.entries(error.headers)) {
                    reply.header(header, value);
                  }
                }

                reply.code(error.statusCode);
                reply.serializer((payload: string) => payload);
                return reply.send(error.message);
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
