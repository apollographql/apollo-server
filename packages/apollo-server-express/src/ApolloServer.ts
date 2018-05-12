import * as express from 'express';
import * as corsMiddleware from 'cors';
import { json, OptionsJson } from 'body-parser';
import { createServer, Server as HttpServer } from 'http';
import gui from 'graphql-playground-middleware-express';
import { ApolloServerBase } from 'apollo-server-core';
import * as accepts from 'accepts';

import { graphqlExpress } from './expressApollo';

export interface ServerRegistration {
  app: express.Application;
  server: ApolloServerBase<express.Request>;
  path?: string;
  cors?: corsMiddleware.CorsOptions;
  bodyParserConfig?: OptionsJson;
}

export const registerServer = async ({
  app,
  server,
  path,
  cors,
  bodyParserConfig,
}: ServerRegistration) => {
  if (!path) path = '/graphql';

  // XXX multiple paths?
  server.use({
    path,
    getHttp: () => createServer(app),
  });

  app.use(
    path,
    corsMiddleware(cors),
    json(bodyParserConfig),
    (req, res, next) => {
      // make sure we check to see if graphql gui should be on
      if (!server.disableTools && req.method === 'GET') {
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
            subscriptionsEndpoint: server.subscriptionsPath,
          })(req, res, next);
        }
      }
      return graphqlExpress(server.request.bind(server))(req, res, next);
    },
  );
};
