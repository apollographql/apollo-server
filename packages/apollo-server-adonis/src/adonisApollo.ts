import Context from '@adonisjs/framework/src/Context';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';

export interface AdonisGraphQLOptionsFunction {
  (ctx: Context): GraphQLOptions | Promise<GraphQLOptions>;
}

export interface AdonisHandler {
  (ctx: Context): void;
}

export function graphqlAdonis(
  options: GraphQLOptions | AdonisGraphQLOptionsFunction,
): AdonisHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    // TODO: test this
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler = (ctx: Context): Promise<void> => {
    const method = ctx.request.method();
    let query = method === 'POST' ? ctx.request._body : ctx.request._qs;
    if (query === null) {
      query = undefined;
    }
    return runHttpQuery([ctx], {
      method,
      query,
      options: options,
      request: convertNodeHttpToRequest(ctx.request.request),
    }).then(
      ({ graphqlResponse, responseInit }) => {
        Object.keys(responseInit.headers).forEach(key =>
          ctx.response.header(key, responseInit.headers[key]),
        );
        ctx.response.send(graphqlResponse);
      },
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) {
          throw error;
        }

        if (error.headers) {
          Object.keys(error.headers).forEach(header => {
            ctx.response.header(header, error.headers[header]);
          });
        }

        ctx.response.status(error.statusCode).send(error.message);
      },
    );
  };

  return graphqlHandler;
}
