import * as express from 'express';
import * as cors from 'cors';
import { json } from 'body-parser';
import { createServer, Server as HttpServer } from 'http';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';

import { ApolloServerBase } from './utils/ApolloServer';
import { ListenOptions, ServerInfo } from './utils/types';

export * from './utils/exports';

export class ApolloServer extends ApolloServerBase<
  express.Application,
  Request
> {
  registerMiddleware(config) {
    const { app, request } = config;
    app.use(
      config.endpoint,
      cors(config.cors),
      json(),
      graphqlExpress(request),
    );
    if (config.graphiql !== false) {
      app.get(config.graphiql, cors(config.cors), (req, res, next) =>
        graphiqlExpress({
          endpointURL: config.endpoint,
          ...(config.subscriptions !== false && {
            subscriptionsEndpoint: `ws://${req.headers.host}${config.endpoint}`,
          }),
        })(req, res, next),
      );
    }
  }

  getHttpServer(app) {
    return createServer(app);
  }
}
