import type express from 'express';
import {
  GraphQLOptions,
  ApolloServerBase,
  Config,
  runHttpQuery,
  convertNodeHttpToRequest,
  isHttpQueryError,
} from '..';
import accepts from 'accepts';

export interface ExpressContext {
  req: express.Request;
  res: express.Response;
}

export type ApolloServerExpressConfig = Config<ExpressContext>;

// Renaming this temporarily. We'll remove the concept of subclassing ApolloServer
// soon.
export class ApolloServerExpress<
  ContextFunctionParams = ExpressContext,
> extends ApolloServerBase<ContextFunctionParams> {
  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(
    req: express.Request,
    res: express.Response,
  ): Promise<GraphQLOptions> {
    const contextParams: ExpressContext = { req, res };
    return super.graphQLServerOptions(contextParams);
  }

  // TODO: While `express` is not Promise-aware, this should become `async` in
  // a major release in order to align the API with other integrations (e.g.
  // Hapi) which must be `async`.
  public getMiddleware(): express.RequestHandler {
    this.assertStarted('getMiddleware');

    const landingPage = this.getLandingPage();

    return (req, res, next) => {
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

      runHttpQuery([], {
        method: req.method,
        options: () => this.createGraphQLServerOptions(req, res),
        query: req.method === 'POST' ? req.body : req.query,
        request: convertNodeHttpToRequest(req),
      }).then(
        ({ graphqlResponse, responseInit }) => {
          if (responseInit.headers) {
            for (const [name, value] of Object.entries(responseInit.headers)) {
              res.setHeader(name, value);
            }
          }
          res.statusCode = responseInit.status || 200;

          res.send(graphqlResponse);
        },
        (error: Error) => {
          if (!isHttpQueryError(error)) {
            return next(error);
          }

          if (error.headers) {
            for (const [name, value] of Object.entries(error.headers)) {
              res.setHeader(name, value);
            }
          }

          res.statusCode = error.statusCode;
          res.send(error.message);
        },
      );
    };
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
