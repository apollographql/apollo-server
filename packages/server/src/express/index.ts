import type express from 'express';
import { ApolloServerBase } from '..';
import accepts from 'accepts';
import asyncHandler from 'express-async-handler';
import type { BaseContext, HTTPGraphQLResponse } from '@apollo/server-types';
import { debugFromNodeEnv, executeContextFunction } from '../runHttpQuery';
import type { HTTPGraphQLRequest } from '@apollo/server-types';
import { runPotentiallyBatchedHttpQuery } from '../httpBatching';

export interface ExpressContext {
  req: express.Request;
  res: express.Response;
}

// Renaming this temporarily. We'll remove the concept of subclassing ApolloServer
// soon.
export class ApolloServerExpress<
  TContext extends BaseContext = BaseContext,
> extends ApolloServerBase<TContext> {
  // TODO: While `express` is not Promise-aware, this should become `async` in
  // a major release in order to align the API with other integrations (e.g.
  // Hapi) which must be `async`.
  public getMiddleware(
    contextFunction: (expressContext: ExpressContext) => Promise<TContext>,
  ): express.RequestHandler {
    this.assertStarted('getMiddleware');

    const landingPage = this.getLandingPage();

    return asyncHandler(async (req, res) => {
      function sendResponse(httpGraphQLResponse: HTTPGraphQLResponse) {
        for (const [key, value] of httpGraphQLResponse.headers) {
          res.setHeader(key, value);
        }
        res.statusCode = httpGraphQLResponse.statusCode || 200;
        res.send(httpGraphQLResponse.completeBody);
      }

      // TODO(AS4): move landing page logic into core
      if (landingPage && prefersHtml(req)) {
        res.setHeader('Content-Type', 'text/html');
        res.write(landingPage.html);
        res.end();
        return;
      }

      if (!req.body) {
        // The json body-parser *always* sets req.body to {} if it's unset (even
        // if the Content-Type doesn't match), so if it isn't set, you probably
        // forgot to set up body-parser. (Note that this may change in the future
        // body-parser@2.)
        res.status(500);
        res.send(
          '`req.body` is not set; this probably means you forgot to set up the ' +
            '`body-parser` middleware before the Apollo Server middleware.',
        );
        return;
      }

      const contextFunctionExecutionResult = await executeContextFunction(
        () => contextFunction({ req, res }),
        {
          debug:
            this.requestOptions.debug ??
            debugFromNodeEnv(this.requestOptions.nodeEnv),
          formatter: this.requestOptions.formatError,
        },
      );
      if (contextFunctionExecutionResult.errorHTTPGraphQLResponse) {
        sendResponse(contextFunctionExecutionResult.errorHTTPGraphQLResponse);
        return;
      }
      const { context } = contextFunctionExecutionResult;

      const headers = new Map<string, string>();
      for (const [key, value] of Object.entries(req.headers)) {
        if (value !== undefined) {
          // Node/Express headers can be an array or a single value. We join
          // multi-valued headers with `, ` just like the Fetch API's `Headers`
          // does. We assume that keys are already lower-cased (as per the Node
          // docs on IncomingMessage.headers) and so we don't bother to lower-case
          // them or combine across multiple keys that would lower-case to the
          // same value.
          headers.set(key, Array.isArray(value) ? value.join(', ') : value);
        }
      }

      // TODO(AS4): error handling but also just eliminating this class
      const serverOptions = await this.graphQLServerOptions();

      const httpGraphQLRequest: HTTPGraphQLRequest = {
        method: req.method.toUpperCase(),
        headers,
        searchParams: req.query,
        body: req.body,
      };

      // TODO(AS4): Make batching optional and off by default; perhaps move it
      // to a separate middleware.
      const httpGraphQLResponse = await runPotentiallyBatchedHttpQuery(
        httpGraphQLRequest,
        context,
        serverOptions,
      );
      if (httpGraphQLResponse.completeBody === null) {
        // TODO(AS4): Implement incremental delivery or improve error handling.
        throw Error('Incremental delivery not implemented');
      }
      sendResponse(httpGraphQLResponse);
    });
  }
}

function prefersHtml(req: express.Request): boolean {
  if (req.method !== 'GET') {
    return false;
  }
  const accept = accepts(req);
  const types = accept.types() as string[];
  return (
    types.find((x: string) => x === 'text/html' || x === 'application/json') ===
    'text/html'
  );
}
