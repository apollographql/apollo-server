import * as express from 'express';
import * as cors from 'cors';
import { json } from 'body-parser';
import { createServer, Server as HttpServer } from 'http';
import { graphqlExpress } from 'apollo-server-express';
import gui from 'graphql-playground-middleware-express';
import * as accepts from 'accepts';

import { ApolloServerBase } from './utils/ApolloServer';
import { MiddlewareRegistrationOptions } from './utils/types';
import { launchGui } from './utils/launchGui';

export * from './utils/exports';

export class ApolloServer extends ApolloServerBase<
  express.Application,
  express.Request
> {
  registerMiddleware(
    config: MiddlewareRegistrationOptions<express.Application, express.Request>,
  ) {
    const { app, request } = config;
    config.path = config.path || '/graphql';

    app.use(config.path, cors(config.cors), json(), (req, res, next) => {
      if (launchGui(config, req, gui, req, res, next)) {
        return;
      }
      return graphqlExpress(request)(req, res, next);
    });
  }

  getHttpServer(app: express.Application): HttpServer {
    return createServer(app);
  }
}
