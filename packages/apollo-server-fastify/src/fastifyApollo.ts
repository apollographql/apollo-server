import {
  convertNodeHttpToRequest,
  GraphQLOptions,
  runHttpQuery,
} from 'apollo-server-core';
import { FastifyReply, FastifyRequest, RequestHandler } from 'fastify';
import { IncomingMessage, OutgoingMessage } from 'http';
import { ValueOrPromise } from 'apollo-server-types';

export async function graphqlFastify(
  options: (
    req?: FastifyRequest<IncomingMessage>,
    res?: FastifyReply<OutgoingMessage>,
  ) => ValueOrPromise<GraphQLOptions>,
): Promise<RequestHandler<IncomingMessage, OutgoingMessage>> {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  return async (
    request: FastifyRequest<IncomingMessage>,
    reply: FastifyReply<OutgoingMessage>,
  ) => {
    try {
      const { graphqlResponse, responseInit } = await runHttpQuery(
        [request, reply],
        {
          method: request.req.method as string,
          options,
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
  };
}
