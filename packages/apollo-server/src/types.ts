import {
  GraphQLSchema,
  GraphQLFieldResolver,
  GraphQLScalarType,
  GraphQLIsTypeOfFn,
  GraphQLTypeResolver,
} from 'graphql';
import * as express from 'express';
import { CorsOptions } from 'cors';
import {
  SchemaDirectiveVisitor,
  IDirectiveResolvers,
  ITypeDefinitions,
  IResolvers,
} from 'graphql-tools';

import { Node } from './node';
import { Connector } from './connector';

export interface Context {
  request?: express.Request;
  connectors?: Record<string, Connector<any>>;
  Node?: Node;
}

export type ContextFunction = (context: Context) => Promise<Context>;

export interface Config {
  app?: express.Application;
  typeDefs?: string | [string];
  resolvers?: IResolvers;
  schemaDirectives: Record<string, typeof SchemaDirectiveVisitor>;
  engineApiKey?: string;
  context?: Context | ContextFunction;
}

export interface ListenOptions {
  port?: number;
  endpoint?: string;
  cors?: CorsOptions;
  devTools?: string;
}

export interface ServerInfo {
  url: string;
}
