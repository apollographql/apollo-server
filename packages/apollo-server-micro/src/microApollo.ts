import {
  GraphQLOptions,
  runHttpQuery,
  convertNodeHttpToRequest,
  isHttpQueryError,
} from 'apollo-server-core';
import { send, json, RequestHandler } from 'micro';
import url from 'url';
import type { IncomingMessage, ServerResponse } from 'http';
import typeis from 'type-is';

import type { MicroRequest } from './types';
import type { ValueOrPromise } from 'apollo-server-types';

// Allowed Micro Apollo Server options.
export interface MicroGraphQLOptionsFunction {
  (req?: IncomingMessage): ValueOrPromise<GraphQLOptions>;
}

// Utility function used to set multiple headers on a response object.
function setHeaders(
  res: ServerResponse,
  headers: Record<string, string>,
): void {
  Object.entries(headers).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
}

// Build and return an async function that passes incoming GraphQL requests
// over to Apollo Server for processing, then fires the results/response back
// using Micro's `send` functionality.
export function graphqlMicro(
  options: GraphQLOptions | MicroGraphQLOptionsFunction,
  csrfPreventionRequestHeaders?: string[] | null,
): RequestHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  const graphqlHandler = async (req: MicroRequest, res: ServerResponse) => {
    const contentType = req.headers['content-type'];
    const query =
      req.method === 'POST'
        ? req.filePayload ||
          (contentType &&
            req.headers['content-length'] &&
            req.headers['content-length'] !== '0' &&
            typeis.is(contentType, 'application/json') &&
            (await json(req)))
        : url.parse(req.url!, true).query;

    try {
      const { graphqlResponse, responseInit } = await runHttpQuery(
        [req, res],
        {
          method: req.method!,
          options,
          query: query as any,
          request: convertNodeHttpToRequest(req),
        },
        csrfPreventionRequestHeaders,
      );
      setHeaders(res, responseInit.headers!);
      const statusCode = responseInit.status || 200;
      send(res, statusCode, graphqlResponse);
      return undefined;
    } catch (error) {
      if (isHttpQueryError(error) && error.headers) {
        setHeaders(res, error.headers);
      }

      send(res, (error as any).statusCode || 500, (error as Error).message);
      return undefined;
    }
  };

  return graphqlHandler;
}
