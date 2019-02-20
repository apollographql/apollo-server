import {
  GraphQLSchema,
  ValidationContext,
  GraphQLFieldResolver,
  DocumentNode,
  GraphQLError,
  GraphQLFormattedError,
} from 'graphql';
import { GraphQLExtension } from 'graphql-extensions';
import { CacheControlExtensionOptions } from 'apollo-cache-control';
import { KeyValueCache, InMemoryLRUCache } from 'apollo-server-caching';
import { DataSource } from 'apollo-datasource';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { GraphQLParseOptions } from 'graphql-tools';

/*
 * GraphQLServerOptions
 *
 * - schema: an executable GraphQL schema used to fulfill requests.
 * - (optional) formatError: Formatting function applied to all errors before response is sent
 * - (optional) rootValue: rootValue passed to GraphQL execution, or a function to resolving the rootValue from the DocumentNode
 * - (optional) context: the context passed to GraphQL execution
 * - (optional) validationRules: extra validation rules applied to requests
 * - (optional) formatResponse: a function applied to each graphQL execution result
 * - (optional) fieldResolver: a custom default field resolver
 * - (optional) debug: a boolean that will print additional debug logging if execution errors occur
 * - (optional) extensions: an array of functions which create GraphQLExtensions (each GraphQLExtension object is used for one request)
 * - (optional) parseOptions: options to pass when parsing schemas and queries
 *
 */
export interface GraphQLServerOptions<
  TContext = Record<string, any>,
  TRootValue = any
> {
  schema: GraphQLSchema;
  formatError?: (error: GraphQLError) => GraphQLFormattedError;
  rootValue?: ((parsedQuery: DocumentNode) => TRootValue) | TRootValue;
  context?: TContext | (() => never);
  validationRules?: Array<(context: ValidationContext) => any>;
  formatResponse?: Function;
  fieldResolver?: GraphQLFieldResolver<any, TContext>;
  debug?: boolean;
  tracing?: boolean;
  cacheControl?: CacheControlExtensionOptions;
  extensions?: Array<() => GraphQLExtension>;
  dataSources?: () => DataSources<TContext>;
  cache?: KeyValueCache;
  persistedQueries?: PersistedQueryOptions;
  plugins?: ApolloServerPlugin[];
  documentStore?: InMemoryLRUCache<DocumentNode>;
  parseOptions?: GraphQLParseOptions;
}

export type DataSources<TContext> = {
  [name: string]: DataSource<TContext>;
};

export interface PersistedQueryOptions {
  cache: KeyValueCache;
}

export default GraphQLServerOptions;

export async function resolveGraphqlOptions(
  options:
    | GraphQLServerOptions
    | ((
        ...args: Array<any>
      ) => Promise<GraphQLServerOptions> | GraphQLServerOptions),
  ...args: Array<any>
): Promise<GraphQLServerOptions> {
  if (typeof options === 'function') {
    return await options(...args);
  } else {
    return options;
  }
}
