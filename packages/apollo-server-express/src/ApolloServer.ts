import express from 'express';
import corsMiddleware from 'cors';
import { json, OptionsJson } from 'body-parser';
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html';
import {
  GraphQLOptions,
  FileUploadOptions,
  ApolloServerBase,
  formatApolloErrors,
} from 'apollo-server-core';
import accepts from 'accepts';
import typeis from 'type-is';

import { graphqlExpress } from './expressApollo';

import { processRequest as processFileUploads } from '@apollographql/apollo-upload-server';

export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';

export interface ServerRegistration {
  // Note: You can also pass a connect.Server here. If we changed this field to
  // `express.Application | connect.Server`, it would be very hard to get the
  // app.use calls to typecheck even though they do work properly. Our
  // assumption is that very few people use connect with TypeScript (and in fact
  // we suspect the only connect users left writing GraphQL apps are Meteor
  // users).
  app: express.Application;
  path?: string;
  cors?: corsMiddleware.CorsOptions | boolean;
  bodyParserConfig?: OptionsJson | boolean;
  onHealthCheck?: (req: express.Request) => Promise<any>;
  disableHealthCheck?: boolean;
}

const fileUploadMiddleware = (
  uploadsConfig: FileUploadOptions,
  server: ApolloServerBase,
) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  // Note: we use typeis directly instead of via req.is for connect support.
  if (typeis(req, ['multipart/form-data'])) {
    processFileUploads(req, uploadsConfig)
      .then(body => {
        req.body = body;
        next();
      })
      .catch(error => {
        if (error.status && error.expose) res.status(error.status);

        next(
          formatApolloErrors([error], {
            formatter: server.requestOptions.formatError,
            debug: server.requestOptions.debug,
          }),
        );
      });
  } else {
    next();
  }
};

export class ApolloServer extends ApolloServerBase {
  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(
    req: express.Request,
    res: express.Response,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req, res });
  }

  protected supportsSubscriptions(): boolean {
    return true;
  }

  protected supportsUploads(): boolean {
    return true;
  }

  // TODO: While `express` is not Promise-aware, this should become `async` in
  // a major release in order to align the API with other integrations (e.g.
  // Hapi) which must be `async`.
  public applyMiddleware({
    app,
    path,
    cors,
    bodyParserConfig,
    disableHealthCheck,
    onHealthCheck,
  }: ServerRegistration) {
    if (!path) path = '/graphql';

    // Despite the fact that this `applyMiddleware` function is `async` in
    // other integrations (e.g. Hapi), currently it is not for Express (@here).
    // That should change in a future version, but that would be a breaking
    // change right now (see comment above this method's declaration above).
    //
    // That said, we do need to await the `willStart` lifecycle event which
    // can perform work prior to serving a request.  Since Express doesn't
    // natively support Promises yet, we'll do this via a middleware that
    // calls `next` when the `willStart` finishes.  We'll kick off the
    // `willStart` right away, so hopefully it'll finish before the first
    // request comes in, but we won't call `next` on this middleware until it
    // does. (And we'll take care to surface any errors via the `.catch`-able.)
    const promiseWillStart = this.willStart();
    app.use(path, (_req, _res, next) => {
      promiseWillStart.then(() => next()).catch(next);
    });

    if (!disableHealthCheck) {
      app.use('/.well-known/apollo/server-health', (req, res) => {
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

    let uploadsMiddleware;
    if (this.uploadsConfig) {
      uploadsMiddleware = fileUploadMiddleware(this.uploadsConfig, this);
    }

    // XXX multiple paths?
    this.graphqlPath = path;

    // Note that we don't just pass all of these handlers to a single app.use call
    // for 'connect' compatibility.
    if (cors === true) {
      app.use(path, corsMiddleware());
    } else if (cors !== false) {
      app.use(path, corsMiddleware(cors));
    }

    if (bodyParserConfig === true) {
      app.use(path, json());
    } else if (bodyParserConfig !== false) {
      app.use(path, json(bodyParserConfig));
    }

    if (uploadsMiddleware) {
      app.use(path, uploadsMiddleware);
    }

    // Note: if you enable playground in production and expect to be able to see your
    // schema, you'll need to manually specify `introspection: true` in the
    // ApolloServer constructor; by default, the introspection query is only
    // enabled in dev.
    app.use(path, (req, res, next) => {
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
            endpoint: path,
            subscriptionEndpoint: this.subscriptionsPath,
            ...this.playgroundOptions,
          };
          res.setHeader('Content-Type', 'text/html');
          const playground = renderPlaygroundPage(playgroundRenderPageOptions);
          res.write(playground);
          res.end();
          return;
        }
      }
      return graphqlExpress(() => {
        return this.createGraphQLServerOptions(req, res);
      })(req, res, next);
    });
  }
}

export const registerServer = () => {
  throw new Error(
    'Please use server.applyMiddleware instead of registerServer. This warning will be removed in the next release',
  );
};
