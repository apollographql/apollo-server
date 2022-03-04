import type express from 'express';
import {
  ApolloServerBase,
  runHttpQuery,
  convertNodeHttpToRequest,
  isHttpQueryError,
} from '..';
import accepts from 'accepts';
import asyncHandler from 'express-async-handler';
import type { BaseContext } from '@apollo/server-types';
import { debugFromNodeEnv, throwHttpGraphQLError } from '../runHttpQuery';

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
          '`res.body` is not set; this probably means you forgot to set up the ' +
            '`body-parser` middleware before the Apollo Server middleware.',
        );
        return;
      }

      function handleError(error: any) {
        if (!isHttpQueryError(error)) {
          throw error;
        }

        if (error.headers) {
          for (const [name, value] of Object.entries(error.headers)) {
            res.setHeader(name, value);
          }
        }

        res.statusCode = error.statusCode;
        res.send(error.message);
        return;
      }

      // TODO(AS4): Invoke the context function via some ApolloServer method
      // that does error handling in a consistent and plugin-visible way. For
      // now we will fall back to some old code that throws an HTTP-GraphQL
      // error and we will catch and handle it, blah.
      let context;
      try {
        context = await contextFunction({ req, res });
      } catch (e: any) {
        try {
          // XXX `any` isn't ideal, but this is the easiest thing for now, without
          // introducing a strong `instanceof GraphQLError` requirement.
          e.message = `Context creation failed: ${e.message}`;
          // For errors that are not internal, such as authentication, we
          // should provide a 400 response
          const statusCode =
            e.extensions &&
            e.extensions.code &&
            e.extensions.code !== 'INTERNAL_SERVER_ERROR'
              ? 400
              : 500;
          throwHttpGraphQLError(statusCode, [e], {
            debug:
              this.requestOptions.debug ??
              debugFromNodeEnv(this.requestOptions.nodeEnv),
            formatError: this.requestOptions.formatError,
          });
        } catch (error: any) {
          handleError(error);
          return;
        }
      }

      let r;
      try {
        r = await runHttpQuery({
          method: req.method,
          // TODO(AS4): error handling
          options: await this.graphQLServerOptions(),
          context,
          query: req.method === 'POST' ? req.body : req.query,
          request: convertNodeHttpToRequest(req),
        });
      } catch (error: any) {
        handleError(error);
        return;
      }

      const { graphqlResponse, responseInit } = r;

      if (responseInit.headers) {
        for (const [name, value] of Object.entries(responseInit.headers)) {
          res.setHeader(name, value);
        }
      }
      res.statusCode = responseInit.status || 200;

      res.send(graphqlResponse);
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
