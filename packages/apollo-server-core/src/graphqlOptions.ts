import type {
  GraphQLSchema,
  ValidationContext,
  GraphQLFieldResolver,
  DocumentNode,
  GraphQLError,
  GraphQLFormattedError,
  ParseOptions,
} from 'graphql';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import type { DataSource } from 'apollo-datasource';
import type { ApolloServerPlugin } from 'apollo-server-plugin-base';
import type {
  GraphQLExecutor,
  ValueOrPromise,
  GraphQLResponse,
  GraphQLRequestContext,
  SchemaHash,
} from 'apollo-server-types';
import type { Logger } from '@apollo/utils.logger';
import type { DocumentStore } from './types';

/*
 * GraphQLServerOptions
 *
 * - schema: an executable GraphQL schema used to fulfill requests.
 * - (optional) logger: a `Logger`-compatible implementation to be used for server-level messages.
 * - (optional) formatError: Formatting function applied to all errors before response is sent
 * - (optional) rootValue: rootValue passed to GraphQL execution, or a function to resolving the rootValue from the DocumentNode
 * - (optional) context: the context passed to GraphQL execution
 * - (optional) validationRules: extra validation rules applied to requests
 * - (optional) formatResponse: a function applied to each graphQL execution result
 * - (optional) fieldResolver: a custom default field resolver
 * - (optional) debug: a boolean that will print additional debug logging if execution errors occur
 * - (optional) parseOptions: options to pass when parsing schemas and queries
 * - (optional) allowBatchedHttpRequests: a boolean to toggle whether a single request can contain an array of queries. True by default
 *
 */
export interface GraphQLServerOptions<
  TContext = Record<string, any>,
  TRootValue = any,
> {
  schema: GraphQLSchema;
  /**
   * @deprecated: a not particularly stable or useful hash of the schema.
   */
  schemaHash: SchemaHash;
  logger?: Logger;
  formatError?: (error: GraphQLError) => GraphQLFormattedError;
  rootValue?: ((parsedQuery: DocumentNode) => TRootValue) | TRootValue;
  context?: TContext | (() => never);
  validationRules?: Array<(context: ValidationContext) => any>;
  executor?: GraphQLExecutor;
  formatResponse?: (
    response: GraphQLResponse,
    requestContext: GraphQLRequestContext<TContext>,
  ) => GraphQLResponse | null;
  fieldResolver?: GraphQLFieldResolver<any, TContext>;
  debug?: boolean;
  dataSources?: () => DataSources<TContext>;
  cache?: KeyValueCache;
  persistedQueries?: PersistedQueryOptions;
  plugins?: ApolloServerPlugin[];
  documentStore?: DocumentStore | null;
  dangerouslyDisableValidation?: boolean;
  parseOptions?: ParseOptions;
  nodeEnv?: string;
  allowBatchedHttpRequests?: boolean;
}

export type DataSources<TContext> = {
  [name: string]: DataSource<TContext>;
};

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

export default GraphQLServerOptions;

export async function resolveGraphqlOptions(
  options:
    | GraphQLServerOptions
    | ((...args: Array<any>) => ValueOrPromise<GraphQLServerOptions>),
  ...args: Array<any>
): Promise<GraphQLServerOptions> {
  if (typeof options === 'function') {
    return await options(...args);
  } else {
    return options;
  }
}
