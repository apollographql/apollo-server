import {
  GraphQLOptions,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import { json, RequestHandler, send } from 'micro';
import * as url from 'url';
import { IncomingMessage, ServerResponse } from 'http';

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

  const graphqlHandler = async (req: IncomingMessage, res: ServerResponse) => {
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
      const { graphqlResponse, responseInit } = await runHttpQuery([req, res], {
        method: req.method,
        options,
        query,
        request: convertNodeHttpToRequest(req),
      });
      setHeaders(res, responseInit.headers);
      send(res, 200, graphqlResponse);
    } catch (error) {
      if ('HttpQueryError' === error.name && error.headers) {
        setHeaders(res, error.headers);
      }

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      throw error;
    }
  };

  return graphqlHandler;
}

// Backwards compatibility with AS 1.x
export const microGraphql = graphqlMicro;
