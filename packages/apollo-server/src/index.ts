import micro, { send } from 'micro';
import * as cors from 'cors';

import { microGraphiql, microGraphql } from 'apollo-server-micro';
import { get, post, router } from 'microrouter';

import { Server as HttpServer } from 'http';

import { ApolloServerBase } from './ApolloServer';
import { ListenOptions, ServerInfo } from './types';

export * from './exports';

const applyMiddleware = (middleware, req, res) =>
  new Promise(s => middleware(req, res, s));

export class ApolloServer extends ApolloServerBase<HttpServer> {
  constructor(opts) {
    super(opts);
  }

  createApp(): HttpServer {
    const graphql = microGraphql(this.request.bind(this));
    const graphiql = (req, res) =>
      microGraphiql({
        endpointURL: '/graphql',
        subscriptionsEndpoint: `ws://${req.headers.host}/graphql`,
      })(req, res);
    return micro(async (req, res) => {
      // cors
      await applyMiddleware(cors(), req, res);

      // execute queries and serve graphiql
      return router(
        get('/graphql', graphql),
        post('/graphql', graphql),
        get('/graphiql', graphiql),
        // XXX lets make a nice 404 page here
      )(req, res);
    });
  }

  getHttpServer(app) {
    return app;
  }
}
