import express from 'express';
import corsMiddleware from 'cors';
import { json, OptionsJson } from 'body-parser';
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html';
import {
  GraphQLOptions,
  ApolloServerBase,
  ContextFunction,
  Context,
  Config,
  runHttpQuery,
  HttpQueryError,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import accepts from 'accepts';

export { GraphQLOptions } from 'apollo-server-core';

export interface GetMiddlewareOptions {
  path?: string;
  cors?:
    | corsMiddleware.CorsOptions
    | corsMiddleware.CorsOptionsDelegate
    | boolean;
  bodyParserConfig?: OptionsJson | boolean;
  onHealthCheck?: (req: express.Request) => Promise<any>;
  disableHealthCheck?: boolean;
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

export interface ApolloServerExpressConfig extends Config {
  context?: ContextFunction<ExpressContext, Context> | Context;
}

export class ApolloServer extends ApolloServerBase {
  constructor(config: ApolloServerExpressConfig) {
    super(config);
  }

  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(
    req: express.Request,
    res: express.Response,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req, res });
  }

  public applyMiddleware({ app, ...rest }: ServerRegistration) {
    // getMiddleware calls this too, but we want the right method name in the error
    this.assertStarted('applyMiddleware');

    app.use(this.getMiddleware(rest));
  }

  // TODO: While `express` is not Promise-aware, this should become `async` in
  // a major release in order to align the API with other integrations (e.g.
  // Hapi) which must be `async`.
  public getMiddleware({
    path,
    cors,
    bodyParserConfig,
    disableHealthCheck,
    onHealthCheck,
  }: GetMiddlewareOptions = {}): express.Router {
    if (!path) path = '/graphql';

    this.assertStarted('getMiddleware');

    const router = express.Router();

    if (!disableHealthCheck) {
      router.use('/.well-known/apollo/server-health', (req, res) => {
        // Response follows https://tools.ietf.org/html/draft-inadarei-api-health-check-01
        res.type('application/health+json');

        if (onHealthCheck) {
          onHealthCheck(req)
            .then(() => {
              res.json({ status: 'pass' });
            })
            .catch(() => {
              res.status(503).json({ status: 'fail' });
            });
        } else {
          res.json({ status: 'pass' });
        }
      });
    }

    // XXX multiple paths?
    this.graphqlPath = path;

    // Note that we don't just pass all of these handlers to a single app.use call
    // for 'connect' compatibility.
    if (cors === true) {
      router.use(path, corsMiddleware<corsMiddleware.CorsRequest>());
    } else if (cors !== false) {
      router.use(path, corsMiddleware(cors));
    }

    if (bodyParserConfig === true) {
      router.use(path, json());
    } else if (bodyParserConfig !== false) {
      router.use(path, json(bodyParserConfig));
    }

    // Note: if you enable playground in production and expect to be able to see your
    // schema, you'll need to manually specify `introspection: true` in the
    // ApolloServer constructor; by default, the introspection query is only
    // enabled in dev.
    router.use(path, (req, res, next) => {
      if (this.playgroundOptions && req.method === 'GET') {
        // perform more expensive content-type check only if necessary
        // XXX We could potentially move this logic into the GuiOptions lambda,
        // but I don't think it needs any overriding
        const accept = accepts(req);
        const types = accept.types() as string[];
        const prefersHTML =
          types.find(
            (x: string) => x === 'text/html' || x === 'application/json',
          ) === 'text/html';

        if (prefersHTML) {
          const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
            endpoint: req.originalUrl,
            ...this.playgroundOptions,
          };
          res.setHeader('Content-Type', 'text/html');
          const playground = renderPlaygroundPage(playgroundRenderPageOptions);
          res.write(playground);
          res.end();
          return;
        }
      }

      runHttpQuery([req, res], {
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

          // Using `.send` is a best practice for Express, but we also just use
          // `.end` for compatibility with `connect`.
          if (typeof res.send === 'function') {
            res.send(graphqlResponse);
          } else {
            res.end(graphqlResponse);
          }
        },
        (error: HttpQueryError) => {
          if ('HttpQueryError' !== error.name) {
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

    return router;
  }
}
