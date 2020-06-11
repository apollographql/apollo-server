import { GraphQLSchema, DocumentNode } from 'graphql';
import { IMocks } from '@graphql-tools/mock';
import { IExecutableSchemaDefinition as GraphQLToolsExecutableSchemaDefinition } from '@graphql-tools/schema';
import {
  ValueOrPromise,
  GraphQLExecutor,
  GraphQLExecutionResult,
  GraphQLRequestContextExecutionDidStart,
} from 'apollo-server-types';

import { EngineReportingOptions } from 'apollo-engine-reporting';

import { PlaygroundConfig } from './playground';
export { PlaygroundConfig, PlaygroundRenderPageOptions } from './playground';

import {
  GraphQLServerOptions as GraphQLOptions,
  PersistedQueryOptions,
} from './graphqlOptions';
import { CacheControlExtensionOptions } from 'apollo-cache-control';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';

import { GraphQLSchemaModule } from '@apollographql/apollo-tools';
export { GraphQLSchemaModule };

export { KeyValueCache } from 'apollo-server-caching';

export type Context<T = object> = T;
export type ContextFunction<FunctionParams = any, ProducedContext = object> = (
  context: FunctionParams,
) => ValueOrPromise<Context<ProducedContext>>;

// A plugin can return an interface that matches `ApolloServerPlugin`, or a
// factory function that returns `ApolloServerPlugin`.
export type PluginDefinition = ApolloServerPlugin | (() => ApolloServerPlugin);

type BaseConfig = Pick<
  GraphQLOptions<Context>,
  | 'formatError'
  | 'debug'
  | 'rootValue'
  | 'validationRules'
  | 'executor'
  | 'formatResponse'
  | 'fieldResolver'
  | 'tracing'
  | 'dataSources'
  | 'cache'
  | 'logger'
>;

export type Unsubscriber = () => void;
export type SchemaChangeCallback = (schema: GraphQLSchema) => void;

export type GraphQLServiceConfig = {
  schema: GraphQLSchema;
  executor: GraphQLExecutor;
};

/**
 * This is a restricted view of an engine configuration which only supplies the
 * necessary info for accessing things like cloud storage.
 */
export type GraphQLServiceEngineConfig = {
  apiKeyHash: string;
  graphId: string;
  graphVariant?: string;
};

export interface GraphQLService {
  load(options: {
    engine?: GraphQLServiceEngineConfig;
  }): Promise<GraphQLServiceConfig>;
  onSchemaChange(callback: SchemaChangeCallback): Unsubscriber;
  // Note: The `TContext` typing here is not conclusively behaving as we expect:
  // https://github.com/apollographql/apollo-server/pull/3811#discussion_r387381605
  executor<TContext>(
    requestContext: GraphQLRequestContextExecutionDidStart<TContext>,
  ): ValueOrPromise<GraphQLExecutionResult>;
}

// ExecutableSchemaDefinition is based on the similar GraphQL Tools interface
// with the following differences:
//  = The `typeDefs` property is simplified to require typeDefs to be statically defined
//    so that Apollo Server can easily extend them.
//  = The `logger` property is omitted from the Apollo ExecutableSchemaDefinition as
//    Apollo Server provides server-based logging rather than schema-based logging.
export interface ExecutableSchemaDefinition extends Omit<GraphQLToolsExecutableSchemaDefinition, 'typeDefs' | 'logger'> {
  typeDefs: DocumentNode | string | Array<DocumentNode | string>;
};

// This configuration is shared between all integrations and should include
// fields that are not specific to a single integration
export interface Config extends BaseConfig, Partial<ExecutableSchemaDefinition> {
  modules?: GraphQLSchemaModule[];
  schema?: GraphQLSchema;
  context?: Context | ContextFunction;
  introspection?: boolean;
  mocks?: boolean | IMocks;
  mockEntireSchema?: boolean;
  engine?: boolean | EngineReportingOptions<Context>;
  cacheControl?: CacheControlExtensionOptions | boolean;
  plugins?: PluginDefinition[];
  persistedQueries?: PersistedQueryOptions | false;
  //https://github.com/jaydenseric/graphql-upload#type-uploadoptions
  playground?: PlaygroundConfig;
  gateway?: GraphQLService;
  experimental_approximateDocumentStoreMiB?: number;
}
