import {
  GraphQLSchema,
  GraphQLFieldResolver,
  GraphQLScalarType,
  GraphQLIsTypeOfFn,
  GraphQLTypeResolver,
} from 'graphql';
import { CorsOptions } from 'cors';
import {
  SchemaDirectiveVisitor,
  IDirectiveResolvers,
  ITypeDefinitions,
  IResolvers,
} from 'graphql-tools';

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

export interface Config<Server, ContextShape = any> {
  app?: Server;
  typeDefs?: string | [string];
  resolvers?: IResolvers;
  schema?: GraphQLSchema;
  schemaDirectives: Record<string, typeof SchemaDirectiveVisitor>;
  context?: Context<ContextShape> | ContextFunction<ContextShape>;
  engine?: Boolean | string | Object;
  cors?: CorsOptions;
  subscriptions?: SubscriptionServerOptions | string | false;
}

export interface ListenOptions {
  port?: string | number;
}

export interface MiddlewareOptions {
  endpoint?: string;
  graphiql?: boolean | string | Object;
}

export interface MiddlewareRegistrationOptions<Server, Request>
  extends MiddlewareOptions {
  cors?: CorsOptions;
  app: Server;
  request: (request: Request) => any;
}

export interface ServerInfo {
  url: string;
}
