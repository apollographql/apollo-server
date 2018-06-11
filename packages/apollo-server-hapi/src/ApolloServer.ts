import hapi from 'hapi';
import { ApolloServerBase, EngineLauncherOptions } from 'apollo-server-core';
import { parseAll } from 'accept';
import { renderPlaygroundPage } from 'graphql-playground-html';
import {
  processRequest as processFileUploads,
  GraphQLUpload,
} from 'apollo-upload-server';

import { graphqlHapi } from './hapiApollo';

const gql = String.raw;

export interface ServerRegistration {
  app?: hapi.Server;
  //The options type should exclude port
  options?: hapi.ServerOptions;
  server: ApolloServerBase<hapi.Request>;
  path?: string;
  cors?: boolean;
  onHealthCheck?: (req: hapi.Request) => Promise<any>;
  disableHealthCheck?: boolean;
  uploads?: boolean | Record<string, any>;
}

export interface HapiListenOptions {
  port?: number | string;
  host?: string; // default: ''. This is where engineproxy listens.
  pipePath?: string;
  graphqlPaths?: string[]; // default: ['/graphql']
  innerHost?: string; // default: '127.0.0.1'. This is where Node listens.
  launcherOptions?: EngineLauncherOptions;
}

const handleFileUploads = (uploadsConfig: Record<string, any>) => async (
  req: hapi.Request,
) => {
  if (req.mime === 'multipart/form-data') {
    Object.defineProperty(req, 'payload', {
      value: await processFileUploads(req, uploadsConfig),
      writable: false,
    });
  }
};

export const registerServer = async ({
  app,
  options,
  server,
  cors,
  path,
  disableHealthCheck,
  onHealthCheck,
  uploads,
}: ServerRegistration) => {
  if (!path) path = '/graphql';

  let hapiApp: hapi.Server;
  if (app) {
    hapiApp = app;
    if (options) {
      console.warn(`A Hapi Server was passed in, so the options are ignored`);
    }
  } else if (options) {
    if ((options as any).port) {
      throw new Error(`
The options for registerServer should not include a port, since autoListen is set to false. Please set the port under the http options in listen:

const server = new ApolloServer({ typeDefs, resolvers });

registerServer({
  server,
  options,
});

server.listen({ http: { port: YOUR_PORT_HERE } });
      `);
    }
    hapiApp = new hapi.Server({ ...options, autoListen: false });
  } else {
    hapiApp = new hapi.Server({ autoListen: false });
  }

  if (uploads !== false) {
    server.enhanceSchema({
      typeDefs: gql`
        scalar Upload
      `,
      resolvers: { Upload: GraphQLUpload },
    });
  }

  await hapiApp.ext({
    type: 'onRequest',
    method: async function(request, h) {
      if (request.path !== path) {
        return h.continue;
      }

      if (uploads !== false) {
        await handleFileUploads(typeof uploads !== 'boolean' ? uploads : {})(
          request,
        );
      }

      if (!server.disableTools && request.method === 'get') {
        //perform more expensive content-type check only if necessary
        const accept = parseAll(request.headers);
        const types = accept.mediaTypes as string[];
        const prefersHTML =
          types.find(
            (x: string) => x === 'text/html' || x === 'application/json',
          ) === 'text/html';

        if (prefersHTML) {
          return h
            .response(
              renderPlaygroundPage({
                subscriptionEndpoint: server.subscriptionsPath,
                endpoint: path,
                version: '1.4.0',
              }),
            )
            .type('text/html')
            .takeover();
        }
      }
      return h.continue;
    },
  });

  if (!disableHealthCheck) {
    await hapiApp.route({
      method: '*',
      path: '/.well-known/apollo/server-health',
      options: {
        cors: typeof cors === 'boolean' ? cors : true,
      },
      handler: async function(request, h) {
        if (onHealthCheck) {
          try {
            await onHealthCheck(request);
          } catch {
            const response = h.response({ status: 'fail' });
            response.code(503);
            response.type('application/health+json');
            return response;
          }
        }
        const response = h.response({ status: 'pass' });
        response.type('application/health+json');
        return response;
      },
    });
  }

  await hapiApp.register({
    plugin: graphqlHapi,
    options: {
      path: path,
      graphqlOptions: server.graphQLServerOptionsForRequest.bind(server),
      route: {
        cors: typeof cors === 'boolean' ? cors : true,
      },
    },
  });

  server.use({ path, getHttp: () => hapiApp.listener });

  const listen = server.listen.bind(server);
  server.listen = async options => {
    //requires that autoListen is false, so that
    //hapi sets up app.listener without start
    await hapiApp.start();

    //While this is not strictly necessary, it ensures that apollo server calls
    //listen first, setting the port. Otherwise the hapi server constructor
    //sets the port
    if (hapiApp.listener.listening) {
      throw Error(
        `
Ensure that constructor of Hapi server sets autoListen to false, as follows:

const app = Hapi.server({
  autoListen: false,
  //other parameters
});
        `,
      );
    }

    //starts the hapi listener at a random port when engine proxy used,
    //otherwise will start the server at the provided port
    return listen({ ...options });
  };
};
