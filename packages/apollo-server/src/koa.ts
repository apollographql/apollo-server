import * as koa from 'koa';
import * as cors from '@koa/cors';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import * as accepts from 'accepts';

import { createServer, Server as HttpServer } from 'http';
import { graphqlKoa } from 'apollo-server-koa';
import gui from 'graphql-playground-middleware-koa';

import { ApolloServerBase } from './utils/ApolloServer';
import { MiddlewareRegistrationOptions } from './utils/types';
import { launchGui } from './utils/launchGui';

export * from './utils/exports';

export class ApolloServer extends ApolloServerBase<
  koa,
  koa.Context,
  cors.Options
> {
  registerMiddleware(
    config: MiddlewareRegistrationOptions<koa, koa.Context, cors.Options>,
  ) {
    const { app, request } = config;
    config.path = config.path || '/graphql';
    const router = new koaRouter();

    router.use(config.path, cors(config.cors));
    router.use(config.path, koaBody());
    router.all(config.path, async (ctx, next) => {
      if (launchGui(config, ctx.req, gui, ctx, next)) {
        return;
      }

      return graphqlKoa(request)(ctx, next);
    });

    app.use(router.routes());
    app.use(router.allowedMethods());
  }

  getHttpServer(app: koa): HttpServer {
    return createServer(app.callback());
  }
}
