import type {
  GraphQLSchema,
  DocumentNode,
  GraphQLError,
  GraphQLFormattedError,
  ValidationContext,
  GraphQLFieldResolver,
} from 'graphql';
import type { IMocks } from '@graphql-tools/mock';
import type { IExecutableSchemaDefinition } from '@graphql-tools/schema';
import type {
  GraphQLExecutor,
  ApolloServerPlugin,
  BaseContext,
  GraphQLResponse,
  GraphQLRequestContext,
} from './externalTypes';
import type { ApolloConfig, ApolloConfigInput } from './config';
import type { Logger } from '@apollo/utils.logger';

import type { KeyValueCache } from 'apollo-server-caching';
export type { KeyValueCache };

// A plugin can return an interface that matches `ApolloServerPlugin`, or a
// factory function that returns `ApolloServerPlugin`.
export type PluginDefinition<TContext extends BaseContext> =
  | ApolloServerPlugin<TContext>
  | (() => ApolloServerPlugin<TContext>);

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

export interface PersistedQueryOptions {
  cache?: KeyValueCache;
  /**
   * Specified in **seconds**, this time-to-live (TTL) value limits the lifespan
   * of how long the persisted query should be cached.  To specify a desired
   * lifespan of "infinite", set this to `null`, in which case the eviction will
   * be determined by the cache's eviction policy, but the record will never
   * simply expire.
   */
  ttl?: number | null;
}

// TODO(AS4): Organize this.
interface ApolloServerOptionsBase<TContext extends BaseContext> {
  formatError?: (error: GraphQLError) => GraphQLFormattedError;
  rootValue?: ((parsedQuery: DocumentNode) => any) | any;
  validationRules?: Array<(context: ValidationContext) => any>;
  executor?: GraphQLExecutor;
  formatResponse?: (
    response: GraphQLResponse,
    requestContext: GraphQLRequestContext<TContext>,
  ) => GraphQLResponse | null;
  fieldResolver?: GraphQLFieldResolver<any, TContext>;
  cache?: KeyValueCache;
  includeStackTracesInErrorResponses?: boolean;
  logger?: Logger;
  allowBatchedHttpRequests?: boolean;

  introspection?: boolean;
  plugins?: PluginDefinition<TContext>[];
  persistedQueries?: PersistedQueryOptions | false;
  stopOnTerminationSignals?: boolean;
  apollo?: ApolloConfigInput;
  nodeEnv?: string;
  documentStore?: DocumentStore | null;

  // This is used for two different things: parsing the schema if you're a
  // SchemaFromTypeDefsConfig, *and* parsing operations. Arguably this is a bit
  // weird. If you need to parse schemas with different options, just be a
  // SchemaProvidedConfig and call makeExecutableSchema yourself.
  parseOptions?: IExecutableSchemaDefinition<TContext>['parseOptions'];
}

export interface ApolloServerOptionsWithGateway<TContext extends BaseContext>
  extends ApolloServerOptionsBase<TContext> {
  gateway: GatewayInterface;
  schema?: undefined;
  typeDefs?: undefined;
  resolvers?: undefined;
}

export interface ApolloServerOptionsWithSchema<TContext extends BaseContext>
  extends ApolloServerOptionsBase<TContext> {
  schema: GraphQLSchema;
  gateway?: undefined;
  typeDefs?: undefined;
  resolvers?: undefined;
}

export interface ApolloServerOptionsWithTypeDefs<TContext extends BaseContext>
  extends ApolloServerOptionsBase<TContext> {
  // These two options are always only passed directly through to
  // makeExecutableSchema. (If you don't want to use makeExecutableSchema, pass
  // `schema` instead.)
  typeDefs: IExecutableSchemaDefinition<TContext>['typeDefs'];
  resolvers?: IExecutableSchemaDefinition<TContext>['resolvers'];
  gateway?: undefined;
  schema?: undefined;
}

export type ApolloServerOptionsWithStaticSchema<TContext extends BaseContext> =
  (
    | ApolloServerOptionsWithSchema<TContext>
    | ApolloServerOptionsWithTypeDefs<TContext>
  ) & {
    mocks?: boolean | IMocks;
    mockEntireSchema?: boolean;
  };

export type ApolloServerOptions<TContext extends BaseContext> =
  | ApolloServerOptionsWithGateway<TContext>
  | ApolloServerOptionsWithStaticSchema<TContext>;
