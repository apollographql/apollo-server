import hapi from 'hapi';
import { ApolloServerBase } from 'apollo-server-core';
import { parseAll } from 'accept';
import {
  renderPlaygroundPage,
  MiddlewareOptions as PlaygroundMiddlewareOptions,
} from 'graphql-playground-html';
import { processRequest as processFileUploads } from 'apollo-upload-server';

import { graphqlHapi } from './hapiApollo';

export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';
import { GraphQLOptions, FileUploadOptions } from 'apollo-server-core';

function handleFileUploads(uploadsConfig: FileUploadOptions) {
  return async (request: hapi.Request) => {
    if (request.mime === 'multipart/form-data') {
      Object.defineProperty(request, 'payload', {
        value: await processFileUploads(request, uploadsConfig),
        writable: false,
      });
    }
  };
}

export class ApolloServer extends ApolloServerBase {
  //This translates the arguments from the middleware into graphQL options It
  //provides typings for the integration specific behavior, ideally this would
  //be propagated with a generic to the super class
  async createGraphQLServerOptions(
    request: hapi.Request,
    h: hapi.ResponseToolkit,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ request, h });
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
    disableHealthCheck,
    gui,
    onHealthCheck,
  }: ServerRegistration) {
    if (!path) path = '/graphql';

    await app.ext({
      type: 'onRequest',
      method: async function(request, h) {
        if (request.path !== path) {
          return h.continue;
        }

        if (this.uploadsConfig) {
          await handleFileUploads(this.uploadsConfig)(request);
        }

        // Note: if you enable a gui in production and expect to be able to see your
        // schema, you'll need to manually specify `introspection: true` in the
        // ApolloServer constructor; by default, the introspection query is only
        // enabled in dev.
        const guiEnabled =
          !!gui || (gui === undefined && process.env.NODE_ENV !== 'production');

        // enableGUI takes precedence over the server tools setting
        if (guiEnabled && request.method === 'get') {
          //perform more expensive content-type check only if necessary
          const accept = parseAll(request.headers);
          const types = accept.mediaTypes as string[];
          const prefersHTML =
            types.find(
              (x: string) => x === 'text/html' || x === 'application/json',
            ) === 'text/html';

          if (prefersHTML) {
            const middlewareOptions = {
              endpoint: path,
              subscriptionEndpoint: this.subscriptionsPath,
              version: '1.4.0',
              ...(typeof gui === 'boolean' ? {} : gui),
            };

            return h
              .response(renderPlaygroundPage(middlewareOptions))
              .type('text/html')
              .takeover();
          }
        }
        return h.continue;
      }.bind(this),
    });

    if (!disableHealthCheck) {
      await app.route({
        method: '*',
        path: '/.well-known/apollo/server-health',
        options: {
          cors: typeof cors === 'boolean' ? cors : true,
        },
        handler: async function(request, h) {
          if (onHealthCheck) {
            try {
              await onHealthCheck(request);
            } catch {
              const response = h.response({ status: 'fail' });
              response.code(503);
              response.type('application/health+json');
              return response;
            }
          }
          const response = h.response({ status: 'pass' });
          response.type('application/health+json');
          return response;
        },
      });
    }

    await app.register({
      plugin: graphqlHapi,
      options: {
        path: path,
        graphqlOptions: this.createGraphQLServerOptions.bind(this),
        route: {
          cors: typeof cors === 'boolean' ? cors : true,
        },
      },
    });

    this.graphqlPath = path;
  }
}

export interface ServerRegistration {
  app?: hapi.Server;
  path?: string;
  cors?: boolean;
  onHealthCheck?: (request: hapi.Request) => Promise<any>;
  disableHealthCheck?: boolean;
  gui?: boolean | PlaygroundMiddlewareOptions;
  uploads?: boolean | Record<string, any>;
}

export const registerServer = () => {
  throw new Error(
    'Please use server.applyMiddleware instead of registerServer. This warning will be removed in the next release',
  );
};
