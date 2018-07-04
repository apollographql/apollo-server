import * as express from 'express';
import * as corsMiddleware from 'cors';
import { json, OptionsJson } from 'body-parser';
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html';
import { ISettings } from '@apollographql/graphql-playground-html/dist/render-playground-page';
import { ApolloServerBase, formatApolloErrors } from 'apollo-server-core';
import * as accepts from 'accepts';
import * as typeis from 'type-is';

import { graphqlExpress } from './expressApollo';

import { processRequest as processFileUploads } from 'apollo-upload-server';

export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';
import { GraphQLOptions, FileUploadOptions } from 'apollo-server-core';

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
  gui?: ((req: express.Request) => Partial<GuiOptions>) | Partial<GuiOptions>;
}

export interface GuiOptions {
  enabled: boolean;
  playgroundSettings: Partial<ISettings>;
}

export const defaultGuiOptions: GuiOptions = {
  enabled: process.env.NODE_ENV !== 'production',
  playgroundSettings: {
    'general.betaUpdates': false,
    'editor.theme': 'dark',
    'editor.reuseHeaders': true,
    'tracing.hideTracingResponse': true,
    'editor.fontSize': 14,
    'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
    'request.credentials': 'omit',
  },
};

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

  public applyMiddleware({
    app,
    path,
    cors,
    bodyParserConfig,
    disableHealthCheck,
    gui,
    onHealthCheck,
  }: ServerRegistration) {
    if (!path) path = '/graphql';

    if (!disableHealthCheck) {
      // uses same path as engine proxy, but is generally useful.
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

    // Note: if you enable a gui in production and expect to be able to see your
    // schema, you'll need to manually specify `introspection: true` in the
    // ApolloServer constructor; by default, the introspection query is only
    // enabled in dev.
    app.use(path, (req, res, next) => {
      let partialGuiOverrides: Partial<GuiOptions>;
      if (!gui) {
        partialGuiOverrides = {};
      } else if (isPartialGui(gui)) {
        partialGuiOverrides = gui;
      } else {
        partialGuiOverrides = gui(req);
      }

      console.log('partial enabled', partialGuiOverrides.enabled);
      const enabled =
        partialGuiOverrides.enabled !== undefined
          ? partialGuiOverrides.enabled
          : defaultGuiOptions.enabled;

      partialGuiOverrides.enabled
        ? partialGuiOverrides.enabled && defaultGuiOptions.enabled
        : defaultGuiOptions.enabled;
      console.log('overall enabled', enabled);
      const guiOptions: GuiOptions = {
        enabled,
        playgroundSettings: enabled
          ? {
              ...defaultGuiOptions.playgroundSettings,
              ...partialGuiOverrides.playgroundSettings,
            }
          : null,
      };

      if (guiOptions.enabled && req.method === 'GET') {
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
            version: this.playgroundVersion,
            settings: guiOptions.playgroundSettings as ISettings,
          };
          res.setHeader('Content-Type', 'text/html');
          const playground = renderPlaygroundPage(playgroundRenderPageOptions);
          res.write(playground);
          res.end();
          next();
          return;
        }
      }
      return graphqlExpress(this.createGraphQLServerOptions.bind(this))(
        req,
        res,
        next,
      );
    });
  }
}

export const registerServer = () => {
  throw new Error(
    'Please use server.applyMiddleware instead of registerServer. This warning will be removed in the next release',
  );
};

// XXX It would be great if there was a way to go through all properties of the parent to the Partial
// to perform this check, but that does not exist yet, so we will need to check each one of the properties
// of GuiOptions to see if there is anything set.
function isPartialGui(
  gui: Partial<GuiOptions> | ((req: express.Request) => Partial<GuiOptions>),
): gui is Partial<GuiOptions> {
  return (
    (<Partial<GuiOptions>>gui).enabled !== undefined ||
    (<Partial<GuiOptions>>gui).playgroundSettings !== undefined
  );
}
