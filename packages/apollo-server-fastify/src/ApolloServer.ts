import * as fastify from 'fastify';
import { FastifyInstance } from 'fastify';
const { parseAll } = require('accept');
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html';

import { graphqlFastify } from './fastifyApollo';

export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';
import { ApolloServerBase, GraphQLOptions } from 'apollo-server-core';
import { IncomingMessage, OutgoingMessage, ServerResponse } from 'http';

export class ApolloServer extends ApolloServerBase {
  async createGraphQLServerOptions(
    request: fastify.FastifyRequest<IncomingMessage>,
    reply: fastify.FastifyReply<OutgoingMessage>,
  ): Promise<GraphQLOptions> {
    const options = await super.graphQLServerOptions({ request, reply });
    return options;
  }

  protected supportsSubscriptions(): boolean {
    return true;
  }

  protected supportsUploads(): boolean {
    return true;
  }

  public async applyMiddleware({
    app,
    cors,
    path,
    route,
    disableHealthCheck,
    onHealthCheck,
  }: ServerRegistration) {
    if (!path) path = '/graphql';

    await app.addHook(
      'onRequest',
      async function(
        this: any,
        request: any,
        response: ServerResponse,
        next: any,
      ) {
        if (request.path !== path) {
          return next();
        }

        if (this.playgroundOptions && request.method === 'get') {
          // perform more expensive content-type check only if necessary
          const accept = parseAll(request.headers);
          const types = accept.mediaTypes as string[];
          const prefersHTML =
            types.find(
              (x: string) => x === 'text/html' || x === 'application/json',
            ) === 'text/html';

          if (prefersHTML) {
            const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
              endpoint: path,
              subscriptionEndpoint: this.subscriptionsPath,
              version: this.playgroundVersion,
              ...this.playgroundOptions,
            };

            response.setHeader('Content-Type', 'text/html');
            return response.end(
              renderPlaygroundPage(playgroundRenderPageOptions),
            );
          }
        }
        return next();
      }.bind(this),
    );

    if (!disableHealthCheck) {
      await app.route({
        method: [
          'HEAD',
          'PUT',
          'DELETE',
          'OPTIONS',
          'PATCH',
        ] as fastify.HTTPMethod[],
        url: '/.well-known/apollo/server-health',
        handler: async function(request, reply) {
          if (onHealthCheck) {
            try {
              await onHealthCheck(request);
            } catch {
              const response = reply
                .send({ status: 'fail' })
                .code(503)
                .type('application/health+json');
              return response;
            }
          }
          const response = reply
            .send({ status: 'pass' })
            .type('application/health+json');
          return response;
        },
      });
    }

    await app.register(graphqlFastify as any, {
      url: path,
      graphqlOptions: this.createGraphQLServerOptions.bind(this),
      route: route || { cors },
    });

    this.graphqlPath = path;
  }
}

export interface ServerRegistration {
  app?: FastifyInstance;
  path?: string;
  cors?: boolean;
  route?: string;
  onHealthCheck?: (
    request: fastify.FastifyRequest<IncomingMessage>,
  ) => Promise<any>;
  disableHealthCheck?: boolean;
  uploads?: boolean | Record<string, any>;
}

export const registerServer = () => {
  throw new Error(
    'Please use server.applyMiddleware instead of registerServer. This warning will be removed in the next release',
  );
};
