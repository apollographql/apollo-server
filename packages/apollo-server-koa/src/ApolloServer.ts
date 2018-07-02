import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as corsMiddleware from '@koa/cors';
import * as bodyParser from 'koa-bodyparser';
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
  // Note: You can also pass a connect.Server here. If we changed this field to
  // `express.Application | connect.Server`, it would be very hard to get the
  // app.use calls to typecheck even though they do work properly. Our
  // assumption is that very few people use connect with TypeScript (and in fact
  // we suspect the only connect users left writing GraphQL apps are Meteor
  // users).
  app: Koa;
  path?: string;
  cors?: corsMiddleware.Options | boolean;
  bodyParserConfig?: Object | boolean;
  onHealthCheck?: (ctx: Koa.Context) => Promise<any>;
  disableHealthCheck?: boolean;
  gui?: boolean;
}

const fileUploadMiddleware = (
  uploadsConfig: FileUploadOptions,
  server: ApolloServerBase,
) => (ctx: Koa.Context, next: Function) => {
  if (typeis(ctx.req, ['multipart/form-data'])) {
    return processFileUploads(ctx.req, uploadsConfig)
      .then(body => {
        ctx.request.body = body;
        return next();
      })
      .catch(error => {
        if (error.status && error.expose) ctx.status = error.status;

        throw formatApolloErrors([error], {
          formatter: server.requestOptions.formatError,
          debug: server.requestOptions.debug,
        });
      });
  } else {
    return next();
  }
};

export class ApolloServer extends ApolloServerBase {
  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(ctx: Koa.Context): Promise<GraphQLOptions> {
    return super.graphQLServerOptions(ctx);
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
    const router = new KoaRouter();

    if (!path) path = '/graphql';

    if (!disableHealthCheck) {
      // uses same path as engine proxy, but is generally useful.
      router.all('/.well-known/apollo/server-health', (ctx: Koa.Context) => {
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
      });
    }

    let uploadsMiddleware;
    if (this.uploadsConfig) {
      uploadsMiddleware = fileUploadMiddleware(this.uploadsConfig, this);
    }

    // XXX multiple paths?
    this.graphqlPath = path;

    const middleware = [];

    if (cors === true) {
      middleware.push(corsMiddleware());
    } else if (cors !== false) {
      middleware.push(corsMiddleware(cors));
    }

    if (bodyParserConfig === true) {
      middleware.push(bodyParser());
    } else if (bodyParserConfig !== false) {
      middleware.push(bodyParser(bodyParserConfig));
    }

    if (uploadsMiddleware) {
      middleware.push(uploadsMiddleware);
    }

    // Note: if you enable a gui in production and expect to be able to see your
    // schema, you'll need to manually specify `introspection: true` in the
    // ApolloServer constructor; by default, the introspection query is only
    // enabled in dev.
    const guiEnabled =
      !!gui || (gui === undefined && process.env.NODE_ENV !== 'production');

    middleware.push((ctx: Koa.Context, next: Function) => {
      if (guiEnabled && ctx.request.method === 'GET') {
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
            version: this.playgroundVersion,
          };
          ctx.set('Content-Type', 'text/html');
          const playground = renderPlaygroundPage(playgroundRenderPageOptions);
          ctx.body = playground;
          return next();
        }
      }
      return graphqlKoa(this.createGraphQLServerOptions.bind(this))(ctx, next);
    });

    router.all(path, ...middleware);

    app.use(router.routes());
    app.use(router.allowedMethods());
  }
}

export const registerServer = () => {
  throw new Error(
    'Please use server.applyMiddleware instead of registerServer. This warning will be removed in the next release',
  );
};
