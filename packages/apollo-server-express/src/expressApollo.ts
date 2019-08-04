import express from 'express';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import { ValueOrPromise } from 'apollo-server-types';

export interface ExpressGraphQLOptionsFunction {
  (req: express.Request, res: express.Response): ValueOrPromise<GraphQLOptions>;
}

// Design principles:
// - there is just one way allowed: POST request with JSON body. Nothing else.
// - simple, fast and secure
//

export function graphqlExpress(
  options: GraphQLOptions | ExpressGraphQLOptionsFunction,
): express.Handler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  return (req, res, next): void => {
    runHttpQuery([req, res], {
      method: req.method,
      options: options,
      query: req.method === 'POST' ? req.body : req.query,
      request: convertNodeHttpToRequest(req),
    }).then(
      ({ graphqlResponse, responseInit }) => {
        if (responseInit.headers) {
          for (const [name, value] of Object.entries(responseInit.headers)) {
            res.setHeader(name, value);
          }
        }

        // Using `.send` is a best practice for Express, but we also just use
        // `.end` for compatibility with `connect`.
        if (typeof res.send === 'function') {
          res.send(graphqlResponse);
        } else {
          res.end(graphqlResponse);
        }
      },
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) {
          return next(error);
        }

        if (error.headers) {
          for (const [name, value] of Object.entries(error.headers)) {
            res.setHeader(name, value);
          }
        }

        res.statusCode = error.statusCode;
        if (typeof res.send === 'function') {
          // Using `.send` is a best practice for Express, but we also just use
          // `.end` for compatibility with `connect`.
          res.send(error.message);
        } else {
          res.end(error.message);
        }
      },
    );
  };
}
