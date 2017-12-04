import AdonisContext from '@adonisjs/framework/src/Context';
import { GraphQLOptions, HttpQueryError, runHttpQuery } from 'apollo-server-core';
import * as GraphiQL from 'apollo-server-module-graphiql';

export interface AdonisGraphQLOptionsFunction {
  (ctx: AdonisContext): GraphQLOptions | Promise<GraphQLOptions>;
}

export interface AdonisHandler {
  (req: any, next): void;
}

export function graphqlAdonis (options: GraphQLOptions | AdonisGraphQLOptionsFunction): AdonisHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }
  if (arguments.length > 1) {
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`);
  }
  return (ctx: AdonisContext): Promise<void> => {
    const { request, response } = ctx;
    const method = request.method();
    const query = method === 'POST' ? request.post() : request.get();
    return runHttpQuery([ctx], {
      method, options, query,
    }).then(gqlResponse => {
      response.json(gqlResponse);
    }, (error: HttpQueryError) => {
      if ('HttpQueryError' !== error.name) {
        throw error;
      }
      if (error.headers) {
        Object.keys(error.headers).forEach((header) => {
          response.header(header, error.headers[header]);
        });
      }
      response.status(error.statusCode).send(error.message);
    });
  };
}

export interface AdonisGraphiQLOptionsFunction {
  (ctx: AdonisContext): GraphiQL.GraphiQLData | Promise<GraphiQL.GraphiQLData>;
}

export function graphiqlAdonis (options: GraphiQL.GraphiQLData | AdonisGraphiQLOptionsFunction) {
  return (ctx: AdonisContext): Promise<void> => {
    const { request, response } = ctx;
    const query = request.get();
    return GraphiQL.resolveGraphiQLString(query, options, ctx)
      .then(graphiqlString => {
        response.type('text/html').send(graphiqlString);
      }, (error: HttpQueryError) => {
        response.status(500).send(error.message);
      });
  };
}
