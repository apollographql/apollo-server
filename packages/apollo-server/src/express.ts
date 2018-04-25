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

    app.use(config.path, cors(config.cors), json(), (req, res, next) => {
      // make sure we check to see if graphiql should be on
      // change opts.graphiql type to be boolean
      if (
        config.graphiql &&
        req.method === 'GET' &&
        req.headers['content-type'] !== 'application/json' &&
        req.params &&
        !req.params.query
      ) {
        // want to return graphiql
        return graphiql({
          endpoint: config.path,
          subscriptionsEndpoint: config.subscriptions && config.path,
        })(req, res, next);
      }
      return graphqlExpress(request)(req, res, next);
    });
  }

  getHttpServer(app: express.Application): HttpServer {
    return createServer(app);
  }
}
