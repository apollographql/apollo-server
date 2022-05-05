import type { GraphQLSchema, DocumentNode } from 'graphql';
import type { IMocks } from '@graphql-tools/mock';
import type { IExecutableSchemaDefinition } from '@graphql-tools/schema';
import type {
  ApolloConfig,
  ValueOrPromise,
  GraphQLExecutor,
  ApolloConfigInput,
} from 'apollo-server-types';

import type {
  GraphQLServerOptions as GraphQLOptions,
  PersistedQueryOptions,
} from './graphqlOptions';
import type { ApolloServerPlugin } from 'apollo-server-plugin-base';

import type { GraphQLSchemaModule } from '@apollographql/apollo-tools';

export type { GraphQLSchemaModule };

import type { KeyValueCache } from 'apollo-server-caching';
export type { KeyValueCache };

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
  | 'allowBatchedHttpRequests'
>;

export type Unsubscriber = () => void;
export type SchemaChangeCallback = (apiSchema: GraphQLSchema) => void;

export type GraphQLServiceConfig = {
  schema: GraphQLSchema;
  executor: GraphQLExecutor | null;
};

export interface GatewayInterface {
  load(options: { apollo: ApolloConfig }): Promise<GraphQLServiceConfig>;

  /**
   * @deprecated Use `onSchemaLoadOrUpdate` instead
   */
  onSchemaChange?(callback: SchemaChangeCallback): Unsubscriber;

  // TODO: This is optional because older gateways may not have this method,
  //       and we only need it in certain circumstances, so we just error in
  //       those circumstances if we don't have it.
  onSchemaLoadOrUpdate?(
    callback: (schemaContext: {
      apiSchema: GraphQLSchema;
      coreSupergraphSdl: string;
    }) => void,
  ): Unsubscriber;

  stop(): Promise<void>;

  // Note: this interface used to have an `executor` method, and also return the
  // executor from `load()`. ApolloServer would only use the former. We dropped
  // this method and now use the latter, which allows you to make a "mock
  // gateway" that updates the schema over time but uses normal execution.
}

// This was the name used for GatewayInterface in AS2; continue to export it so
// that older versions of `@apollo/gateway` build against AS3.
export interface GraphQLService extends GatewayInterface {}

export type DocumentStore = KeyValueCache<DocumentNode>;

// This configuration is shared between all integrations and should include
// fields that are not specific to a single integration
export interface Config<ContextFunctionParams = any> extends BaseConfig {
  modules?: GraphQLSchemaModule[];

  // These three options are always only passed directly through to
  // makeExecutableSchema. (If you don't want to use makeExecutableSchema, pass
  // `schema` instead.)
  typeDefs?: IExecutableSchemaDefinition['typeDefs'];
  resolvers?: IExecutableSchemaDefinition['resolvers'];
  parseOptions?: IExecutableSchemaDefinition['parseOptions'];

  schema?: GraphQLSchema;
  context?: Context | ContextFunction<ContextFunctionParams>;
  introspection?: boolean;
  mocks?: boolean | IMocks;
  mockEntireSchema?: boolean;
  plugins?: PluginDefinition[];
  persistedQueries?: PersistedQueryOptions | false;
  gateway?: GatewayInterface;
  stopOnTerminationSignals?: boolean;
  apollo?: ApolloConfigInput;
  nodeEnv?: string;
  documentStore?: DocumentStore | null;
  csrfPrevention?: CSRFPreventionOptions | boolean;
}

export interface CSRFPreventionOptions {
  // CSRF prevention works by only processing operations from requests whose
  // structure indicates that if they were sent by a web browser, then the
  // browser would have had to send a preflight OPTIONS request already. We do
  // this by specifying some headers that a browser will never automatically set
  // and which will trigger the browser to preflight. Apollo Server will reject
  // any operation that does not set at least one of these headers *and* does
  // not set a content-type (to a header whose parsed type is not
  // application/x-www-form-urlencoded, multipart/form-data, or text/plain). If
  // CSRF prevention is enabled (eg, with `csrfPrevention: true`) this list
  // defaults to ['x-apollo-operation-name', 'apollo-require-preflight']. This
  // will allow POST operations from any client and GET operations from Apollo
  // Client Web, Apollo iOS, and Apollo Kotlin.
  requestHeaders?: string[];
}
