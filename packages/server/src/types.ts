import type { Logger } from '@apollo/utils.logger';
import type { IMocks } from '@graphql-tools/mock';
import type { IExecutableSchemaDefinition } from '@graphql-tools/schema';
import type { IResolvers } from '@graphql-tools/utils';
import type {
  DocumentNode,
  GraphQLError,
  GraphQLFieldResolver,
  GraphQLFormattedError,
  GraphQLSchema,
  ValidationContext,
} from 'graphql';
import type Keyv from 'keyv';
import type { ApolloConfig, ApolloConfigInput } from './config';
import type {
  BaseContext,
  GraphQLExecutor,
  GraphQLRequestContext,
  GraphQLResponse,
} from './externalTypes';
import type { PluginDefinition } from './externalTypes/plugins';

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type Args<F> = F extends (...args: infer A) => any ? A : never;
export type AsFunction<F> = F extends Function ? F : never;
export type StripPromise<T> = T extends Promise<infer U> ? U : never;

/**
 * It is not recommended to use this `AnyFunction` type further.
 *
 * This is a legacy type which aims to do what its name suggests (be the type
 * for _any_ function) but it should be replaced with something from the
 * TypeScript standard lib.  It doesn't truly cover "any" function right now,
 * and in particular doesn't consider `this`.  For now, it has been brought
 * here from the Apollo Server `Dispatcher`, where it was first utilized.
 */
export type AnyFunction = (...args: any[]) => any;

/**
 * A map of `AnyFunction`s which are the interface for our plugin API's
 * request listeners. (e.g. `GraphQLRequestListener`s).
 */
export type AnyFunctionMap = {
  [key: string]: AnyFunction | undefined;
};

export type Unsubscriber = () => void;

export type GraphQLServiceConfig = {
  schema: GraphQLSchema;
  executor: GraphQLExecutor | null;
};

export type SchemaLoadOrUpdateCallback = (schemaContext: {
  apiSchema: GraphQLSchema;
  coreSupergraphSdl: string;
}) => void;

export interface GatewayInterface {
  load(options: { apollo: ApolloConfig }): Promise<GraphQLServiceConfig>;

  onSchemaLoadOrUpdate(callback: SchemaLoadOrUpdateCallback): Unsubscriber;

  stop(): Promise<void>;
}

export type DocumentStore = Keyv<DocumentNode>;

export interface PersistedQueryOptions {
  cache?: Keyv<string>;
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
  formatError?: (error: GraphQLError) => GraphQLFormattedError;
  rootValue?: ((parsedQuery: DocumentNode) => any) | any;
  validationRules?: Array<(context: ValidationContext) => any>;
  executor?: GraphQLExecutor;
  formatResponse?: (
    response: GraphQLResponse,
    requestContext: GraphQLRequestContext<TContext>,
  ) => GraphQLResponse | null;
  fieldResolver?: GraphQLFieldResolver<any, TContext>;
  cache?: Keyv<string>;
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
  csrfPrevention?: CSRFPreventionOptions | boolean;

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
  resolvers?: IResolvers<any, TContext>;
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
