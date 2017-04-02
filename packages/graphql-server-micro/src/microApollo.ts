import { GraphQLOptions, HttpQueryError, runHttpQuery } from 'graphql-server-core';
import { json } from 'micro';
import * as url from 'url';

export interface MicroGraphQLOptionsFunction {
  (req?: Request): GraphQLOptions | Promise<GraphQLOptions>;
}

export function microGraphql(options: GraphQLOptions | MicroGraphQLOptionsFunction) {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`);
  }

  return async function (req, res) {
    var query;
    if (req.method === 'POST') {
      try {
        query = await json(req);
      } catch(err) {}
    } else {
      query = url.parse(req.url, true).query
    }

    runHttpQuery([req, res], {
      method: req.method,
      options: options,
      query: query,
    }).then((gqlResponse) => {
      res.setHeader('Content-Type', 'application/json');
      res.write(gqlResponse);
      res.end();
    }, (error: HttpQueryError) => {
      if ( 'HttpQueryError' !== error.name ) {
        throw error;
      }

      if ( error.headers ) {
        Object.keys(error.headers).forEach((header) => {
          res.setHeader(header, error.headers[header]);
        });
      }

      res.statusCode = error.statusCode;
      res.write(error.message);
      res.end();
    });
  };
}

