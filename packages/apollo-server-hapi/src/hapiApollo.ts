import * as Boom from 'boom';
import { Server, Response, Request, ReplyNoContinue } from 'hapi';
import * as GraphiQL from 'apollo-server-module-graphiql';
import {
  GraphQLOptions,
  runHttpQuery,
  HttpQueryError,
} from 'apollo-server-core';

export interface IRegister {
  (server: Server, options: any, next?: Function): void;
}

export interface IPlugin {
  name: string;
  version?: string;
  register: IRegister;
}

export interface HapiOptionsFunction {
  (req?: Request): GraphQLOptions | Promise<GraphQLOptions>;
}

export interface HapiPluginOptions {
  path: string;
  vhost?: string;
  route?: any;
  graphqlOptions: GraphQLOptions | HapiOptionsFunction;
}

const graphqlHapi: IPlugin = {
  name: 'graphql',
  register: (server: Server, options: HapiPluginOptions, next?: Function) => {
    if (!options || !options.graphqlOptions) {
      throw new Error('Apollo Server requires options.');
    }

    server.route({
      method: ['GET', 'POST'],
      path: options.path || '/graphql',
      vhost: options.vhost || undefined,
      config: options.route || {},
      handler: async (request, h) => {
        try {
          const gqlResponse = await runHttpQuery([request], {
            method: request.method.toUpperCase(),
            options: options.graphqlOptions,
            query: request.method === 'post' ? request.payload : request.query,
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

    if (next) {
      next();
    }
  },
};

export interface HapiGraphiQLOptionsFunction {
  (req?: Request): GraphiQL.GraphiQLData | Promise<GraphiQL.GraphiQLData>;
}

export interface HapiGraphiQLPluginOptions {
  path: string;
  route?: any;
  graphiqlOptions: GraphiQL.GraphiQLData | HapiGraphiQLOptionsFunction;
}

const graphiqlHapi: IPlugin = {
  name: 'graphiql',
  register: (
    server: Server,
    options: HapiGraphiQLPluginOptions,
    next?: Function,
  ) => {
    if (!options || !options.graphiqlOptions) {
      throw new Error('Apollo Server GraphiQL requires options.');
    }

    server.route({
      method: 'GET',
      path: options.path || '/graphiql',
      config: options.route || {},
      handler: async (request, h) => {
        const graphiqlString = await GraphiQL.resolveGraphiQLString(
          request.query,
          options.graphiqlOptions,
          request,
        );

        const response = h.response(graphiqlString);
        response.type('text/html');
        return response;
      },
    });

    if (next) {
      next();
    }
  },
};

export { graphqlHapi, graphiqlHapi };
