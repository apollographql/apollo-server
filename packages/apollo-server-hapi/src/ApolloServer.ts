import type hapi from '@hapi/hapi';
import { parseAll } from '@hapi/accept';

export { GraphQLOptions } from 'apollo-server-core';
import {
  ApolloServerBase,
  convertNodeHttpToRequest,
  GraphQLOptions,
  isHttpQueryError,
  runHttpQuery,
} from 'apollo-server-core';
import Boom from '@hapi/boom';
import type { ApolloServerPlugin } from 'apollo-server-plugin-base';

export class ApolloServer extends ApolloServerBase {
  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(
    request: hapi.Request,
    h: hapi.ResponseToolkit,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ request, h });
  }

  public async applyMiddleware({
    app,
    cors,
    path,
    route,
    disableHealthCheck,
    onHealthCheck,
  }: ServerRegistration) {
    this.assertStarted('applyMiddleware');

    if (!path) path = '/graphql';

    const landingPage = this.getLandingPage();

    if (landingPage) {
      app.ext({
        type: 'onRequest',
        method: async (request, h) => {
          // Note that this path check is stricter than other integrations,
          // which return landingPage for arbitrary URLs under the given path.
          if (request.path !== path && request.path !== `${path}/`) {
            return h.continue;
          }

          if (request.method === 'get') {
            // perform more expensive content-type check only if necessary
            const accept = parseAll(request.headers);
            const types = accept.mediaTypes as string[];
            const prefersHtml =
              types.find(
                (x: string) => x === 'text/html' || x === 'application/json',
              ) === 'text/html';

            if (prefersHtml) {
              return h.response(landingPage.html).type('text/html').takeover();
            }
          }
          return h.continue;
        },
      });
    }

    if (!disableHealthCheck) {
      app.route({
        method: '*',
        path: '/.well-known/apollo/server-health',
        options: {
          cors: cors !== undefined ? cors : { origin: 'ignore' },
        },
        handler: async function (request, h) {
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

    app.route({
      method: ['GET', 'POST'],
      path,
      options: route ?? {
        cors: cors ?? { origin: 'ignore' },
      },
      handler: async (request, h) => {
        try {
          const { graphqlResponse, responseInit } = await runHttpQuery(
            [request, h],
            {
              method: request.method.toUpperCase(),
              options: () => this.createGraphQLServerOptions(request, h),
              query:
                request.method === 'post'
                  ? // TODO type payload as string or Record
                    (request.payload as any)
                  : request.query,
              request: convertNodeHttpToRequest(request.raw.req),
            },
          );

          const response = h.response(graphqlResponse);
          if (responseInit.headers) {
            Object.entries(responseInit.headers).forEach(
              ([headerName, value]) => response.header(headerName, value),
            );
          }
          response.code(responseInit.status || 200);
          return response;
        } catch (error) {
          if (!isHttpQueryError(error)) {
            throw Boom.boomify(error as Error);
          }

          if (true === error.isGraphQLError) {
            const response = h.response(error.message);
            if (error.headers) {
              Object.entries(error.headers).forEach(([headerName, value]) => {
                response.header(headerName, value);
              });
            }
            response.code(error.statusCode);
            response.type('application/json');
            return response;
          }

          const err = new Boom.Boom(error.message, {
            statusCode: error.statusCode,
          });
          if (error.headers) {
            Object.entries(error.headers).forEach(([headerName, value]) => {
              err.output.headers[headerName] = value;
            });
          }
          // Boom hides the error when status code is 500
          err.output.payload.message = error.message;
          throw err;
        }
      },
    });

    this.graphqlPath = path;
  }
}

export interface ServerRegistration {
  app: hapi.Server;
  path?: string;
  cors?: boolean | hapi.RouteOptionsCors;
  route?: hapi.RouteOptions;
  onHealthCheck?: (request: hapi.Request) => Promise<any>;
  disableHealthCheck?: boolean;
}

// hapi's app.stop() works similarly to ApolloServerPluginDrainHttpServer by
// default (as long as cleanStop has its default value of true) so we just use
// it instead of our own HTTP-server-draining implementation.
export function ApolloServerPluginStopHapiServer(options: {
  hapiServer: hapi.Server;
}): ApolloServerPlugin {
  return {
    async serverWillStart() {
      return {
        async drainServer() {
          await options.hapiServer.stop();
        },
      };
    },
  };
}
