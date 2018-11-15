import {
  convertNodeHttpToRequest,
  GraphQLOptions,
  runHttpQuery,
} from 'apollo-server-core';
import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RegisterOptions,
  RouteOptions,
} from 'fastify';
import { IncomingMessage, OutgoingMessage, Server } from 'http';

export interface FastifyGraphQLOptionsFunction
  extends RegisterOptions<Server, IncomingMessage, OutgoingMessage> {
  route: Partial<RouteOptions<Server, IncomingMessage, OutgoingMessage>>;
  graphqlOptions: (
    req?: FastifyRequest<IncomingMessage>,
    res?: FastifyReply<OutgoingMessage>,
  ) => GraphQLOptions | Promise<GraphQLOptions>;
}

export async function graphqlFastify(
  fastify: FastifyInstance<Server, IncomingMessage, OutgoingMessage>,
  options: FastifyGraphQLOptionsFunction,
): Promise<void> {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  fastify.route({
    method: ['GET', 'POST'],
    url: '/',
    handler: async (
      request: FastifyRequest<IncomingMessage>,
      reply: FastifyReply<OutgoingMessage>,
    ) => {
      try {
        const { graphqlResponse, responseInit } = await runHttpQuery(
          [request, reply],
          {
            method: request.req.method as string,
            options: options.graphqlOptions,
            query: request.req.method === 'POST' ? request.body : request.query,
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
          Object.keys(error.headers).forEach(header => {
            reply.header(header, error.headers[header]);
          });
        }

        reply.code(error.statusCode);
        reply.serializer((payload: string) => payload);
        reply.send(error.message);
      }
    },
    ...options.route,
  });
}
