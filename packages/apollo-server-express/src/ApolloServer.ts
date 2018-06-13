import express from 'express';
import corsMiddleware from 'cors';
import { json, OptionsJson } from 'body-parser';
import { createServer } from 'http';
import gui from 'graphql-playground-middleware-express';
import { ApolloServerBase, formatApolloErrors } from 'apollo-server-core';
import accepts from 'accepts';
import typeis from 'type-is';

import { graphqlExpress } from './expressApollo';

import {
  processRequest as processFileUploads,
  GraphQLUpload,
} from 'apollo-upload-server';

export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';
import { GraphQLOptions } from 'apollo-server-core';

const gql = String.raw;

export class ApolloServer extends ApolloServerBase {
  //This translates the arguments from the middleware into graphQL options It
  //provides typings for the integration specific behavior, ideally this would
  //be propagated with a generic to the super class
  async createGraphQLServerOptions(
    req: express.Request,
    res: express.Response,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req, res });
  }
}

export interface ServerRegistration {
  // Note: You can also pass a connect.Server here. If we changed this field to
  // `express.Application | connect.Server`, it would be very hard to get the
  // app.use calls to typecheck even though they do work properly. Our
  // assumption is that very few people use connect with TypeScript (and in fact
  // we suspect the only connect users left writing GraphQL apps are Meteor
  // users).
  app: express.Application;
  server: ApolloServer;
  path?: string;
  cors?: corsMiddleware.CorsOptions | boolean;
  bodyParserConfig?: OptionsJson | boolean;
  onHealthCheck?: (req: express.Request) => Promise<any>;
  disableHealthCheck?: boolean;
  enableGUI?: boolean;
  //https://github.com/jaydenseric/apollo-upload-server#options
  uploads?: boolean | Record<string, any>;
}

const fileUploadMiddleware = (
  uploadsConfig: Record<string, any>,
  server: ApolloServerBase,
) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  // Note: we use typeis directly instead of via req.is for connect support.
  if (typeis(req, ['multipart/form-data'])) {
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
  enableGUI,
  onHealthCheck,
  uploads,
}: ServerRegistration) => {
  if (!path) path = '/graphql';

  if (!disableHealthCheck) {
    //uses same path as engine proxy, but is generally useful.
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

  // Note that we don't just pass all of these handlers to a single app.use call
  // for 'connect' compatibility.
  if (cors === true) {
    app.use(path, corsMiddleware());
  } else if (cors !== false) {
    app.use(path, corsMiddleware(cors));
  }

  if (bodyParserConfig === true) {
    app.use(path, json());
  } else if (bodyParserConfig !== false) {
    app.use(path, json(bodyParserConfig));
  }

  if (uploadsMiddleware) {
    app.use(path, uploadsMiddleware);
  }

  app.use(path, (req, res, next) => {
    // make sure we check to see if graphql gui should be on
    // enableGUI takes precedence over the server tools setting
    if (
      (enableGUI || (enableGUI === undefined && !server.disableTools)) &&
      req.method === 'GET'
    ) {
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
    return graphqlExpress(server.createGraphQLServerOptions.bind(server))(
      req,
      res,
      next,
    );
  });
};
