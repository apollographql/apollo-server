import * as Boom from 'boom';
import { Server, Request } from 'hapi';
import {
  GraphQLOptions,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';

export interface IRegister {
  (server: Server, options: any): void;
}

export interface IPlugin {
  name: string;
  version?: string;
  register: IRegister;
}

export interface HapiOptionsFunction {
  (request?: Request): GraphQLOptions | Promise<GraphQLOptions>;
}

export interface HapiPluginOptions {
  path: string;
  vhost?: string;
  route?: any;
  graphqlOptions: GraphQLOptions | HapiOptionsFunction;
}

const graphqlHapi: IPlugin = {
  name: 'graphql',
  register: (server: Server, options: HapiPluginOptions) => {
    if (!options || !options.graphqlOptions) {
      throw new Error('Apollo Server requires options.');
    }

    server.route({
      method: ['GET', 'POST'],
      path: options.path || '/graphql',
      vhost: options.vhost || undefined,
      options: options.route || {},
      handler: async (request, h) => {
        try {
          const gqlResponse = await runHttpQuery([request], {
            method: request.method.toUpperCase(),
            options: options.graphqlOptions,
            query:
              request.method === 'post'
                ? //TODO type payload as string or Record
                  (request.payload as any)
                : request.query,
            request: convertNodeHttpToRequest(request.raw.req),
          });

          const response = h.response(gqlResponse);
          response.type('application/json');
          return response;
        } catch (error) {
          if ('HttpQueryError' !== error.name) {
            throw Boom.boomify(error);
          }

          if (true === error.isGraphQLError) {
            const response = h.response(error.message);
            response.code(error.statusCode);
            response.type('application/json');
            return response;
          }

          const err = new Boom(error.message, { statusCode: error.statusCode });
          if (error.headers) {
            Object.keys(error.headers).forEach(header => {
              err.output.headers[header] = error.headers[header];
            });
          }
          // Boom hides the error when status code is 500
          err.output.payload.message = error.message;
          throw err;
        }
      },
    });
  },
};

export { graphqlHapi };
