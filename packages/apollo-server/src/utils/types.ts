import { GraphQLSchema } from 'graphql';
import { CorsOptions } from 'cors';
import { SchemaDirectiveVisitor, IResolvers } from 'graphql-tools';
import { ConnectionContext } from 'subscriptions-transport-ws';

export type Context<T = any> = T;
export type ContextFunction<T = any> = (
  context: Context<T>,
) => Promise<Context<T>>;

export interface SubscriptionServerOptions {
  path?: string;
  onConnect?: Function;
  onDisconnect?: Function;
  keepAlive?: number;
}

export interface Config<Server, ContextShape = any, Cors = CorsOptions> {
  app?: Server;
  typeDefs?: string | [string];
  resolvers?: IResolvers;
  schema?: GraphQLSchema;
  schemaDirectives: Record<string, typeof SchemaDirectiveVisitor>;
  context?: Context<ContextShape> | ContextFunction<ContextShape>;
  cors?: Cors;
  subscriptions?: SubscriptionServerOptions | string | false;
  engineInRequestPath?: boolean;
  engine?: boolean | Object;
}

export interface EngineConfig {
  startupTimeout?: number;
  proxyStdoutStream?: NodeJS.WritableStream;
  proxyStderrStream?: NodeJS.WritableStream;
  extraArgs?: string[];
  processCleanupEvents?: string[];
}

export interface ListenOptions {
  port?: string | number;
  host?: string;
  engine?: EngineConfig;
  keepAlive?: number;
  onConnect?: (
    connectionParams: Object,
    websocket: WebSocket,
    context: ConnectionContext,
  ) => any;
  onDisconnect?: (websocket: WebSocket, context: ConnectionContext) => any;
}

export interface MiddlewareOptions {
  endpoint?: string;
  graphiql?: boolean | string;
  subscriptions?: boolean;
}

export interface MiddlewareRegistrationOptions<
  Server,
  Request,
  Cors = CorsOptions
> {
  endpoint?: string;
  graphiql?: string;
  subscriptions?: boolean;
  cors?: Cors;
  app: Server;
  request: (request: Request) => any;
}

export interface ServerInfo {
  url: string;
  port: number | string;
}
