import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import type { AddressInfo, ListenOptions } from 'net';
import { format as urlFormat } from 'url';
import type { ApolloServer } from '../ApolloServer';
import { ExpressContext, expressMiddleware } from '../express';
import type { BaseContext, ContextFunction } from '../externalTypes';
import { ApolloServerPluginDrainHttpServer } from '../plugin';
import type { WithRequired } from '../types';

interface HTTPServerOptions<TContext extends BaseContext> {
  context?: ContextFunction<[ExpressContext], TContext>;
}

export function standaloneServer(
  server: ApolloServer<BaseContext>,
  options?: HTTPServerOptions<BaseContext>,
): ApolloServerStandalone<BaseContext>;
export function standaloneServer<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options: WithRequired<HTTPServerOptions<TContext>, 'context'>,
): ApolloServerStandalone<TContext>;
export function standaloneServer<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options?: HTTPServerOptions<TContext>,
): ApolloServerStandalone<TContext> {
  const context = options?.context ?? (async () => ({} as TContext));
  return new ApolloServerStandalone<TContext>(server, { context });
}

class ApolloServerStandalone<TContext extends BaseContext> {
  private app: express.Express = express();
  private httpServer: http.Server = http.createServer(this.app);

  constructor(
    private apolloServer: ApolloServer<TContext>,
    private options: WithRequired<HTTPServerOptions<TContext>, 'context'>,
  ) {}

  async listen(
    listenOptions: ListenOptions = { port: 4000 },
  ): Promise<{ url: string }> {
    this.apolloServer.addPlugin(
      ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer }),
    );

    await this.apolloServer.start();
    this.app.use(
      cors(),
      json(),
      expressMiddleware(this.apolloServer, {
        context: this.options.context,
      }),
    );

    // Wait for server to start listening
    await new Promise<void>((resolve) => {
      this.httpServer.listen(listenOptions, resolve);
    });

    const addressInfo = this.httpServer.address() as AddressInfo;

    // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
    // corresponding loopback ip. If this heuristic is wrong for your use case,
    // explicitly specify a frontend host (in the `host` option to `listen`).
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
