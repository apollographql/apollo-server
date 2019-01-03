import express from 'express';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import { forAwaitEach } from 'iterall';

export interface ExpressGraphQLOptionsFunction {
  (req?: express.Request, res?: express.Response):
    | GraphQLOptions
    | Promise<GraphQLOptions>;
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
    // TODO: test this
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler = async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
  ) => {
    runHttpQuery([req, res], {
      method: req.method,
      options: options,
      query: req.method === 'POST' ? req.body : req.query,
      request: convertNodeHttpToRequest(req),
      enableDefer: true,
    }).then(
      async ({ graphqlResponse, graphqlResponses, responseInit }) => {
        if (responseInit.headers) {
            for (const [name, value] of Object.entries(responseInit.headers)) {
                res.setHeader(name, value);
            }
        }
        if (graphqlResponse) {
          res.write(graphqlResponse);
          res.end();
        } else if (graphqlResponses) {
          // This is a deferred response, so send it as patches become ready.
          // Update the content type to be able to send multipart data
          // See: https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
          // Note that we are sending JSON strings, so we can use a simple
          // "-" as the boundary delimiter.
          res.setHeader('Content-Type', 'multipart/mixed; boundary="-"');
          const contentTypeHeader = 'Content-Type: application/json\r\n';
          const boundary = '\r\n---\r\n';
          const terminatingBoundary = '\r\n-----\r\n';
          await forAwaitEach(graphqlResponses, data => {
            // Format each message as a proper multipart HTTP part
            const contentLengthHeader = `Content-Length: ${Buffer.byteLength(
              data as string,
              'utf8',
            ).toString()}\r\n\r\n`;
            res.write(
              boundary + contentTypeHeader + contentLengthHeader + data,
            );
          });

          // Finish up multipart with the last encapsulation boundary
          res.write(terminatingBoundary);
          res.end();
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
        res.write(error.message);
        res.end();
      },
    );
  };

  return graphqlHandler;
}
