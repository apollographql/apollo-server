// This is the "batteries-included" version of `apollo-server-express`. It
// handles creating the Express app and HTTP server for you (using whatever
// version of `express` its dependency pulls in). If you need to customize the
// Express app or HTTP server at all, you just use `apollo-server-express`
// instead.
import express from 'express';
import http from 'http';
import {
  ApolloServer as ApolloServerExpress,
  CorsOptions,
  ApolloServerExpressConfig,
} from 'apollo-server-express';
import type { AddressInfo } from 'net';
import { format as urlFormat } from 'url';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';

export * from './exports';

export interface ServerInfo {
  address: string;
  family: string;
  url: string;
  port: number | string;
  server: http.Server;
}

export class ApolloServer extends ApolloServerExpress {
  private cors?: CorsOptions | boolean;
  private onHealthCheck?: (req: express.Request) => Promise<any>;
  private httpServer: http.Server;

  constructor(
    config: ApolloServerExpressConfig & {
      cors?: CorsOptions | boolean;
      onHealthCheck?: (req: express.Request) => Promise<any>;
      stopGracePeriodMillis?: number;
    },
  ) {
    const httpServer = http.createServer();
    super({
      ...config,
      plugins: [
        ...(config.plugins ?? []),
        ApolloServerPluginDrainHttpServer({
          httpServer: httpServer,
          stopGracePeriodMillis: config.stopGracePeriodMillis,
        }),
      ],
    });

    this.httpServer = httpServer;
    this.cors = config.cors;
    this.onHealthCheck = config.onHealthCheck;
  }

  private createServerInfo(): ServerInfo {
    const addressInfo = this.httpServer.address() as AddressInfo;

    // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
    // corresponding loopback ip. If this heuristic is wrong for your use case,
    // explicitly specify a frontend host (in the `host` option to
    // ApolloServer.listen).
    let hostForUrl = addressInfo.address;
    if (hostForUrl === '' || hostForUrl === '::') {
      hostForUrl = 'localhost';
    }

    const url = urlFormat({
      protocol: 'http',
      hostname: hostForUrl,
      port: addressInfo.port,
      pathname: this.graphqlPath,
    });

    return {
      ...addressInfo,
      server: this.httpServer,
      url,
    };
  }

  public override applyMiddleware() {
    throw new Error(
      'To use Apollo Server with an existing express application, please use apollo-server-express',
    );
  }

  public override async start(): Promise<void> {
    throw new Error(
      "When using the `apollo-server` package, you don't need to call start(); just call listen().",
    );
  }

  // Listen takes the same arguments as http.Server.listen.
  public async listen(...opts: Array<any>): Promise<ServerInfo> {
    // First start the server and throw if startup fails (eg, schema can't be loaded
    // or a serverWillStart plugin throws).
    await this._start();

    // This class is the easy mode for people who don't create their own express
    // object, so we have to create it.
    const app = express();
    this.httpServer.on('request', app);

    app.disable('x-powered-by');

    // provide generous values for the getting started experience
    super.applyMiddleware({
      app: app,
      path: '/',
      bodyParserConfig: { limit: '50mb' },
      onHealthCheck: this.onHealthCheck,
      cors:
        typeof this.cors !== 'undefined'
          ? this.cors
          : {
              origin: '*',
            },
    });

    await new Promise((resolve) => {
      this.httpServer.once('listening', resolve);
      // If the user passed a callback to listen, it'll get called in addition
      // to our resolver. They won't have the ability to get the ServerInfo
      // object unless they use our Promise, though.
      this.httpServer.listen(...(opts.length ? opts : [{ port: 4000 }]));
    });

    return this.createServerInfo();
  }
}
