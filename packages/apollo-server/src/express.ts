import * as express from 'express';
import * as cors from 'cors';
import { json } from 'body-parser';
import { createServer, Server as HttpServer } from 'http';
import { graphqlExpress } from 'apollo-server-express';
import graphiql from 'graphql-playground-middleware-express';

import { ApolloServerBase } from './utils/ApolloServer';
import { MiddlewareRegistrationOptions } from './utils/types';

export * from './utils/exports';

export class ApolloServer extends ApolloServerBase<
  express.Application,
  express.Request
> {
  registerMiddleware(
    config: MiddlewareRegistrationOptions<express.Application, express.Request>,
  ) {
    const { app, request } = config;
    app.use(
      config.endpoint,
      cors(config.cors),
      json(),
      graphqlExpress(request),
    );

    if (config.graphiql) {
      app.get(
        config.graphiql,
        cors(config.cors),
        graphiql({
          endpoint: config.endpoint,
          subscriptionsEndpoint: config.subscriptions && config.endpoint,
        }),
      );
    }
  }

  getHttpServer(app: express.Application): HttpServer {
    return createServer(app);
  }
}
