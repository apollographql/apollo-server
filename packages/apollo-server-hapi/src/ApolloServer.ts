import * as hapi from 'hapi';
import { createServer, Server as HttpServer } from 'http';
import { ApolloServerBase, EngineLauncherOptions } from 'apollo-server-core';
import { parseAll } from 'accept';
import { renderPlaygroundPage } from 'graphql-playground-html';

import { graphqlHapi } from './hapiApollo';

export interface ServerRegistration {
  app: hapi.Server;
  server: ApolloServerBase<hapi.Request>;
  path?: string;
  subscriptions?: boolean;
}

export interface HapiListenOptions {
  port?: number | string;
  host?: string; // default: ''. This is where engineproxy listens.
  pipePath?: string;
  graphqlPaths?: string[]; // default: ['/graphql']
  innerHost?: string; // default: '127.0.0.1'. This is where Node listens.
  launcherOptions?: EngineLauncherOptions;
}

export const registerServer = async ({
  app,
  server,
  path,
}: ServerRegistration) => {
  if (!path) path = '/graphql';

  await app.ext({
    type: 'onRequest',
    method: function(request, h) {
      if (request.path !== path) {
        return h.continue;
      }
      if (!server.disableTools && request.method === 'get') {
        //perform more expensive content-type check only if necessary
        const accept = parseAll(request.app);
        const types = accept.mediaTypes as string[];
        const prefersHTML =
          types.find(
            (x: string) => x === 'text/html' || x === 'application/json',
          ) === 'text/html';

        if (prefersHTML) {
          return h
            .response(
              renderPlaygroundPage({
                subscriptionsEndpoint: server.subscriptions && path,
                endpoint: path,
                version: '',
              }),
            )
            .type('text/html');
        }
      }
      return h.continue;
    },
  });

  await app.register({
    plugin: graphqlHapi,
    options: {
      path: path,
      graphqlOptions: server.request.bind(server),
      route: {
        cors: true,
      },
    },
  });

  server.use({ path, getHttp: () => app.listener });

  const listen = server.listen;
  server.listen = async options => {
    //requires that autoListen is false, so that
    //hapi sets up app.listener without start
    await app.start();

    //starts the hapi listener at a random port when engine proxy used,
    //otherwise will start the server at the provided port
    return listen({ ...options });
  };
};
