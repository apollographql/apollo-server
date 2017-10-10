import * as Boom from 'boom';
import { Server, Response, Request, ReplyNoContinue } from 'hapi';
import * as GraphiQL from 'apollo-server-module-graphiql';
import { GraphQLOptions, runHttpQuery, HttpQueryError } from 'apollo-server-core';

export interface IRegister {
    (server: Server, options: any, next: any): void;
    attributes?: any;
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

function runHttpQueryWrapper(options: GraphQLOptions | HapiOptionsFunction, request: Request, reply: ReplyNoContinue): Promise<Response> {
  return runHttpQuery([request], {
    method: request.method.toUpperCase(),
    options: options,
    query: request.method === 'post' ? request.payload : request.query,
  }).then((gqlResponse) => {
    return reply(gqlResponse).type('application/json');
  }, (error: HttpQueryError) => {
    if ( 'HttpQueryError' !== error.name ) {
      throw error;
    }

    if ( true === error.isGraphQLError ) {
      return reply(error.message).code(error.statusCode).type('application/json');
    }

    const err = Boom.create(error.statusCode);
    err.output.payload.message = error.message;
    if ( error.headers ) {
      Object.keys(error.headers).forEach((header) => {
        err.output.headers[header] = error.headers[header];
      });
    }

    return reply(err);
  });
}

const graphqlHapi: IRegister = function(server: Server, options: HapiPluginOptions, next) {
  if (!options || !options.graphqlOptions) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length !== 3) {
    throw new Error(`Apollo Server expects exactly 3 argument, got ${arguments.length}`);
  }

  server.route({
    method: ['GET', 'POST'],
    path: options.path || '/graphql',
    vhost: options.vhost || undefined,
    config: options.route || {},
    handler: (request, reply) => runHttpQueryWrapper(options.graphqlOptions, request, reply),
  });

  return next();
};

graphqlHapi.attributes = {
  name: 'graphql',
  version: '0.0.1',
};

export interface HapiGraphiQLOptionsFunction {
  (req?: Request): GraphiQL.GraphiQLData | Promise<GraphiQL.GraphiQLData>;
}

export interface HapiGraphiQLPluginOptions {
  path: string;
  route?: any;
  graphiqlOptions: GraphiQL.GraphiQLData | HapiGraphiQLOptionsFunction;
}

const graphiqlHapi: IRegister = function(server: Server, options: HapiGraphiQLPluginOptions, next) {
  if (!options || !options.graphiqlOptions) {
    throw new Error('Apollo Server GraphiQL requires options.');
  }

  if (arguments.length !== 3) {
    throw new Error(`Apollo Server GraphiQL expects exactly 3 arguments, got ${arguments.length}`);
  }

  server.route({
    method: 'GET',
    path: options.path || '/graphiql',
    config: options.route || {},
    handler: (request, reply) => {
      const query = request.query;
      GraphiQL.resolveGraphiQLString(query, options.graphiqlOptions, request).then(graphiqlString => {
        reply(graphiqlString).header('Content-Type', 'text/html');
      }, error => reply(error));
    },
  });

  return next();
};

graphiqlHapi.attributes = {
  name: 'graphiql',
  version: '0.0.1',
};

export { graphqlHapi, graphiqlHapi };
