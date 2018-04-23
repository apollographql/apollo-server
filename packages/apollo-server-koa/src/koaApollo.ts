import * as koa from 'koa';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
} from 'apollo-server-core';
import * as GraphiQL from 'apollo-server-module-graphiql';

export interface KoaGraphQLOptionsFunction {
  (ctx: koa.Context): GraphQLOptions | Promise<GraphQLOptions>;
}

export interface KoaHandler {
  (req: any, next): void;
}

export function graphqlKoa(
  options: GraphQLOptions | KoaGraphQLOptionsFunction,
): KoaHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler = (ctx: koa.Context): Promise<void> => {
    return runHttpQuery([ctx], {
      method: ctx.request.method,
      options: options,
      query:
        ctx.request.method === 'POST' ? ctx.request.body : ctx.request.query,
    }).then(
      gqlResponse => {
        ctx.set('Content-Type', 'application/json');
        ctx.body = gqlResponse;
      },
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) {
          throw error;
        }

        if (error.headers) {
          Object.keys(error.headers).forEach(header => {
            ctx.set(header, error.headers[header]);
          });
        }

        ctx.status = error.statusCode;
        ctx.body = error.message;
      },
    );
  };

  return graphqlHandler;
}

export interface KoaGraphiQLOptionsFunction {
  (ctx: koa.Context): GraphiQL.GraphiQLData | Promise<GraphiQL.GraphiQLData>;
}

export function graphiqlKoa(
  options: GraphiQL.GraphiQLData | KoaGraphiQLOptionsFunction,
) {
  const graphiqlHandler = (ctx: koa.Context) => {
    const query = ctx.request.query;
    return GraphiQL.resolveGraphiQLString(query, options, ctx).then(
      graphiqlString => {
        ctx.set('Content-Type', 'text/html');
        ctx.body = graphiqlString;
      },
      error => {
        ctx.status = 500;
        ctx.body = error.message;
      },
    );
  };

  return graphiqlHandler;
}
