import { GraphQLOptions, HttpQueryError, runHttpQuery } from 'apollo-server-core';
import * as GraphiQL from 'apollo-server-module-graphiql';
import { createError, json, RequestHandler } from 'micro';
import * as url from 'url';
import {IncomingMessage, ServerResponse} from 'http';

export interface MicroGraphQLOptionsFunction {
  (req?: IncomingMessage): GraphQLOptions | Promise<GraphQLOptions>;
}

export function microGraphql(options: GraphQLOptions | MicroGraphQLOptionsFunction): RequestHandler {
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

    try {
      const gqlResponse = await runHttpQuery([req, res], {
        method: req.method,
        options: options,
        query: query,
      });

      res.setHeader('Content-Type', 'application/json');
      return gqlResponse;
    } catch (error) {
      if ('HttpQueryError' === error.name) {
        if (error.headers) {
          Object.keys(error.headers).forEach((header) => {
            res.setHeader(header, error.headers[header]);
          });
        }
      }

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      throw error;
    }
  };
}

export interface MicroGraphiQLOptionsFunction {
  (req?: IncomingMessage): GraphiQL.GraphiQLData | Promise<GraphiQL.GraphiQLData>;
}

export function microGraphiql(options: GraphiQL.GraphiQLData | MicroGraphiQLOptionsFunction): RequestHandler {
  return (req: IncomingMessage, res: ServerResponse) => {
    const query = req.url && url.parse(req.url, true).query || {};
    return GraphiQL.resolveGraphiQLString(query, options, req).then(graphiqlString => {
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
