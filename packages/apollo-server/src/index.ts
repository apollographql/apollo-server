// Note: express is only used if you use the ApolloServer.listen API to create
// an express app for you instead of registerServer (which you might not even
// use with express). The dependency is unused otherwise, so don't worry if
// you're not using express or your version doesn't quite match up.
import express from 'express';
import http from 'http';
import net from 'net';
import { registerServer } from 'apollo-server-express';

import { ApolloServerBase } from 'apollo-server-core';

export { GraphQLOptions, GraphQLExtension, gql } from 'apollo-server-core';
import { GraphQLOptions } from 'apollo-server-core';

export * from './exports';

export interface ServerInfo {
  address: string;
  family: string;
  url: string;
  port: number | string;
  subscriptionsPath: string;
  server: http.Server;
}

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

  protected supportsSubscriptions(): boolean {
    return true;
  }

  private createServerInfo(
    server: http.Server,
    subscriptionsPath?: string,
  ): ServerInfo {
    const serverInfo: any = {
      ...(server.address() as net.AddressInfo),
      server,
      subscriptionsPath,
    };

    // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
    // corresponding loopback ip. Note that the url field we're setting is
    // primarily for consumption by our test suite. If this heuristic is
    // wrong for your use case, explicitly specify a frontend host (in the
    // `frontends.host` field in your engine config, or in the `host`
    // option to ApolloServer.listen).
    let hostForUrl = serverInfo.address;
    if (serverInfo.address === '' || serverInfo.address === '::')
      hostForUrl = 'localhost';

    serverInfo.url = require('url').format({
      protocol: 'http',
      hostname: hostForUrl,
      port: serverInfo.port,
      pathname: this.graphqlPath,
    });

    return serverInfo;
  }

  // here we overwrite the underlying listen to configure
  // the fallback / default server implementation
  async listen(...opts: Array<any>): Promise<ServerInfo> {
    // we haven't configured a server yet so lets build the default one
    // using express
    const app = express();

    //provide generous values for the getting started experience
    await registerServer({
      app,
      path: '/',
      server: this as any,
      bodyParserConfig: { limit: '50mb' },
      cors: {
        origin: '*',
      },
    });

    const server = http.createServer(app);

    this.createSubscriptionServer(server);

    if (opts.length > 0) {
      //When the user passes in their own callback, we should respect it
      await new Promise<http.Server>(resolve => {
        if (opts[opts.length - 1] === 'function') {
          const callback = opts[opts.length - 1];
          opts[opts.length - 1] = async (server: http.Server) => {
            resolve(server);
            callback(server);
          };

          server.listen(...opts);
        } else {
          server.listen(...opts, resolve);
        }
      });
    } else {
      await new Promise<http.Server>(resolve =>
        server.listen({ port: 4000 }, resolve),
      );
    }

    return this.createServerInfo(server, this.subscriptionsPath);
  }
}
