import * as koa from 'koa';
import { GraphQLOptions, HttpQueryError, runHttpQuery } from 'graphql-server-core';
import * as GraphiQL from 'graphql-server-module-graphiql';

export interface KoaGraphQLOptionsFunction {
  (ctx: koa.Context): GraphQLOptions | Promise<GraphQLOptions>;
}

export interface KoaHandler {
  (req: any, next): void;
}

export function graphqlKoa(options: GraphQLOptions | KoaGraphQLOptionsFunction): KoaHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`);
  }

  return (ctx: koa.Context): Promise<void> => {
    return runHttpQuery([ctx], {
      method: ctx.request.method,
      options: options,
      query: ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query,
    }).then((gqlResponse) => {
      ctx.set('Content-Type', 'application/json');
      ctx.body = gqlResponse;
    }, (error: HttpQueryError) => {
      if ( 'HttpQueryError' !== error.name ) {
        throw error;
      }

      if ( error.headers ) {
        Object.keys(error.headers).forEach((header) => {
          ctx.set(header, error.headers[header]);
        });
      }

      ctx.status = error.statusCode;
      ctx.body = error.message;
    });
  };
}

export function graphiqlKoa(options: GraphiQL.GraphiQLData) {
  return (ctx: koa.Context) => {

    const q = ctx.request.query || {};
    const query = q.query || '';
    const operationName = q.operationName || '';

    const graphiQLString = GraphiQL.renderGraphiQL({
      endpointURL: options.endpointURL,
      query: query || options.query,
      variables: q.variables && JSON.parse(q.variables) || options.variables,
      operationName: operationName || options.operationName,
      passHeader: options.passHeader,
    });
    ctx.set('Content-Type', 'text/html');
    ctx.body = graphiQLString;
  };
}
