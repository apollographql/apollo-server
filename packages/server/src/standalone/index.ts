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

export async function startStandaloneServer(
  server: ApolloServer<BaseContext>,
  options?: HTTPServerOptions<BaseContext> & { listen?: ListenOptions },
): Promise<{ url: string }>;
export async function startStandaloneServer<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options: WithRequired<HTTPServerOptions<TContext>, 'context'> & {
    listen?: ListenOptions;
  },
): Promise<{ url: string }>;
export async function startStandaloneServer<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options?: HTTPServerOptions<TContext> & { listen?: ListenOptions },
): Promise<{ url: string }> {
  const app: express.Express = express();
  const httpServer: http.Server = http.createServer(app);

  server.addPlugin(
    ApolloServerPluginDrainHttpServer({ httpServer: httpServer }),
  );

  await server.start();

  const context = options?.context ?? (async () => ({} as TContext));
  app.use(cors(), json(), expressMiddleware(server, { context }));

  const listenOptions = options?.listen ?? { port: 4000 };
  // Wait for server to start listening
  await new Promise<void>((resolve) => {
    httpServer.listen(listenOptions, resolve);
  });

  return { url: urlForHttpServer(httpServer) };
}
