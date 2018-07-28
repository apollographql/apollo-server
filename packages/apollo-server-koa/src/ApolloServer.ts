import * as Koa from 'koa';
import * as corsMiddleware from '@koa/cors';
import * as bodyParser from 'koa-bodyparser';
import * as compose from 'koa-compose';
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html';
import { ApolloServerBase, formatApolloErrors } from 'apollo-server-core';
import * as accepts from 'accepts';
import * as typeis from 'type-is';

import { graphqlKoa } from './koaApollo';

import { processRequest as processFileUploads } from 'apollo-upload-server';

export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';
import { GraphQLOptions, FileUploadOptions } from 'apollo-server-core';

export interface ServerRegistration {
  app: Koa;
  path?: string;
  cors?: corsMiddleware.Options | boolean;
  bodyParserConfig?: bodyParser.Options | boolean;
  onHealthCheck?: (ctx: Koa.Context) => Promise<any>;
  disableHealthCheck?: boolean;
}

const fileUploadMiddleware = (
  uploadsConfig: FileUploadOptions,
  server: ApolloServerBase,
) => async (ctx: Koa.Context, next: Function) => {
  if (typeis(ctx.req, ['multipart/form-data'])) {
    try {
      ctx.request.body = await processFileUploads(ctx.req, uploadsConfig);
      return next();
    } catch (error) {
      if (error.status && error.expose) ctx.status = error.status;

      throw formatApolloErrors([error], {
        formatter: server.requestOptions.formatError,
        debug: server.requestOptions.debug,
      });
    }
  } else {
    return next();
  }
};

const middlewareFromPath = (
  path: string,
  middleware: compose.Middleware<Koa.Context>,
) => (ctx: Koa.Context, next: () => Promise<any>) => {
  if (ctx.path === path) {
    return middleware(ctx, next);
  } else {
    return next();
  }
};

export class ApolloServer extends ApolloServerBase {
  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(ctx: Koa.Context): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ ctx });
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
    onHealthCheck,
  }: ServerRegistration) {
    if (!path) path = '/graphql';

    if (!disableHealthCheck) {
      // uses same path as engine proxy, but is generally useful.
      app.use(
        middlewareFromPath(
          '/.well-known/apollo/server-health',
          (ctx: Koa.Context) => {
            // Response follows https://tools.ietf.org/html/draft-inadarei-api-health-check-01
            ctx.set('Content-Type', 'application/health+json');

            if (onHealthCheck) {
              return onHealthCheck(ctx)
                .then(() => {
                  ctx.body = { status: 'pass' };
                })
                .catch(() => {
                  ctx.status = 503;
                  ctx.body = { status: 'fail' };
                });
            } else {
              ctx.body = { status: 'pass' };
            }
          },
        ),
      );
    }

    let uploadsMiddleware;
    if (this.uploadsConfig) {
      uploadsMiddleware = fileUploadMiddleware(this.uploadsConfig, this);
    }

    this.graphqlPath = path;

    if (cors === true) {
      app.use(middlewareFromPath(path, corsMiddleware()));
    } else if (cors !== false) {
      app.use(middlewareFromPath(path, corsMiddleware(cors)));
    }

    if (bodyParserConfig === true) {
      app.use(middlewareFromPath(path, bodyParser()));
    } else if (bodyParserConfig !== false) {
      app.use(middlewareFromPath(path, bodyParser(bodyParserConfig)));
    }

    if (uploadsMiddleware) {
      app.use(middlewareFromPath(path, uploadsMiddleware));
    }

    app.use(
      middlewareFromPath(path, (ctx: Koa.Context, next: Function) => {
        if (this.playgroundOptions && ctx.request.method === 'GET') {
          // perform more expensive content-type check only if necessary
          const accept = accepts(ctx.req);
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
            ctx.set('Content-Type', 'text/html');
            const playground = renderPlaygroundPage(
              playgroundRenderPageOptions,
            );
            ctx.body = playground;
            return;
          }
        }
        return graphqlKoa(this.createGraphQLServerOptions.bind(this))(
          ctx,
          next,
        );
      }),
    );
  }
}

export const registerServer = () => {
  throw new Error(
    'Please use server.applyMiddleware instead of registerServer. This warning will be removed in the next release',
  );
};
