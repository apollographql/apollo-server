import { renderPlaygroundPage } from '@apollographql/graphql-playground-html';
import { Accepts } from 'accepts';
import {
  ApolloServerBase,
  PlaygroundRenderPageOptions,
} from 'apollo-server-core';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { IncomingMessage, ServerResponse, Server } from 'http';
import { graphqlFastify } from './fastifyApollo';

const fastJson = require('fast-json-stringify');

export interface ServerRegistration {
  path?: string;
  cors?: object | boolean;
  onHealthCheck?: (req: FastifyRequest<IncomingMessage>) => Promise<any>;
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
  public createHandler({
    path,
    cors,
    disableHealthCheck,
    onHealthCheck,
  }: ServerRegistration = {}) {
    this.graphqlPath = path ? path : '/graphql';
    const promiseWillStart = this.willStart();

    return async (
      app: FastifyInstance<Server, IncomingMessage, ServerResponse>,
    ) => {
      await promiseWillStart;

      if (!disableHealthCheck) {
        app.get('/.well-known/apollo/server-health', async (req, res) => {
          // Response follows https://tools.ietf.org/html/draft-inadarei-api-health-check-01
          res.type('application/health+json');

          if (onHealthCheck) {
            try {
              await onHealthCheck(req);
              res.send(stringifyHealthCheck({ status: 'pass' }));
            } catch (e) {
              res.status(503).send(stringifyHealthCheck({ status: 'fail' }));
            }
          } else {
            res.send(stringifyHealthCheck({ status: 'pass' }));
          }
        });
      }

      app.register(
        async instance => {
          instance.register(require('fastify-accepts'));

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

          const preHandlers = [
            (
              req: FastifyRequest<IncomingMessage>,
              reply: FastifyReply<ServerResponse>,
              done: () => void,
            ) => {
              // Note: if you enable playground in production and expect to be able to see your
              // schema, you'll need to manually specify `introspection: true` in the
              // ApolloServer constructor; by default, the introspection query is only
              // enabled in dev.
              if (this.playgroundOptions && req.req.method === 'GET') {
                // perform more expensive content-type check only if necessary
                const accept = (req as any).accepts() as Accepts;
                const types = accept.types() as string[];
                const prefersHTML =
                  types.find(
                    (x: string) =>
                      x === 'text/html' || x === 'application/json',
                  ) === 'text/html';

                if (prefersHTML) {
                  const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
                    endpoint: this.graphqlPath,
                    ...this.playgroundOptions,
                  };
                  reply.type('text/html');
                  const playground = renderPlaygroundPage(
                    playgroundRenderPageOptions,
                  );
                  reply.send(playground);
                  return;
                }
              }
              done();
            },
          ];

          instance.route({
            method: ['GET', 'POST'],
            url: '/',
            preHandler: preHandlers,
            handler: await graphqlFastify(this.graphQLServerOptions.bind(this)),
          });
        },
        {
          prefix: this.graphqlPath,
        },
      );
    };
  }
}
