import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import type { AddressInfo, ListenOptions } from 'net';
import { format as urlFormat } from 'url';
import { ApolloServer } from '../ApolloServer';
import { ExpressContext, expressMiddleware } from '../express';
import type { BaseContext, ContextFunction } from '../externalTypes';
import type { WithRequired } from '../types';

interface HTTPServerOptions<TContext extends BaseContext> {
  context?: ContextFunction<[ExpressContext], TContext>;
}

export function httpServer(
  server: ApolloServer<BaseContext>,
  options?: {},
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
      cors<cors.CorsRequest>(),
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

// happy path with no TContext provided, no context function provided
(async () => {
  const serverNoContext = new ApolloServer({
    typeDefs: `type Query { hello: String }`,
  });
  const http = httpServer(serverNoContext);
  const { url } = await http.listen();
})();

// happy path with no TContext provided, but yes context function provided - more details
(async () => {
  const serverNoContext = new ApolloServer({
    typeDefs: `type Query { hello: String }`,
  });
  // This is actually allowed because the `ApolloServer` instance is defined
  // with `BaseContext` and the provided `context` function satisfies that.
  // Though I think ideally we would want to _enforce_ that the incoming
  // `ApolloServer` argument gets an error here since it's not a `TContext`.
  // Fundamentally this is ok though, and maybe what I really want here is a
  // warning (Did you forget to pass `TContext` to your server instance? Or more
  // generally, your context function returns a superset of `TContext` so your
  // server may not be type aware of the additional fields you've provided on
  // your context object).
  const http = httpServer(serverNoContext, {
    context: async () => ({ id: '1' }),
  });
  const { url } = await http.listen();
})();

interface MyContext {
  id: string;
}

// happy path with `MyContext` provided
(async () => {
  const serverWithContext = new ApolloServer<MyContext>({
    typeDefs: `type Query { hello: String }`,
  });
  const http = httpServer(serverWithContext, {
    async context() {
      return { id: '1' };
    },
  });
  const { url } = await http.listen();
})();

// `MyContext` provided, context function returns a superset of `MyContext`
(async () => {
  const serverWithContext = new ApolloServer<MyContext>({
    typeDefs: `type Query { hello: String }`,
  });
  const http = httpServer(serverWithContext, {
    async context() {
      return { id: '1', extraneous: 'blah' };
    },
  });
  const { url } = await http.listen();
})();

// error path: `MyContext` provided but no context function provided
(async () => {
  const serverWithContext = new ApolloServer<MyContext>({
    typeDefs: `type Query { hello: String }`,
  });

  // @ts-expect-error this is expected, a context function is required when the
  // provided `ApolloServer` is not of `BaseContext` type.
  const http = httpServer(serverWithContext);
  const { url } = await http.listen();
})();
