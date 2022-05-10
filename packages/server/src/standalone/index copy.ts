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
  TContext extends BaseContext
> = {
  contextFunction: ContextFunction<[ExpressContext], TContext>;
} & ApolloServerOptions<TContext>;

type ApolloServerStandaloneOptions<
  TContext extends BaseContext
> = NoContextOptions | WithContextOptions<TContext>;


class ApolloServerStandalone<
  TContext extends BaseContext
>{
  private app: express.Express;
  private httpServer: http.Server;
  private contextFunction: ContextFunction<[ExpressContext], TContext>;
  private apolloServer: ApolloServer<TContext>;

  constructor(opts: NoContextOptions);
  constructor(opts: WithContextOptions<TContext>);
  constructor(opts: ApolloServerStandaloneOptions<TContext>) {
    const { contextFunction, ...apolloServerOptions } = opts;

    this.apolloServer = new ApolloServer<TContext>(apolloServerOptions);

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
        this.apolloServer,
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
{
  const serverBaseContextInferred = new ApolloServerStandalone({
    typeDefs: `type Query { id: ID }`,
  });

  const serverBaseContextInferred = new ApolloServerStandalone<BaseContext>({
    typeDefs: `type Query { id: ID }`,
    async contextFunction() {
      return { id: 'string' };
    },
  });
}
{
  const serverBaseContextInferred = new ApolloServerStandalone({
    typeDefs: `type Query { id: ID }`,
  });
  // interface MyContext {
  //   id: string;
  // }
  // TContext inferred
  const serverTContextInferred = new ApolloServerStandalone({
    typeDefs: `type Query { id: ID }`,
    resolvers: {
      Query: {
        id: (_, __, context) => {
          context.id;
          return '1';
        },
      },
    },
    contextFunction: async () => {
      return { id: '1' };
    },
  });

  (async () => {
    // result == http.Server, listen accepts `ListenOptions`
    const result = await serverTContextInferred.listen();
  })();
}
