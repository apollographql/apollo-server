import { json } from 'body-parser';
import cors from 'cors';
import express from 'express';
import http from 'http';
import type { ListenOptions } from "net";
import { ApolloServer } from "../ApolloServer";
import { ExpressContext, expressMiddleware } from "../express";
import type { BaseContext, ContextFunction } from "../externalTypes";
import type { ApolloServerOptions } from "../types";

type NoContextOptions = {
  contextFunction?: never;
} & ApolloServerOptions<BaseContext>;

type WithContextOptions<
  TContext extends BaseContext,
  SContext extends BaseContext = TContext,
> = {
  contextFunction: ContextFunction<[ExpressContext], TContext>;
} & ApolloServerOptions<SContext>;

type ApolloServerStandaloneOptions<
  TContext extends BaseContext,
  SContext extends BaseContext = TContext,
> = NoContextOptions | WithContextOptions<TContext, SContext>;


class ApolloServerStandalone<
  TContext extends BaseContext,
  SContext extends BaseContext = TContext,
>{
  private app: express.Express;
  private httpServer: http.Server;
  private contextFunction: ContextFunction<[ExpressContext], TContext>;
  private apolloServer: ApolloServer<SContext>;

  constructor(opts: NoContextOptions);
  constructor(opts: WithContextOptions<TContext>);
  constructor(opts: ApolloServerStandaloneOptions<TContext, SContext>) {
    const { contextFunction, ...apolloServerOptions } = opts;

    this.apolloServer = new ApolloServer<SContext>(apolloServerOptions);

    this.contextFunction =
      opts.contextFunction ?? (async () => ({} as TContext));

    this.app = express();
    this.httpServer = http.createServer(this.app);
  }

  async listen(
    listenOptions: ListenOptions = { port: 4000 },
    listeningListener?: () => void,
  ): Promise<http.Server> {
    await this.apolloServer.start();

    this.app.use(
      cors<cors.CorsRequest>(),
      json(),
      expressMiddleware(
        this.apolloServer as unknown as ApolloServer<TContext>,
        {
          context: this.contextFunction,
        },
      ),
    );

    // Wait for server to start listening
    await new Promise<void>((resolve) => {
      this.httpServer.listen(listenOptions, () => {
        resolve();
        listeningListener?.();
      });
    });

    // const addressInfo = this.httpServer.address() as AddressInfo;

    // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
    // corresponding loopback ip. If this heuristic is wrong for your use case,
    // explicitly specify a frontend host (in the `host` option to
    // ApolloServerStandalone.listen).
    // let hostForUrl = addressInfo.address;
    // if (hostForUrl === '' || hostForUrl === '::') {
    //   hostForUrl = 'localhost';
    // }

    // const url = urlFormat({
    //   protocol: 'http',
    //   hostname: hostForUrl,
    //   port: addressInfo.port,
    //   pathname: '/',
    // });

    return this.httpServer;
  }
}

// FIXME delete examples
// BaseContext
const serverBaseContextInferred = new ApolloServerStandalone({
  typeDefs: `type Query { id: ID }`,
});

// TContext inferred
const serverTContextInferred = new ApolloServerStandalone({
  typeDefs: `type Query { id: ID }`,
   resolvers: {
    Query: {
      id: (_, __, context) => {
        context.id;
        return '1';
      }
    }
  },
  contextFunction: async () => ({ id: '1' }),
});

(async () => {
  // result == http.Server, listen accepts `ListenOptions`
  const result = await serverTContextInferred.listen();
})();
