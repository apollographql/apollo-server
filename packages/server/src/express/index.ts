import type express from 'express';
import { ApolloServerBase } from '..';
import Negotiator from 'negotiator';
import asyncHandler from 'express-async-handler';
import type { BaseContext } from '@apollo/server-types';
import type { HTTPGraphQLRequest } from '@apollo/server-types';

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

      const httpGraphQLRequest: HTTPGraphQLRequest = {
        method: req.method.toUpperCase(),
        headers,
        searchParams: req.query,
        body: req.body,
      };

      // TODO(AS4): Make batching optional and off by default; perhaps move it
      // to a separate middleware.
      const httpGraphQLResponse = await this.executeHTTPGraphQLRequest(
        httpGraphQLRequest,
        () => contextFunction({ req, res }),
      );
      if (httpGraphQLResponse.completeBody === null) {
        // TODO(AS4): Implement incremental delivery or improve error handling.
        throw Error('Incremental delivery not implemented');
      }

      for (const [key, value] of httpGraphQLResponse.headers) {
        res.setHeader(key, value);
      }
      res.statusCode = httpGraphQLResponse.statusCode || 200;
      res.send(httpGraphQLResponse.completeBody);
    });
  }
}

function prefersHtml(req: express.Request): boolean {
  if (req.method !== 'GET') {
    return false;
  }
  return (
    new Negotiator({ headers: { accept: req.header('accept') } }).mediaType([
      'application/json',
      'text/html',
    ]) === 'text/html'
  );
}
