import { GraphQLSchema } from 'graphql';
import { SchemaDirectiveVisitor, IResolvers, IMocks } from 'graphql-tools';
import { ConnectionContext } from 'subscriptions-transport-ws';
import { Server as HttpServer } from 'http';

import { GraphQLServerOptions as GraphQLOptions } from './graphqlOptions';

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

export interface Config<Server>
  extends Pick<
      GraphQLOptions<Context<any>>,
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
  typeDefs?: string | [string];
  resolvers?: IResolvers;
  schema?: GraphQLSchema;
  schemaDirectives: Record<string, typeof SchemaDirectiveVisitor>;
  context?: Context<any> | ContextFunction<any>;
  subscriptions?: SubscriptionServerOptions | string | false;
  enableIntrospection?: boolean;
  mocks?: boolean | IMocks;
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
  // XXX clean this up
  engineInRequestPath?: boolean;
  engine?: boolean | Object;
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

export interface RegistrationOptions {
  path: string;
  // subscriptions?: boolean;
  getHttp: () => HttpServer;
}

export interface ServerInfo {
  url: string;
  port: number | string;
}
