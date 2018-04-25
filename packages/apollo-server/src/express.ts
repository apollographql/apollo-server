import * as express from 'express';
import * as cors from 'cors';
import { json } from 'body-parser';
import { createServer, Server as HttpServer } from 'http';
import { graphqlExpress } from 'apollo-server-express';
import gui from 'graphql-playground-middleware-express';
import * as accepts from 'accepts';

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
    const path = config.path || '/graphql';

    app.use(path, cors(config.cors), json(), (req, res, next) => {
      if (config.gui !== false && req.method === 'GET') {
        //perform more expensive content-type check only if necessary
        const accept = accepts(req);
        const types = accept.types() as string[];
        const prefersHTML =
          types.find(
            (x: string) => x === 'text/html' || x === 'application/json',
          ) === 'text/html';

        if (prefersHTML) {
          return gui({
            endpoint: path,
            subscriptionsEndpoint: config.subscriptions && path,
          })(req, res, next);
        }
      }
      return graphqlExpress(request)(req, res, next);
    });
  }

  getHttpServer(app: express.Application): HttpServer {
    return createServer(app);
  }
}
