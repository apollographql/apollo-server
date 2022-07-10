import {
  ApolloServerBase,
  Config,
  convertNodeHttpToRequest,
  GraphQLOptions,
  HttpQueryRequest,
  isHttpQueryError,
  runHttpQuery,
} from 'apollo-server-core';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyAccepts from '@fastify/accepts';
import fastifyCors, { FastifyCorsOptions } from '@fastify/cors';
import fp, { PluginOptions } from 'fastify-plugin';

export interface FastifyPluginOptions {
  path?: string;
  cors?: FastifyCorsOptions | boolean;
  onHealthCheck?: (request: FastifyRequest) => Promise<unknown>;
  disableHealthCheck?: boolean;
}

export interface FastifyContext {
  request: FastifyRequest;
  reply: FastifyReply;
}

export type ApolloServerFastifyConfig = Config<FastifyContext>;

const pluginOptions: PluginOptions = {
  fastify: '3 - 4',
  name: 'apollo-server-fastify',
};

export class ApolloServer<
  ContextFunctionParams = FastifyContext,
> extends ApolloServerBase<ContextFunctionParams> {

  public plugin =
    fp<FastifyPluginOptions>(
      // Unbound this error if passed directly
      (fastify, options) => this.sharedHandler(fastify, options),
      pluginOptions,
    );

  /**
   * @deprecated please use {@link plugin}
   * */
  public createHandler(options?: FastifyPluginOptions) {
    return (fastify: FastifyInstance) => (
      this.sharedHandler(fastify, options)
    );
  }

  private async createGraphQLServerOptions(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<GraphQLOptions> {
    const contextParams: FastifyContext = { request, reply };
    return this.graphQLServerOptions(contextParams)
  }

  private async fastifyRequestToCoreQuery({ request, reply }: FastifyContext): Promise<HttpQueryRequest> {
    return {
      method: request.method || 'POST',
      request: convertNodeHttpToRequest(request.raw),
      options: await this.createGraphQLServerOptions(request, reply),
      query: (
        request.method === 'POST' ? request.body : request.query
      ) as Record<string, unknown>,
    };
  }

  private async sharedHandler(
    fastify: FastifyInstance,
    options: FastifyPluginOptions = {},
  ) {
    const {
      cors = true,
      path = '/graphql',
      onHealthCheck,
      disableHealthCheck = false,
    } = options;

    this.graphqlPath = path;

    this.assertStarted('createHandler');

    const landingPage = this.getLandingPage();

    if (!disableHealthCheck) {
      fastify.get(
        '/.well-known/apollo/server-health',
        async (request, reply) => {
          // Response follows: https://tools.ietf.org/html/draft-inadarei-api-health-check-01
          reply.type('application/health+json');

          // Fastify has first-class support for JSON serialization:
          // https://www.fastify.io/docs/latest/Guides/Getting-Started/#serialize-your-data
          if (onHealthCheck) {
            try {
              await onHealthCheck(request);
              return { status: 'pass' };
            } catch (e) {
              reply.status(503);
              return { status: 'fail' };
            }
          } else {
            return { status: 'pass' };
          }
        },
      );
    }

    await fastify.register(
      async instance => {
        await instance.register(fastifyAccepts);

        if (cors === true) {
          await instance.register(fastifyCors);
        } else if (cors !== false) {
          await instance.register(fastifyCors, cors);
        }

        instance.setNotFoundHandler(
          // Fastify TS Bug: only async allowed here
          async (_, reply) => {
            reply.header('Allow', 'GET, POST');
            reply.code(405);
            return reply.send();
          },
        );

        instance.route({
          url: '/',
          method: ['GET', 'POST'],
          handler: async (request, reply) => {
            if (landingPage && prefersHtml(request)) {
              reply.type('text/html');
              return landingPage.html;
            }

            try {
              const { graphqlResponse, responseInit } =
                await runHttpQuery(
                  [],
                  await this.fastifyRequestToCoreQuery({ request, reply }),
                  this.csrfPreventionRequestHeaders,
                );

              if (responseInit.headers) {
                reply.headers(responseInit.headers);
              }

              reply.status(responseInit.status || 200);

              return graphqlResponse;
            } catch (error) {
              if (!isHttpQueryError(error)) {
                throw error;
              }

              if (error.headers) {
                reply.headers(error.headers);
              }

              reply.code(error.statusCode);

              return error.message;
            }
          },
        })
      },
      { prefix: this.graphqlPath },
    )
  }
}

function prefersHtml(request: FastifyRequest): boolean {
  if (request.method !== 'GET') {
    return false;
  } else {
    const accepts = request.accepts();
    const types = accepts.types();

    if (Array.isArray(types)) {
      return types.find(x => x === 'text/html' || x === 'application/json') === 'text/html';
    } else {
      return false;
    }
  }
}

/**
* @deprecated please use {@link FastifyPluginOptions}
* */
export type ServerRegistration = FastifyPluginOptions;
