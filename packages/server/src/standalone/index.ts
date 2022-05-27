import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import type { ListenOptions } from 'net';
import type { ApolloServer } from '../ApolloServer';
import { ExpressContext, expressMiddleware } from '../express';
import type { BaseContext, ContextFunction } from '../externalTypes';
import { ApolloServerPluginDrainHttpServer } from '../plugin';
import type { WithRequired } from '../types';
import { urlForHttpServer } from '../utils/urlForHttpServer';

interface HTTPServerOptions<TContext extends BaseContext> {
  context?: ContextFunction<[ExpressContext], TContext>;
}

export async function standaloneServer(
  server: ApolloServer<BaseContext>,
  options?: HTTPServerOptions<BaseContext>,
  listenOptions?: ListenOptions,
): Promise<{ url: string }>;
export async function standaloneServer<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options: WithRequired<HTTPServerOptions<TContext>, 'context'>,
  listenOptions?: ListenOptions,
): Promise<{ url: string }>;
export async function standaloneServer<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options?: HTTPServerOptions<TContext>,
  listenOptions: ListenOptions = { port: 4000 },
): Promise<{ url: string }> {
  const context = options?.context ?? (async () => ({} as TContext));
  return await new ApolloServerStandalone<TContext>(server, { context }).listen(
    listenOptions,
  );
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

    return { url: urlForHttpServer(this.httpServer) };
  }
}
