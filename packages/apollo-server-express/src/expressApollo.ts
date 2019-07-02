import express from 'express';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import { ValueOrPromise } from 'apollo-server-env';

export interface ExpressGraphQLOptions extends GraphQLOptions {
  callNext?: boolean;
}

export interface ExpressGraphQLOptionsFunction {
  (req?: express.Request, res?: express.Response): ValueOrPromise<
    ExpressGraphQLOptions
  >;
}

// Design principles:
// - there is just one way allowed: POST request with JSON body. Nothing else.
// - simple, fast and secure
//

export function graphqlExpress(
  optionsCreator: ExpressGraphQLOptions | ExpressGraphQLOptionsFunction,
): express.Handler {
  if (!optionsCreator) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  return async (req, res, next): Promise<void> => {
    const options =
      typeof optionsCreator === 'function'
        ? await optionsCreator(req, res)
        : optionsCreator;

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
        res.write(graphqlResponse);
        res.end();
        if (options.callNext) next();
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
        res.write(error.message);
        res.end();
        if (options.callNext) next();
      },
    );
  };
}
