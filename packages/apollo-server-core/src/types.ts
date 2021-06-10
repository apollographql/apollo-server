import type { GraphQLSchema, DocumentNode, ParseOptions } from 'graphql';
import type { IMocks } from '@graphql-tools/mock';
import type { IResolvers } from '@graphql-tools/utils';
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

import type { GraphQLSchemaModule } from '@apollographql/apollo-tools';
export type { GraphQLSchemaModule };

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

export interface GatewayInterface {
  load(options: { apollo: ApolloConfig }): Promise<GraphQLServiceConfig>;
  onSchemaChange(callback: SchemaChangeCallback): Unsubscriber;
  // Note: The `TContext` typing here is not conclusively behaving as we expect:
  // https://github.com/apollographql/apollo-server/pull/3811#discussion_r387381605
  executor<TContext>(
    requestContext: GraphQLRequestContextExecutionDidStart<TContext>,
  ): Promise<GraphQLExecutionResult>;
  stop(): Promise<void>;
}

// This was the name used for GatewayInterface in AS2; continue to export it so
// that older versions of `@apollo/gateway` build against AS3.
export interface GraphQLService extends GatewayInterface {}

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
  gateway?: GatewayInterface;
  experimental_approximateDocumentStoreMiB?: number;
  stopOnTerminationSignals?: boolean;
  apollo?: ApolloConfigInput;
  // Apollo Server only uses process.env.NODE_ENV to determine defaults for
  // other behavior which have other mechanisms of setting explicitly. Sometimes
  // our tests want to test the exact logic of how NODE_ENV affects defaults;
  // they can set this parameter, but there's no reason to do so other than for
  // tests. Note that an explicit `__testing_nodeEnv__: undefined` means "act as
  // if the environment variable is not set", whereas the absence of
  // `__testing_nodeEnv__` means to honor the environment variable.
  __testing_nodeEnv__?: string | undefined;
}
