import * as express from 'express';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';

export interface ExpressGraphQLOptionsFunction {
  (req?: express.Request, res?: express.Response):
    | GraphQLOptions
    | Promise<GraphQLOptions>;
}

// Design principles:
// - there is just one way allowed: POST request with JSON body. Nothing else.
// - simple, fast and secure
//

export interface ExpressHandler {
  (req: express.Request, res: express.Response, next): void;
}

export function graphqlExpress(
  options: GraphQLOptions | ExpressGraphQLOptionsFunction,
): ExpressHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    // TODO: test this
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler = async (
    req: express.Request,
    res: express.Response,
    next,
  ) => {
    const a = runHttpQuery([req, res], {
      method: req.method,
      options: options,
      query: req.method === 'POST' ? req.body : req.query,
      request: convertNodeHttpToRequest(req),
    }).then(
      async ({ graphqlResponses, responseInit }) => {
        Object.keys(responseInit.headers).forEach(key =>
          res.setHeader(key, responseInit.headers[key]),
        );
        const isMultipart =
          responseInit.headers['Content-Type'].indexOf('multipart/mixed') >= 0;

        for await (let data of graphqlResponses) {
          // Write the boundary if sending multipart data, according to:
          // https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
          if (isMultipart) {
            res.write(data + '\r\n---\r\n'); // Simplest boundary
          } else {
            res.write(data);
          }
        }
        // Finish up multipart with the last encapsulation boundary
        if (isMultipart) {
          res.write('\r\n---');
        }
        res.end();
      },
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) {
          return next(error);
        }

        if (error.headers) {
          Object.keys(error.headers).forEach(header => {
            res.setHeader(header, error.headers[header]);
          });
        }

        res.statusCode = error.statusCode;
        res.write(error.message);
        res.end();
      },
    );
  };

  return graphqlHandler;
}
