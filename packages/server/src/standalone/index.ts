import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import type { AddressInfo } from 'net';
import { format as urlFormat } from 'url';
import { ApolloServer } from '../ApolloServer';
import {
  ExpressContext,
  expressMiddleware
} from '../express';
import type { BaseContext, ContextFunction } from '../externalTypes';
import { ApolloServerPluginDrainHttpServer } from '../plugin';
import type { ApolloServerOptions, WithRequired } from '../types';

export type ApolloServerStandaloneOptions<TContext extends BaseContext> =
  ApolloServerOptions<TContext> & {
    context?: ContextFunction<[ExpressContext], TContext>;
  };

export class ApolloServerStandalone<
  TContext extends BaseContext,
> extends ApolloServer<TContext> {
  private app: express.Express;
  private httpServer: http.Server;
  private context: ContextFunction<[ExpressContext], TContext>;

  constructor(
    options: WithRequired<ApolloServerStandaloneOptions<TContext>, 'context'>,
  );
  constructor(options: ApolloServerOptions<BaseContext>);
  constructor(options: ApolloServerStandaloneOptions<TContext>) {
    const app = express();
    const httpServer = http.createServer(app);

    super({
      ...options,
      plugins: [
        ...(options.plugins ?? []),
        ApolloServerPluginDrainHttpServer({
          httpServer,
        }),
      ],
    });

    this.app = app;
    this.httpServer = httpServer;

    // This `any` is safe because the overload above shows that context can
    // only be left out if you're using BaseContext as your context, and {} is a
    // valid BaseContext.
    const defaultContext: ContextFunction<
      [ExpressContext],
      any
    > = async () => ({});
    this.context = options.context ?? defaultContext;
  }

  async listen(listenOptions: any) {
    await this.start();

    this.app.use(
      cors<cors.CorsRequest>(),
      json(),
      expressMiddleware(this, {
        context: this.context,
      }),
    );

    // Wait for server to start listening
    await new Promise((resolve) => {
      this.httpServer.once('listening', resolve);
      this.httpServer.listen(
        ...(listenOptions.length ? listenOptions : [{ port: 4000 }]),
      );
    });

    const addressInfo = this.httpServer.address() as AddressInfo;

    // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
    // corresponding loopback ip. If this heuristic is wrong for your use case,
    // explicitly specify a frontend host (in the `host` option to
    // ApolloServerStandalone.listen).
    let hostForUrl = addressInfo.address;
    if (hostForUrl === '' || hostForUrl === '::') {
      hostForUrl = 'localhost';
    }

    const url = urlFormat({
      protocol: 'http',
      hostname: hostForUrl,
      port: addressInfo.port,
      pathname: '/',
    });

    return { url };
  }
}
