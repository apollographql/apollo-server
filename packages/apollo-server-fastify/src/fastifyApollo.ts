import * as fastify from 'fastify';
import { GraphQLOptions, HttpQueryError, runHttpQuery } from 'apollo-server-core';
import * as GraphiQL from 'apollo-server-module-graphiql';

export interface FastifyPlugin {
  (request: fastify.FastifyRequest, reply: fastify.FastifyReply, done: (err: Error) => void): void;
}

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

        if (!err.statusCode) {
          reply.code(500);
        } else {
          reply.code(err.statusCode);
        }

        reply.type('application/graphql').send(err.message);
      }
    );
  };
}

export function graphqlFastifyPlugin(
  fastifyInstance: fastify.FastifyInstance,
  options: GraphQLOptions,
  done: (err?: Error) => void
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

export function graphiqlFastify(options): any {
  return (request, reply) =>
    GraphiQL.resolveGraphiQLString(request.query, options, request.req).then(
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

function graphiqlFastifyPlugin(
  fastifyInstance: fastify.FastifyInstance,
  options: GraphiQL.GraphiQLData,
  done: (err?: Error) => void
) {
  fastifyInstance.get('/', graphiqlFastify(options));

  done();
}
