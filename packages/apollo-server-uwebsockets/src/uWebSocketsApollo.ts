import {
  GraphQLOptions,
  runHttpQuery,
} from 'apollo-server-core';
import url from 'url';
import { parseAll } from 'accept';
import { HttpRequest, HttpResponse } from 'uWebSockets.js'

import { RequestHandler } from './types'
import { convertNodeHttpToRequest } from './convertNodeHttpToRequest'
import { setHeaders, json } from './utils'

export interface uWebSocketsGraphQLOptionsFunction {
  (res: HttpResponse, req: HttpRequest): GraphQLOptions | Promise<GraphQLOptions>;
}
// Build and return an async function that passes incoming GraphQL requests
// over to Apollo Server for processing, then fires the results/response back
// using Micro's `send` functionality.
export function graphql(
  options: GraphQLOptions | uWebSocketsGraphQLOptionsFunction,
): RequestHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler = async (res: HttpResponse, req: HttpRequest) => {
    let query;

    try {
      query =
        req.getMethod() === 'POST'
          ? await json(res)
          : url.parse(req.getUrl(), true).query;
    } catch (error) {
      // Do nothing; `query` stays `undefined`
    }

    try {
      const { graphqlResponse, responseInit } = await runHttpQuery([req, res], {
        method: req.getMethod(),
        options,
        query,
        request: convertNodeHttpToRequest(req),
      });

      // Successfuly reply with a response
      setHeaders(res, responseInit.headers);
      res.end(graphqlResponse)

      return
    } catch (error) {
      if ('HttpQueryError' === error.name && error.headers) {
        setHeaders(res, error.headers);
      }

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      res.writeStatus(error.statusCode)
      res.end(error.message)

      return undefined;
    }
  };

  return graphqlHandler;
}

export function graphqlPlayground(
  middlewareOptions: any,
  renderPlaygroundPage: (options: any) => string
): RequestHandler {
  return async (
    res: HttpResponse,
    req: HttpRequest,
  ) => {
    // https://github.com/uNetworking/uWebSockets.js/issues/70
    // const accept = parseAll(req.headers);
    // const types = accept.mediaTypes as string[];

    // const prefersHTML =
    //   types.find(
    //     (x: string) => x === 'text/html' || x === 'application/json',
    //   ) === 'text/html';

    // if (prefersHTML) {
    //   res.writeHeader('Content-Type', 'text/html; charset=utf-8');
    //   res.writeStatus('200')
    //   res.end(renderPlaygroundPage(middlewareOptions))
    // }

    res.writeHeader('Content-Type', 'text/html; charset=utf-8');
    res.writeStatus('200')
    res.end(renderPlaygroundPage(middlewareOptions))
  }
}

export function healthCheck(
  onHealthCheck?: (req: HttpRequest) => Promise<void> | void
): RequestHandler {
  return async (
    res: HttpResponse,
    req: HttpRequest,
  ) => {
    // Response follows
    // https://tools.ietf.org/html/draft-inadarei-api-health-check-01
    res.writeHeader('Content-Type', 'application/health+json');

    if (onHealthCheck) {
      try {
        await onHealthCheck(req);
      } catch (error) {
        res.writeStatus('503')
        res.end(JSON.stringify({ status: 'fail' }))
        return
      }
    }

    res.writeStatus('200')
    res.end(JSON.stringify({ status: 'pass' }))
  }
}
