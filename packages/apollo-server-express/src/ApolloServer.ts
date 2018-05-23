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
  onHealthCheck?: (req: express.Request) => Promise<any>;
  disableHealthCheck?: boolean;
}

export const registerServer = async ({
  app,
  server,
  path,
  cors,
  bodyParserConfig,
  disableHealthCheck,
  onHealthCheck,
}: ServerRegistration) => {
  if (!path) path = '/graphql';

  if (!disableHealthCheck) {
    //uses same path as engine
    app.use('/.well-known/apollo/server-health', (req, res, next) => {
      //Response follows https://tools.ietf.org/html/draft-inadarei-api-health-check-01
      res.type('application/health+json');

      if (onHealthCheck) {
        onHealthCheck(req)
          .then(() => {
            res.json({ status: 'pass' });
          })
          .catch(() => {
            res.status(503).json({ status: 'fail' });
          });
      } else {
        res.json({ status: 'pass' });
      }
    });
  }

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
