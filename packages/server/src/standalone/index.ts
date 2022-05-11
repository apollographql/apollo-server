import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import type { AddressInfo, ListenOptions } from 'net';
import { format as urlFormat } from 'url';
import type { ApolloServer } from '../ApolloServer';
import { ExpressContext, expressMiddleware } from '../express';
import type { BaseContext, ContextFunction } from '../externalTypes';
import type { WithRequired } from '../types';

interface HTTPServerOptions<TContext extends BaseContext> {
  context?: ContextFunction<[ExpressContext], TContext>;
}

export function httpServer(
  server: ApolloServer<BaseContext>,
  options?: HTTPServerOptions<BaseContext>,
): HTTPApolloServer<BaseContext>;
export function httpServer<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options: WithRequired<HTTPServerOptions<TContext>, 'context'>,
): HTTPApolloServer<TContext>;
export function httpServer<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options?: HTTPServerOptions<TContext>,
): HTTPApolloServer<TContext> {
  const context = options?.context ?? (async () => ({} as TContext));
  return new HTTPApolloServer<TContext>(server, { context });
}

class HTTPApolloServer<TContext extends BaseContext> {
  private app: express.Express = express();
  private httpServer: http.Server = http.createServer(this.app);

  constructor(
    private apolloServer: ApolloServer<TContext>,
    private options: WithRequired<HTTPServerOptions<TContext>, 'context'>,
  ) {}

  async listen(
    listenOptions: ListenOptions = { port: 4000 },
  ): Promise<{ url: string }> {
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