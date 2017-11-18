import * as fastify from 'fastify';
import { GraphQLOptions, HttpQueryError, runHttpQuery } from 'apollo-server-core';
import { GraphiQLData, resolveGraphiQLString} from 'apollo-server-module-graphiql';

export type FastifyMiddlewareCallback = (err?: Error) => void | undefined;

/**
 * To get context and such you can decorate the request.
 *
 * fastify.decorateRequest('context', function() {
 *  return {
 *    user: this.req.user
 *  }
 * })
 */

export function graphqlFastify(options) {
  return (request: fastify.FastifyRequest, reply: fastify.FastifyReply) => {
    const { method } = request.req;

    runHttpQuery([request, reply], {
      method,
      options,
      query: method === 'POST' ? request.body : request.query
    }).then(
      function(res) {
        reply.type('application/graphql').send(res);
      },
      function(err) {
        if (err.name === 'HttpQueryError') {
          if (err.headers) {
            Object.keys(err.headers).forEach(function(header) {
              reply.header(header, err.headers[header]);
            });
          }
        }

        reply.code(err.statusCode || 500).type('application/graphql').send(err.message);
      }
    );
  };
}

export function graphiqlFastify(options: GraphiQLData): any {
  return (request, reply) =>
    resolveGraphiQLString(request.query, options, request.req).then(
      function(graphiqlString) {
        reply
          .type('text/html')
          .code(200)
          .send(graphiqlString);
      },
      function(err) {
        reply.code(500).send(err);
      }
    );
}

export function graphqlFastifyPlugin(
  fastifyInstance: fastify.FastifyInstance,
  options: GraphQLOptions,
  done: FastifyMiddlewareCallback
): any {
  if (!options) {
    throw new Error('Apollo server requires options');
  }

  fastifyInstance.route({
    url: '/',
    method: ['GET', 'POST'],
    handler: graphqlFastify(options)
  });

  done();

  return fastifyInstance;
}

export function graphiqlFastifyPlugin(
  fastifyInstance: fastify.FastifyInstance,
  options: GraphiQLData,
  done: FastifyMiddlewareCallback
) {
  fastifyInstance.get('/', graphiqlFastify(options));

  done();
}

export interface ApolloFastifyOptions {
  graphql: GraphQLOptions;
  graphiql: GraphiQLData
}

export function apolloFastify(fastify: fastify.FastifyInstance, options: ApolloFastifyOptions, next: FastifyMiddlewareCallback) {
  fastify.register(graphiqlFastifyPlugin, options.graphiql).register(graphqlFastifyPlugin, options.graphql);

  next();
}
