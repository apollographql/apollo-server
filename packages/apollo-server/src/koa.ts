import * as koa from 'koa';
import * as cors from '@koa/cors';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';
import * as accepts from 'accepts';

import { createServer, Server as HttpServer } from 'http';
import { graphqlKoa } from 'apollo-server-koa';
import graphiql from 'graphql-playground-middleware-koa';

import { ApolloServerBase } from './utils/ApolloServer';
import { MiddlewareRegistrationOptions } from './utils/types';

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
    const path = config.path || '/graphql';
    const router = new koaRouter();

    router.use(path, cors(config.cors));
    router.use(path, koaBody());
    router.all(path, async (ctx, next) => {
      const accept = accepts(ctx.req);
      const types = accept.types() as string[];
      const isHTML =
        types.find(
          (x: string) => x === 'text/html' || x === 'application/json',
        ) === 'text/html';

      // make sure we check to see if graphiql should be on
      // change opts.graphiql type to be boolean
      if (config.graphiql !== false && ctx.req.method === 'GET' && isHTML) {
        return graphiql({
          endpoint: path,
          subscriptionsEndpoint: config.subscriptions && path,
        })(ctx, next);
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
