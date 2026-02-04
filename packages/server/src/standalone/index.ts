import type { WithRequired } from '@apollo/utils.withrequired';
import cors from 'cors';
import express from 'express';
import { parse as parseContentType } from 'content-type';
import http, { type IncomingMessage, type ServerResponse } from 'http';
import type { ListenOptions } from 'net';
import type { ApolloServer } from '../ApolloServer.js';
import { expressMiddleware } from '../express4/index.js';
import type { BaseContext, ContextFunction } from '../externalTypes/index.js';
import { ApolloServerPluginDrainHttpServer } from '../plugin/drainHttpServer/index.js';
import { urlForHttpServer } from '../utils/urlForHttpServer.js';

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

export interface StartStandaloneServerOptions<TContext extends BaseContext> {
  context?: ContextFunction<
    [StandaloneServerContextFunctionArgument],
    TContext
  >;
}

// according to RFC8259, only UTF-8 is allowed in JSON text
// (see https://datatracker.ietf.org/doc/html/rfc8259#section-8.1)
// RFC 7159 also specifies that JSON could be UTF-16 or UTF-32,
// so we allow for that, too
// note that the upstream dependencies of Apollo Client 4 do not work with UTF-32,
// so they will likely fail, even though we allow it here
const validCharset = /^utf-(8|((16|32)(le|be)?))$/i;

export async function startStandaloneServer(
  server: ApolloServer<BaseContext>,
  options?: StartStandaloneServerOptions<BaseContext> & {
    listen?: ListenOptions;
  },
): Promise<{ url: string }>;
export async function startStandaloneServer<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options: WithRequired<StartStandaloneServerOptions<TContext>, 'context'> & {
    listen?: ListenOptions;
  },
): Promise<{ url: string }>;
export async function startStandaloneServer<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options?: StartStandaloneServerOptions<TContext> & { listen?: ListenOptions },
): Promise<{ url: string }> {
  const app: express.Express = express();
  const httpServer: http.Server = http.createServer(app);

  server.addPlugin(
    ApolloServerPluginDrainHttpServer({ httpServer: httpServer }),
  );

  await server.start();

  const context = options?.context ?? (async () => ({}) as TContext);
  app.use(
    cors(),
    express.json({
      verify(req) {
        const charset = parseContentType(req).parameters.charset || 'utf-8';
        if (!charset.match(validCharset)) {
          throw Object.assign(
            new Error(`unsupported charset "${charset.toUpperCase()}"`),
            {
              status: 415,
              name: 'UnsupportedMediaTypeError',
              charset,
              type: 'charset.unsupported',
            },
          );
        }
      },
      limit: '50mb',
    }),
    expressMiddleware(server, { context }),
  );

  const listenOptions = options?.listen ?? { port: 4000 };
  // Wait for server to start listening
  await new Promise<void>((resolve) => {
    httpServer.listen(listenOptions, resolve);
  });

  return { url: urlForHttpServer(httpServer) };
}
