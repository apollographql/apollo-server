import express from 'express';
import corsMiddleware from 'cors';
import { json, OptionsJson } from 'body-parser';
import {
  GraphQLOptions,
  ApolloServerBase,
  Config,
  runHttpQuery,
  convertNodeHttpToRequest,
  isHttpQueryError,
} from '..';
import accepts from 'accepts';

export interface GetMiddlewareOptions {
  cors?:
    | corsMiddleware.CorsOptions
    | corsMiddleware.CorsOptionsDelegate
    | boolean;
  bodyParserConfig?: OptionsJson | boolean;
}

export interface ServerRegistration extends GetMiddlewareOptions {
  // Note: You can also pass a connect.Server here. If we changed this field to
  // `express.Application | connect.Server`, it would be very hard to get the
  // app.use calls to typecheck even though they do work properly. Our
  // assumption is that very few people use connect with TypeScript (and in fact
  // we suspect the only connect users left writing GraphQL apps are Meteor
  // users).
  app: express.Application;
}

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
  public getMiddleware({
    cors,
    bodyParserConfig,
  }: GetMiddlewareOptions = {}): express.RequestHandler {
    this.assertStarted('getMiddleware');

    const app = express();

    // Note that we don't just pass all of these handlers to a single app.use call
    // for 'connect' compatibility.
    if (cors === true) {
      app.use(corsMiddleware<corsMiddleware.CorsRequest>());
    } else if (cors !== false) {
      app.use(corsMiddleware(cors));
    }

    if (bodyParserConfig === true) {
      app.use(json());
    } else if (bodyParserConfig !== false) {
      app.use(json(bodyParserConfig));
    }

    const landingPage = this.getLandingPage();
    app.use((req, res, next) => {
      if (landingPage && prefersHtml(req)) {
        res.setHeader('Content-Type', 'text/html');
        res.write(landingPage.html);
        res.end();
        return;
      }

      if (!req.body) {
        // The json body-parser *always* sets req.body to {} if it's unset (even
        // if the Content-Type doesn't match), so if it isn't set, you probably
        // forgot to set up body-parser.
        res.status(500);
        if (bodyParserConfig === false) {
          res.send(
            '`res.body` is not set; you passed `bodyParserConfig: false`, ' +
              'but you still need to use `body-parser` middleware yourself.',
          );
        } else {
          res.send(
            '`res.body` is not set even though Apollo Server installed ' +
              "`body-parser` middleware; this shouldn't happen!",
          );
        }
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

          // Using `.send` is a best practice for Express, but we also just use
          // `.end` for compatibility with `connect`.
          if (typeof res.send === 'function') {
            res.send(graphqlResponse);
          } else {
            res.end(graphqlResponse);
          }
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
          if (typeof res.send === 'function') {
            // Using `.send` is a best practice for Express, but we also just use
            // `.end` for compatibility with `connect`.
            res.send(error.message);
          } else {
            res.end(error.message);
          }
        },
      );
    });

    return app;
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
