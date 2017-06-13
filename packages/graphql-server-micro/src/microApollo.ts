import { GraphQLOptions, HttpQueryError, runHttpQuery } from 'graphql-server-core';
import * as GraphiQL from 'graphql-server-module-graphiql';
import { json } from 'micro';
import * as url from 'url';
import {IncomingMessage, ServerResponse} from 'http';

export interface MicroGraphQLOptionsFunction {
  (req?: IncomingMessage): GraphQLOptions | Promise<GraphQLOptions>;
}

export function microGraphql(options: GraphQLOptions | MicroGraphQLOptionsFunction) {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`);
  }

  return async function (req: IncomingMessage, res: ServerResponse) {
    let query;
    if (req.method === 'POST') {
      try {
        query = await json(req);
      } catch (err) {
        query = undefined;
      }
    } else {
      query = url.parse(req.url, true).query;
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

export interface MicroGraphiQLOptionsFunction {
  (req?: IncomingMessage): GraphiQL.GraphiQLData | Promise<GraphiQL.GraphiQLData>;
}

export function microGraphiql(options: GraphiQL.GraphiQLData | MicroGraphiQLOptionsFunction) {
  return (req: IncomingMessage, res: ServerResponse) => {
    const query = req.url && url.parse(req.url, true).query || {};
    GraphiQL.resolveGraphiQLString(query, options, req).then(graphiqlString => {
      res.setHeader('Content-Type', 'text/html');
      res.write(graphiqlString);
      res.end();
    }, error => {
      res.statusCode = 500;
      res.write(error.message);
      res.end();
    });
  };
}
