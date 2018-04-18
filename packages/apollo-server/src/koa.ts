import * as koa from 'koa';
import * as cors from '@koa/cors';
import * as koaRouter from 'koa-router';
import * as koaBody from 'koa-bodyparser';

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
    const router = new koaRouter();

    router.use(config.endpoint, cors(config.cors));
    router.use(config.endpoint, koaBody());
    router.get(config.endpoint, graphqlKoa(request));
    router.post(config.endpoint, graphqlKoa(request));

    if (config.graphiql) {
      router.use(config.graphiql, cors(config.cors));
      router.get(
        config.graphiql,
        graphiql({
          endpoint: config.endpoint,
          subscriptionsEndpoint: config.subscriptions && config.endpoint,
        }),
      );
    }

    app.use(router.routes());
    app.use(router.allowedMethods());
  }

  getHttpServer(app: koa): HttpServer {
    return createServer(app.callback());
  }
}
