import { GraphQLSchema, DocumentNode } from 'graphql';
import { SchemaDirectiveVisitor, IResolvers, IMocks } from 'graphql-tools';
import { ConnectionContext } from 'subscriptions-transport-ws';
import { Server as HttpServer } from 'http';
import { ListenOptions as HttpListenOptions } from 'net';
import { GraphQLExtension } from 'graphql-extensions';
import { EngineReportingOptions } from 'apollo-engine-reporting';

import { GraphQLServerOptions as GraphQLOptions } from './graphqlOptions';

export type Context<T = any> = T;
export type ContextFunction<T = any> = (
  context: Context<T>,
) => Promise<Context<T>>;

export interface SubscriptionServerOptions {
  path: string;
  keepAlive?: number;
  onConnect?: (
    connectionParams: Object,
    websocket: WebSocket,
    context: ConnectionContext,
  ) => any;
  onDisconnect?: (websocket: WebSocket, context: ConnectionContext) => any;
}

export interface Config
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
  typeDefs?: DocumentNode | [DocumentNode];
  resolvers?: IResolvers;
  schema?: GraphQLSchema;
  schemaDirectives?: Record<string, typeof SchemaDirectiveVisitor>;
  context?: Context<any> | ContextFunction<any>;
  introspection?: boolean;
  mocks?: boolean | IMocks;
  engine?: boolean | EngineReportingOptions;
  extensions?: Array<() => GraphQLExtension>;
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
  // https://github.com/apollographql/apollo-server/pull/979#discussion_r184483094
  http?: HttpListenOptions | any | { handle: any; backlog?: number };
  // XXX clean this up
  engineInRequestPath?: boolean;
  engineProxy?: boolean | Record<string, any>;
  // engine launcher options
  engineLauncherOptions?: EngineLauncherOptions;
  // WebSocket options
  subscriptions?: Partial<SubscriptionServerOptions> | string | false;
}

export interface MiddlewareOptions {
  path?: string;
  gui?: boolean;
  subscriptions?: boolean;
}

export interface RegistrationOptions {
  path: string;
  getHttp: () => HttpServer;
}

export interface ServerInfo {
  url: string;
  port: number | string;
}
