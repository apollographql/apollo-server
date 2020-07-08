import {
  GraphQLOptions,
  convertNodeHttpToRequest,
  runHttpQuery,
} from 'apollo-server-core';
import { ValueOrPromise } from 'apollo-server-types';
import { FastifyReply, FastifyRequest, RouteHandlerMethod } from 'fastify';

export async function graphqlFastify(
  options: (
    request?: FastifyRequest,
    reply?: FastifyReply,
  ) => ValueOrPromise<GraphQLOptions>,
): Promise<RouteHandlerMethod<any, any, any>> {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  return async (
    request: FastifyRequest<any, any, any>,
    reply: FastifyReply,
  ) => {
    try {
      const { graphqlResponse, responseInit } = await runHttpQuery(
        [request, reply],
        {
          method: request.raw.method as string,
          options,
          query: request.raw.method === 'POST' ? request.body : request.query,
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
      if (error.name !== 'HttpQueryError') {
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
  };
}
