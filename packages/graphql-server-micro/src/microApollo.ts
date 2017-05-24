import { GraphQLOptions, HttpQueryError, runHttpQuery } from 'graphql-server-core';
import * as GraphiQL from 'graphql-server-module-graphiql';
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

export function microGraphiql(options: GraphiQL.GraphiQLData): RequestHandler {
  return (req: IncomingMessage, res: ServerResponse) => {
    const q = req.url && url.parse(req.url, true).query || {};
    const query = q.query || '';
    const operationName = q.operationName || '';

    const graphiQLString = GraphiQL.renderGraphiQL({
      endpointURL: options.endpointURL,
      query: query || options.query,
      variables: q.variables && JSON.parse(q.variables) || options.variables,
      operationName: operationName || options.operationName,
      passHeader: options.passHeader,
    });
    res.setHeader('Content-Type', 'text/html');
    res.write(graphiQLString);
    res.end();
  };
}
