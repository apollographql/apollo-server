import type { WithRequired } from '@apollo/utils.withrequired';
import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import http, { IncomingMessage, ServerResponse } from 'http';
import type { ListenOptions } from 'net';
import type { ApolloServer, BaseContext, ContextFunction } from '..';
import { expressMiddleware } from '..';
import { urlForHttpServer } from '../internal';
import { ApolloServerPluginDrainHttpServer } from '../plugin/drainHttpServer';

// Note that while we do use express and expressMiddleware to implement the
// standalone server, this is an internal implementation detail. We could
// rewrite this to have no dependencies other than the core http package.
// Because of this, our TypeScript types encourage users to only use
// functionality of `req` and `res` that are part of the core http
// implementations rather than the Express-specific subclasses; if you need
// typesafe access to Express-specific properties, just use expressMiddleware
// directly.
export interface StandaloneServerContextFunctionArgument {
  req: IncomingMessage;
  res: ServerResponse;
}

interface HTTPServerOptions<TContext extends BaseContext> {
  context?: ContextFunction<
    [StandaloneServerContextFunctionArgument],
    TContext
  >;
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
