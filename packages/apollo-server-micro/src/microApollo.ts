import {
  GraphQLOptions,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import { send, json, RequestHandler } from 'micro';
import url from 'url';
import { IncomingMessage, ServerResponse } from 'http';
import { forAwaitEach } from 'iterall';

import { MicroRequest } from './types';

// Allowed Micro Apollo Server options.
export interface MicroGraphQLOptionsFunction {
  (req?: IncomingMessage): GraphQLOptions | Promise<GraphQLOptions>;
}

// Utility function used to set multiple headers on a response object.
function setHeaders(res: ServerResponse, headers: Object): void {
  Object.keys(headers).forEach((header: string) => {
    res.setHeader(header, headers[header]);
  });
}

// Build and return an async function that passes incoming GraphQL requests
// over to Apollo Server for processing, then fires the results/response back
// using Micro's `send` functionality.
export function graphqlMicro(
  options: GraphQLOptions | MicroGraphQLOptionsFunction,
): RequestHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler = async (req: MicroRequest, res: ServerResponse) => {
    let query;
    try {
      query =
        req.method === 'POST'
          ? req.filePayload || (await json(req))
          : url.parse(req.url, true).query;
    } catch (error) {
      // Do nothing; `query` stays `undefined`
    }

    try {
      const {
        graphqlResponse,
        graphqlResponses,
        responseInit,
      } = await runHttpQuery([req, res], {
        method: req.method,
        options,
        query,
        request: convertNodeHttpToRequest(req),
        enableDefer: true,
      });
      setHeaders(res, responseInit.headers);

      if (graphqlResponses) {
        // This is a deferred response, so send it as patches become ready.
        // Update the content type to be able to send multipart data
        // See: https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
        // Note that we are sending JSON strings, so we can use a simple
        // "-" as the boundary delimiter.
        res.setHeader('Content-Type', 'multipart/mixed; boundary="-"');
        const contentTypeHeader = 'Content-Type: application/json\r\n';
        const boundary = '\r\n---\r\n';
        const terminatingBoundary = '\r\n-----\r\n';

        res.writeHead(200);

        await forAwaitEach(graphqlResponses, data => {
          const contentLengthHeader = `Content-Length: ${Buffer.byteLength(
            data as string,
            'utf8',
          ).toString()}\r\n\r\n`;

          res.write(boundary + contentTypeHeader + contentLengthHeader + data);
        });

        // Finish up multipart with the last encapsulation boundary
        res.write(terminatingBoundary);
        res.end();
        return undefined;

      } else {
        return graphqlResponse;
      }

    } catch (error) {
      if ('HttpQueryError' === error.name && error.headers) {
        setHeaders(res, error.headers);
      }

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      send(res, error.statusCode, error.message);
      return undefined;
    }
  };

  return graphqlHandler;
}
