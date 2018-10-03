import {
  GraphQLOptions,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import { FastifyInstance, FastifyReply } from 'fastify';
import { OutgoingMessage } from 'http';

interface FastifyPluginOptions {
  url?: string;
  graphqlOptions: GraphQLOptions;
}

export function graphqlFastify(
  app: FastifyInstance,
  options: FastifyPluginOptions,
  next: (err?: Error) => void,
) {
  if (!options || !options.graphqlOptions) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length !== 3) {
    throw new Error(
      `Apollo Server expects exactly 3 argument, got ${arguments.length}`,
    );
  }

  async function handler(request: any, reply: FastifyReply<OutgoingMessage>) {
    const { method } = request.raw;
    try {
      const { graphqlResponse } = await runHttpQuery([request, reply], {
        method: method,
        options: options.graphqlOptions,
        query: method === 'POST' ? request.body : request.query,
        request: convertNodeHttpToRequest(request.raw),
      });

      reply
        .type('application/json')
        .code(200)
        .send(JSON.parse(graphqlResponse));
    } catch (error) {
      if ('HttpQueryError' !== error.name) {
        return next(error);
      }

      if (error.headers) {
        Object.keys(error.headers).forEach(header => {
          reply.header(header, error.headers[header]);
        });
      }

      let errMessage;
      try {
        errMessage = JSON.parse(error.message);
      } catch {
        errMessage = error.message;
      }

      reply.code(error.statusCode).send(errMessage);
    }
  }

  app.route({
    method: ['GET', 'POST'],
    url: options.url || '/graphql',
    handler,
  });

  // This is a workaround because of this issue https://github.com/fastify/fastify/pull/862
  app.route({
    method: ['HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    url: options.url || '/graphql',
    handler: async (_: any, reply: FastifyReply<OutgoingMessage>) => {
      reply
        .code(405)
        .header('allow', 'GET, POST')
        .send();
    },
  });

  if (next) {
    next();
  }

  return app;
}
