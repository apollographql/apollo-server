import { renderPlaygroundPage } from '@apollographql/graphql-playground-html';
import { Accepts } from 'accepts';
import {
  ApolloServerBase,
  PlaygroundRenderPageOptions,
} from 'apollo-server-core';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { IncomingMessage, OutgoingMessage } from 'http';
import { processRequest as processFileUploads } from '@apollographql/apollo-upload-server';
import { graphqlFastify } from './fastifyApollo';

const fastJson = require('fast-json-stringify');

export interface ServerRegistration {
  app: FastifyInstance;
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
  protected supportsSubscriptions(): boolean {
    return true;
  }

  protected supportsUploads(): boolean {
    return true;
  }

  public async applyMiddleware({
    app,
    path,
    cors,
    disableHealthCheck,
    onHealthCheck,
  }: ServerRegistration) {
    await this.willStart();

    if (!path) path = '/graphql';

    this.graphqlPath = path;

    app.register(require('fastify-accepts'));

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

    if (cors === true) {
      app.register(require('fastify-cors'));
    } else if (cors !== false) {
      app.register(require('fastify-cors'), cors);
    }

    app.register(
      async instance => {
        instance.setNotFoundHandler((_request, reply) => {
          reply.code(405);
          reply.header('allow', 'GET, POST');
          reply.send();
        });

        instance.addContentTypeParser(
          'multipart',
          async (request: IncomingMessage) =>
            processFileUploads(request, this.uploadsConfig),
        );

        instance.register(graphqlFastify, {
          route: {
            beforeHandler: (
              req: FastifyRequest<IncomingMessage>,
              reply: FastifyReply<OutgoingMessage>,
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
                    endpoint: path,
                    subscriptionEndpoint: this.subscriptionsPath,
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
          },
          graphqlOptions: this.graphQLServerOptions.bind(this),
        });
      },
      {
        prefix: path,
      },
    );
  }
}

export const registerServer = () => {
  throw new Error(
    'Please use server.applyMiddleware instead of registerServer. This warning will be removed in the next release',
  );
};
