import * as express from 'express';
import * as corsMiddleware from 'cors';
import { json, OptionsJson } from 'body-parser';
import { createServer } from 'http';
import gui from 'graphql-playground-middleware-express';
import { ApolloServerBase, formatApolloErrors } from 'apollo-server-core';
import * as accepts from 'accepts';

import { graphqlExpress } from './expressApollo';

import {
  processRequest as processFileUploads,
  GraphQLUpload,
} from 'apollo-upload-server';

const gql = String.raw;

export interface ServerRegistration {
  app: express.Application;
  server: ApolloServerBase<express.Request>;
  path?: string;
  cors?: corsMiddleware.CorsOptions;
  bodyParserConfig?: OptionsJson;
  onHealthCheck?: (req: express.Request) => Promise<any>;
  disableHealthCheck?: boolean;
  //https://github.com/jaydenseric/apollo-upload-server#options
  uploads?: boolean | Record<string, any>;
}

const fileUploadMiddleware = (
  uploadsConfig: Record<string, any>,
  server: ApolloServerBase<express.Request>,
) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (req.is('multipart/form-data')) {
    processFileUploads(req, uploadsConfig)
      .then(body => {
        req.body = body;
        next();
      })
      .catch(error => {
        if (error.status && error.expose) res.status(error.status);

        next(
          formatApolloErrors([error], {
            formatter: server.requestOptions.formatError,
            debug: server.requestOptions.debug,
            logFunction: server.requestOptions.logFunction,
          }),
        );
      });
  } else {
    next();
  }
};

export const registerServer = async ({
  app,
  server,
  path,
  cors,
  bodyParserConfig,
  disableHealthCheck,
  onHealthCheck,
  uploads,
}: ServerRegistration) => {
  if (!path) path = '/graphql';

  if (!disableHealthCheck) {
    //uses same path as engine
    app.use('/.well-known/apollo/server-health', (req, res) => {
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

  let uploadsMiddleware;
  if (uploads !== false) {
    server.enhanceSchema({
      typeDefs: gql`
        scalar Upload
      `,
      resolvers: { Upload: GraphQLUpload },
    });

    uploadsMiddleware = fileUploadMiddleware(
      typeof uploads !== 'boolean' ? uploads : {},
      server,
    );
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
    uploadsMiddleware ? uploadsMiddleware : (_req, _res, next) => next(),
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
            subscriptionEndpoint: server.subscriptionsPath,
          })(req, res, next);
        }
      }
      return graphqlExpress(server.graphQLServerOptionsForRequest.bind(server))(
        req,
        res,
        next,
      );
    },
  );
};
