import * as express from 'express';
import * as corsMiddleware from 'cors';
import { json, OptionsJson } from 'body-parser';
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html';
import {
  ISettings,
  Tab,
} from '@apollographql/graphql-playground-html/dist/render-playground-page';
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
  gui?: GuiConfig | boolean;
}

type GuiConfig =
  | NonDynamicGuiConfig
  | ((req: express.Request) => NonDynamicGuiConfig);
type NonDynamicGuiConfig = Partial<GuiOptions> | boolean;

export interface GuiOptions {
  playgroundThemeOptions: Partial<ISettings>;
  playgroundTabOptions: Partial<Tab>[];
}

export const defaultGuiOptions: GuiOptions = {
  playgroundThemeOptions: {
    'general.betaUpdates': false,
    'editor.theme': 'dark',
    'editor.reuseHeaders': true,
    'tracing.hideTracingResponse': true,
    'editor.fontSize': 14,
    'editor.fontFamily': `'Source Code Pro', 'Consolas', 'Inconsolata', 'Droid Sans Mono', 'Monaco', monospace`,
    'request.credentials': 'omit',
  },
  playgroundTabOptions: [],
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
      // We cannot do an existence check on `gui` since it may be a boolean
      const nonDynamicGui: NonDynamicGuiConfig =
        gui !== undefined && gui !== null
          ? isNonDynamic(gui)
            ? gui
            : gui(req)
          : {};
      const enabled: boolean = isBoolean(nonDynamicGui) ? nonDynamicGui : true;
      const partialGuiOverrides: Partial<GuiOptions> = isBoolean(nonDynamicGui)
        ? {}
        : nonDynamicGui;

      // Disallow endpoints in pre-fill settings
      if (
        partialGuiOverrides.playgroundTabOptions &&
        partialGuiOverrides.playgroundTabOptions.filter(setting => {
          return !!setting.endpoint && setting.endpoint !== path;
        }).length > 0
      ) {
        // Should we just create the middlewares for any additional endpoints?
        // throw Error(`Please create a middleware for each additional endpoint on which you'd like GraphQL playground to be available.`)
      }

      const guiOptions: GuiOptions = {
        playgroundThemeOptions: enabled
          ? {
              ...defaultGuiOptions.playgroundThemeOptions,
              ...partialGuiOverrides.playgroundThemeOptions,
            }
          : null,
        playgroundTabOptions: enabled
          ? {
              ...defaultGuiOptions.playgroundTabOptions,
              ...partialGuiOverrides.playgroundTabOptions,
            }
          : null,
      };

      if (enabled && req.method === 'GET') {
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
            settings: guiOptions.playgroundThemeOptions as ISettings,
            tabs: guiOptions.playgroundTabOptions as Tab[],
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
function isPartialGui(gui: NonDynamicGuiConfig): gui is Partial<GuiOptions> {
  return (
    (<Partial<GuiOptions>>gui).playgroundThemeOptions !== undefined ||
    (<Partial<GuiOptions>>gui).playgroundTabOptions !== undefined
  );
}

// This is necessary to make TypeScript happy, since it cannot smart-cast types via conditional logic
function isBoolean(gui: NonDynamicGuiConfig): gui is boolean {
  return typeof gui === typeof true;
}

function isNonDynamic(gui: GuiConfig): gui is NonDynamicGuiConfig {
  return (
    isBoolean(<NonDynamicGuiConfig>gui) ||
    isPartialGui(<NonDynamicGuiConfig>gui)
  );
}
