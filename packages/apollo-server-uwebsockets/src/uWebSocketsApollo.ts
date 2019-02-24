import {
  GraphQLOptions,
  runHttpQuery,
} from 'apollo-server-core';
import url from 'url';
// import { parseAll } from 'accept';
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
    // Can't return or yield from here without responding or attaching an abort handler
    res.onAborted(() => {
      (res as any).aborted = true;
      console.log('ABORTED')
    });

    // Note: We need to make sure we do everything we need to with `req`
    // synchronously before it goes away
    const method = req.getMethod().toUpperCase()
    const request = convertNodeHttpToRequest(req)

    let query;

    try {
      // Handle reading queries from both request bodys and query params
      if (method === 'POST') {
        query = await json(res)
      } else {
        query = url.parse(req.getQuery(), true).query;
      }
    } catch (error) {
      // Do nothing; `query` stays `undefined`
    }

    try {
      const { graphqlResponse, responseInit } = await runHttpQuery([/*req, res*/], {
        method,
        options,
        query,
        request,
      });

      if ((res as any).aborted) {
        return
      }

      // Note: `responseInit.headers` includes content-type and content-length headers
      // uWS automatically adds a content-length header, adding duplicates causes issues
      // setHeaders(res, responseInit.headers);

      res.writeStatus('200')
      res.writeHeader('Content-Type', responseInit.headers['Content-Type'])
      res.writeHeader('Vary', 'Accept-Encoding, Origin')
      res.writeHeader('Status', '200')
      res.end(graphqlResponse)

      return
    } catch (error) {
      // console.log('(maybe) runHttpQuery error:', error)

      if ((res as any).aborted) {
        return
      }

      if (!error.statusCode) {
        error.statusCode = 500;
      }
      // Make sure we pass a string to `writeStatus`
      res.writeStatus(error.statusCode + '')

      // Make sure we set headers after setting status
      if ('HttpQueryError' === error.name && error.headers) {
        setHeaders(res, error.headers);
      }

      res.end(error.message)

      return
    }
  };

  return graphqlHandler;
}

export function graphqlPlayground(
  middlewareOptions: any,
  renderPlaygroundPage: (options: any) => string
): RequestHandler {
  return (
    res: HttpResponse,
  ) => {
    res.writeStatus('200')
    res.writeHeader('Content-Type', 'text/html; charset=utf-8');
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
    // Can't return or yield from here without responding or attaching an abort handler
    res.onAborted(() => {
      (res as any).aborted = true;
    });

    if ((res as any).aborted) {
      return
    }

    if (onHealthCheck) {
      try {
        await onHealthCheck(req);
      } catch (error) {
        if ((res as any).aborted) {
          return
        }

        // Note: `writeStatus` must be called before `writeHeader` otherwise status
        // will be set to `200`
        res.writeStatus('503')
        // Response follows
        // https://tools.ietf.org/html/draft-inadarei-api-health-check-01
        res.writeHeader('Content-Type', 'application/health+json');
        res.end(JSON.stringify({ status: 'fail' }))

        return
      }
    }

    if ((res as any).aborted) {
      return
    }

    res.writeStatus('200')
    // Response follows
    // https://tools.ietf.org/html/draft-inadarei-api-health-check-01
    res.writeHeader('Content-Type', 'application/health+json');
    res.end(JSON.stringify({ status: 'pass' }))
  }
}
