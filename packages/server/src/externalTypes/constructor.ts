import type { Logger } from '@apollo/utils.logger';
import type { IExecutableSchemaDefinition } from '@graphql-tools/schema';
import type {
  DocumentNode,
  GraphQLFieldResolver,
  GraphQLFormattedError,
  GraphQLSchema,
  ValidationContext,
} from 'graphql';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import type { BaseContext, GraphQLExecutor } from '.';
import type { PluginDefinition } from './plugins';

export type Unsubscriber = () => void;

export type SchemaLoadOrUpdateCallback = (schemaContext: {
  apiSchema: GraphQLSchema;
  coreSupergraphSdl: string;
}) => void;

export interface GatewayLoadResult<TContext extends BaseContext> {
  executor: GraphQLExecutor<TContext> | null;
}
export interface GatewayInterface<TContext extends BaseContext> {
  load(options: { apollo: ApolloConfig }): Promise<GatewayLoadResult<TContext>>;

  onSchemaLoadOrUpdate(callback: SchemaLoadOrUpdateCallback): Unsubscriber;

  stop(): Promise<void>;
}

export type DocumentStore = KeyValueCache<DocumentNode>;

// Configuration for how Apollo Server talks to the Apollo registry, as passed
// to the ApolloServer constructor. Each field can also be provided as an
// environment variable.
export interface ApolloConfigInput {
  // Your Apollo API key. Environment variable: APOLLO_KEY.
  key?: string;
  // The graph ref for your graph, eg `my-graph@my-variant` or `my-graph` to use
  // your graph's default variant. Environment variable: APOLLO_GRAPH_REF. For
  // backwards compatibility, may alternatively specify the ref as graphId and
  // graphVariant separately.
  graphRef?: string;
  // TODO(AS4): Consider dropping support for specifying ID and variant separately.
  //
  // The graph ID of your graph, eg `my-graph`. Environment variable:
  // APOLLO_GRAPH_ID.
  graphId?: string;
  // Your graph's variant name, eg `my-variant`. Environment variable:
  // APOLLO_GRAPH_VARIANT.
  graphVariant?: string;
}

// some defaults filled in from the ApolloConfigInput passed to the constructor.
export interface ApolloConfig {
  key?: string;
  keyHash?: string;
  graphRef?: string;
}

export interface PersistedQueryOptions {
  cache?: KeyValueCache<string>;
  /**
   * Specified in **seconds**, this time-to-live (TTL) value limits the lifespan
   * of how long the persisted query should be cached.  To specify a desired
   * lifespan of "infinite", set this to `null`, in which case the eviction will
   * be determined by the cache's eviction policy, but the record will never
   * simply expire.
   */
  ttl?: number | null;
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

// TODO(AS4): Organize this.
interface ApolloServerOptionsBase<TContext extends BaseContext> {
  formatError?: (
    formattedError: GraphQLFormattedError,
    error: unknown,
  ) => GraphQLFormattedError;
  rootValue?: ((parsedQuery: DocumentNode) => any) | any;
  validationRules?: Array<(context: ValidationContext) => any>;
  executor?: GraphQLExecutor<TContext>;
  fieldResolver?: GraphQLFieldResolver<any, TContext>;
  cache?: KeyValueCache<string>;
  includeStacktraceInErrorResponses?: boolean;
  logger?: Logger;
  allowBatchedHttpRequests?: boolean;

  introspection?: boolean;
  plugins?: PluginDefinition<TContext>[];
  persistedQueries?: PersistedQueryOptions | false;
  stopOnTerminationSignals?: boolean;
  apollo?: ApolloConfigInput;
  nodeEnv?: string;
  documentStore?: DocumentStore | null;
  csrfPrevention?: CSRFPreventionOptions | boolean;

  // This is used for two different things: parsing the schema if you're a
  // SchemaFromTypeDefsConfig, *and* parsing operations. Arguably this is a bit
  // weird. If you need to parse schemas with different options, just be a
  // SchemaProvidedConfig and call makeExecutableSchema yourself.
  parseOptions?: IExecutableSchemaDefinition<TContext>['parseOptions'];
}

interface ApolloServerOptionsWithGateway<TContext extends BaseContext>
  extends ApolloServerOptionsBase<TContext> {
  gateway: GatewayInterface<TContext>;
  schema?: undefined;
  typeDefs?: undefined;
  resolvers?: undefined;
}

interface ApolloServerOptionsWithSchema<TContext extends BaseContext>
  extends ApolloServerOptionsBase<TContext> {
  schema: GraphQLSchema;
  gateway?: undefined;
  typeDefs?: undefined;
  resolvers?: undefined;
}

interface ApolloServerOptionsWithTypeDefs<TContext extends BaseContext>
  extends ApolloServerOptionsBase<TContext> {
  // These two options are always only passed directly through to
  // makeExecutableSchema. (If you don't want to use makeExecutableSchema, pass
  // `schema` instead.)
  typeDefs: IExecutableSchemaDefinition<TContext>['typeDefs'];
  resolvers?: IExecutableSchemaDefinition<TContext>['resolvers'];
  gateway?: undefined;
  schema?: undefined;
}

// Used internally in ApolloServer.ts but not publicly exported.
export type ApolloServerOptionsWithStaticSchema<TContext extends BaseContext> =
  | ApolloServerOptionsWithSchema<TContext>
  | ApolloServerOptionsWithTypeDefs<TContext>;

export type ApolloServerOptions<TContext extends BaseContext> =
  | ApolloServerOptionsWithGateway<TContext>
  | ApolloServerOptionsWithStaticSchema<TContext>;
