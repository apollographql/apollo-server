import * as fastify from 'fastify';
import {
  runHttpQuery,
  HttpQueryRequest,
  GraphQLOptions,
} from 'apollo-server-core';
import * as GraphiQL from 'apollo-server-module-graphiql';
import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  Middleware,
} from 'fastify';
import { IncomingMessage, ServerResponse, Server } from 'http';

export function graphqlFastify(
  fastify: FastifyInstance,
  options: any,
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

  async function handler<HttpResponse extends ServerResponse>(
    request: any,
    reply: FastifyReply<HttpResponse>,
  ) {
    const { method } = request.raw;
    try {
      const gqlResponse = await runHttpQuery([request], {
        method: method,
        options: options.graphqlOptions,
        query: method === 'POST' ? request.body : request.query,
      });
      reply
        .type('application/json')
        .code(200)
        .header(
          'Content-Length',
          Buffer.byteLength(JSON.stringify(gqlResponse), 'utf8'),
        )
        .send(JSON.parse(gqlResponse));
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

  fastify.route({
    method: ['GET', 'POST'],
    url: options.url || '/graphql',
    handler,
  });

  // This is a workaround because of this issue https://github.com/fastify/fastify/pull/862
  fastify.route({
    method: ['HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    url: options.url || '/graphql',
    handler: async (req, reply) => {
      reply
        .code(405)
        .header('allow', 'GET, POST')
        .send();
    },
  });

  next();
  return fastify;
}

export function graphiqlFastify(
  fastify: FastifyInstance,
  options: any,
  next: (err?: Error) => void,
) {
  const handler = async (request, reply) => {
    try {
      const query = request.query;
      const giqlResponse = await GraphiQL.resolveGraphiQLString(
        query,
        options,
        request,
      );
      reply
        .header('Content-Type', 'text/html')
        .code(200)
        .send(giqlResponse);
    } catch (error) {
      reply.code(500).send(error);
    }
  };

  fastify.route({
    method: ['GET', 'POST'],
    url: options.url || '/graphiql',
    handler,
  });

  // This is a workaround because of this issue https://github.com/fastify/fastify/pull/862
  fastify.route({
    method: ['HEAD', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    url: options.url || '/graphiql',
    handler: async (req, reply) => {
      reply
        .code(405)
        .header('allow', 'GET, POST')
        .send();
    },
  });

  next();
  return fastify;
}
