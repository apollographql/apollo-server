import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
} from 'apollo-server-core';
// import * as GraphiQL from 'apollo-server-module-graphiql';

// Design principles:
// - You can issue a GET or POST with your query.
// - simple, fast and secure
//

export function graphqlEdge(options: GraphQLOptions) {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler = async (req: Request): Promise<Response> => {
    if (req.method === 'OPTIONS') {
      return Promise.resolve(
        new Response('', {
          status: 204,
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
            'access-control-allow-headers': 'content-type',
            vary: 'Access-Control-Request-Headers',
          },
        }),
      );
    }
    const url = new URL(req.url);
    const query =
      req.method === 'POST'
        ? await req.json()
        : {
            query: url.searchParams.get('query'),
            variables: url.searchParams.get('variables'),
            operationName: url.searchParams.get('operationName'),
            extensions: url.searchParams.get('extensions'),
          };

    return runHttpQuery([req], {
      method: req.method,
      options: options,
      query,
    }).then(
      gqlResponse =>
        new Response(gqlResponse, {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
          },
        }),
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) throw error;

        const res = new Response(error.message, {
          status: error.statusCode,
          headers: {
            'content-type': 'application/json',
            'access-control-allow-origin': '*',
          },
        });

        if (error.headers) {
          Object.keys(error.headers).forEach(header => {
            res.headers[header] = error.headers[header];
          });
        }

        return res;
      },
    );
  };

  return graphqlHandler;
}
