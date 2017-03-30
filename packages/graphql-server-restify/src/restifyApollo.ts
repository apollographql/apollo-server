import * as restify from 'restify';
import * as url from 'url';
import { GraphQLOptions, HttpQueryError, runHttpQuery } from 'graphql-server-core';
import * as GraphiQL from 'graphql-server-module-graphiql';

export interface RestifyGraphQLOptionsFunction {
  (req?: restify.Request, res?: restify.Response): GraphQLOptions | Promise<GraphQLOptions>;
}

// Design principles:
// - You can issue a GET or POST with your query.
// - simple, fast and secure
//

export interface RestifyHandler {
  (req: restify.Request, res: restify.Response, next: restify.Next): void;
}

export function graphqlRestify(options: GraphQLOptions | RestifyGraphQLOptionsFunction): RestifyHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`);
  }

  return (req: restify.Request, res: restify.Response, next: restify.Next): void => {
    runHttpQuery([req, res], {
      method: req.method,
      options: options,
      query: req.method === 'POST' ? req.body : req.query,
    }).then((gqlResponse) => {
      res.setHeader('Content-Type', 'application/json');
      res.write(gqlResponse);
      res.end();
      next();
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
      next(false);
    });
  };
}

/* This middleware returns the html for the GraphiQL interactive query UI
 *
 * GraphiQLData arguments
 *
 * - endpointURL: the relative or absolute URL for the endpoint which GraphiQL will make queries to
 * - (optional) query: the GraphQL query to pre-fill in the GraphiQL UI
 * - (optional) variables: a JS object of variables to pre-fill in the GraphiQL UI
 * - (optional) operationName: the operationName to pre-fill in the GraphiQL UI
 * - (optional) result: the result of the query to pre-fill in the GraphiQL UI
 */

export function graphiqlRestify(options: GraphiQL.GraphiQLData) {
  return (req: restify.Request, res: restify.Response, next: restify.Next) => {
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
    next();
  };
}
