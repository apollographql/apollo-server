import { GraphQLSchema } from 'graphql';
import { CorsOptions } from 'cors';
import { SchemaDirectiveVisitor, IResolvers } from 'graphql-tools';
import { ConnectionContext } from 'subscriptions-transport-ws';
import { GraphQLOptions } from 'apollo-server-core';
export { CacheControlExtensionOptions } from 'apollo-cache-control';

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

export interface Config<Server, ContextShape = any, Cors = CorsOptions>
  extends Pick<
      GraphQLOptions<Context<ContextShape>>,
      | 'formatError'
      | 'debug'
      | 'rootValue'
      | 'logFunction'
      | 'formatParams'
      | 'validationRules'
      | 'formatResponse'
      | 'fieldResolver'
      | 'debug'
      | 'cacheControl'
      | 'tracing'
    > {
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
  enableIntrospection?: boolean;
}

// XXX export these directly from apollo-engine-js
export interface EngineLauncherOptions {
  startupTimeout?: number;
  proxyStdoutStream?: NodeJS.WritableStream;
  proxyStderrStream?: NodeJS.WritableStream;
  extraArgs?: string[];
  processCleanupEvents?: string[];
}

export interface ListenOptions {
  // node http listen options
  // https://nodejs.org/api/net.html#net_server_listen_options_callback
  port?: string | number;
  host?: string;
  path?: string;
  backlog?: number;
  exclusive?: boolean;
  // engine launcher options
  engineLauncherOptions?: EngineLauncherOptions;
  // WebSocket options
  keepAlive?: number;
  onConnect?: (
    connectionParams: Object,
    websocket: WebSocket,
    context: ConnectionContext,
  ) => any;
  onDisconnect?: (websocket: WebSocket, context: ConnectionContext) => any;
}

export interface MiddlewareOptions {
  path?: string;
  gui?: boolean;
  subscriptions?: boolean;
}

export interface MiddlewareRegistrationOptions<
  Server,
  Request,
  Cors = CorsOptions
> {
  path?: string;
  gui?: boolean;
  subscriptions?: boolean;
  cors?: Cors;
  app: Server;
  request: (request: Request) => any;
}

export interface ServerInfo {
  url: string;
  port: number | string;
}
