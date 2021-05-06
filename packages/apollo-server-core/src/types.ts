import type { GraphQLSchema, DocumentNode, ParseOptions } from 'graphql';
import type { IMocks } from '@graphql-tools/mock';
import type {
  IResolvers,
} from '@graphql-tools/utils';
import type {
  ApolloConfig,
  ValueOrPromise,
  GraphQLExecutor,
  GraphQLExecutionResult,
  GraphQLRequestContextExecutionDidStart,
  ApolloConfigInput,
} from 'apollo-server-types';

import type {
  GraphQLServerOptions as GraphQLOptions,
  PersistedQueryOptions,
} from './graphqlOptions';
import type { ApolloServerPlugin } from 'apollo-server-plugin-base';

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

export interface GraphQLService {
  load(options: {
    apollo?: ApolloConfig;
  }): Promise<GraphQLServiceConfig>;
  onSchemaChange(callback: SchemaChangeCallback): Unsubscriber;
  // Note: The `TContext` typing here is not conclusively behaving as we expect:
  // https://github.com/apollographql/apollo-server/pull/3811#discussion_r387381605
  executor<TContext>(
    requestContext: GraphQLRequestContextExecutionDidStart<TContext>,
  ): ValueOrPromise<GraphQLExecutionResult>;
  stop?(): Promise<void>;
}

// This configuration is shared between all integrations and should include
// fields that are not specific to a single integration
export interface Config extends BaseConfig {
  modules?: GraphQLSchemaModule[];
  typeDefs?: DocumentNode | Array<DocumentNode> | string | Array<string>;
  parseOptions?: ParseOptions;
  resolvers?: IResolvers | Array<IResolvers>;
  schema?: GraphQLSchema;
  context?: Context | ContextFunction;
  introspection?: boolean;
  mocks?: boolean | IMocks;
  mockEntireSchema?: boolean;
  plugins?: PluginDefinition[];
  persistedQueries?: PersistedQueryOptions | false;
  gateway?: GraphQLService;
  experimental_approximateDocumentStoreMiB?: number;
  stopOnTerminationSignals?: boolean;
  apollo?: ApolloConfigInput;
  // Apollo Server only uses process.env.NODE_ENV to determine defaults for
  // other behavior which have other mechanisms of setting explicitly. Sometimes
  // our tests want to test the exact logic of how NODE_ENV affects defaults;
  // they can set this parameter, but there's no reason to do so other than for
  // tests. Note that 'undefined' means "act as if NODE_ENV is not set", not
  // "pay attention to NODE_ENV", which is what the key not existing means.
  __testing__nodeEnv?: string | undefined;
}
