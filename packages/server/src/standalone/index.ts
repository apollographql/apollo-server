import type { WithRequired } from '@apollo/utils.withrequired';
import cors from 'cors';
import bodyParser from 'body-parser';
import http, { type IncomingMessage, type ServerResponse } from 'http';
import type { ListenOptions } from 'net';
import { parse as urlParse } from 'url';
import type { ApolloServer } from '../ApolloServer.js';
import type {
  BaseContext,
  ContextFunction,
  HTTPGraphQLRequest,
} from '../externalTypes/index.js';
import { ApolloServerPluginDrainHttpServer } from '../plugin/drainHttpServer/index.js';
import { urlForHttpServer } from '../utils/urlForHttpServer.js';
import { HeaderMap } from '../utils/HeaderMap.js';
import finalhandler from 'finalhandler';

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
  const context = options?.context ?? (async () => ({}) as TContext);
  const corsHandler = cors();
  const jsonHandler = bodyParser.json({ limit: '50mb' });
  const httpServer = http.createServer((req, res) => {
    const errorHandler = finalhandler(req, res, {
      // Use the same onerror as Express.
      onerror(err) {
        if (process.env.NODE_ENV !== 'test') {
          console.error(err.stack || err.toString());
        }
      },
    });

    corsHandler(req, res, (err) => {
      if (err) {
        errorHandler(err);
        return;
      }
      jsonHandler(req, res, (err) => {
        if (err) {
          errorHandler(err);
          return;
        }

        const headers = new HeaderMap();
        for (const [key, value] of Object.entries(req.headers)) {
          if (value !== undefined) {
            // Node headers can be an array or a single value. We join
            // multi-valued headers with `, ` just like the Fetch API's `Headers`
            // does. We assume that keys are already lower-cased (as per the Node
            // docs on IncomingMessage.headers) and so we don't bother to lower-case
            // them or combine across multiple keys that would lower-case to the
            // same value.
            headers.set(key, Array.isArray(value) ? value.join(', ') : value);
          }
        }

        const httpGraphQLRequest: HTTPGraphQLRequest = {
          // Note that method and url are guaranteed to exist for IncomingMessages coming from Servers.
          method: req.method!.toUpperCase(),
          headers,
          search: urlParse(req.url!).search ?? '',
          body: 'body' in req ? req.body : undefined,
        };

        server
          .executeHTTPGraphQLRequest({
            httpGraphQLRequest,
            context: () => context({ req, res }),
          })
          .then(async (httpGraphQLResponse) => {
            for (const [key, value] of httpGraphQLResponse.headers) {
              res.setHeader(key, value);
            }
            res.statusCode = httpGraphQLResponse.status || 200;

            if (httpGraphQLResponse.body.kind === 'complete') {
              res.end(httpGraphQLResponse.body.string);
              return;
            }

            for await (const chunk of httpGraphQLResponse.body.asyncIterator) {
              res.write(chunk);
            }
            res.end();
          })
          .catch((err) => {
            errorHandler(err);
          });
      });
    });
  });

  server.addPlugin(
    ApolloServerPluginDrainHttpServer({ httpServer: httpServer }),
  );

  await server.start();

  const listenOptions = options?.listen ?? { port: 4000 };
  // Wait for server to start listening
  await new Promise<void>((resolve) => {
    httpServer.listen(listenOptions, resolve);
  });

  return { url: urlForHttpServer(httpServer) };
}
