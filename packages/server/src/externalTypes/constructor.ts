/**
 * This file consists of types used to define the arguments to the ApolloServer
 * constructor. The top-level and likely most interesting type exported from
 * here is `ApolloServerOptions` which is used to define the input object to the
 * `ApolloServer` constructor.
 */
import type { Logger } from '@apollo/utils.logger';
import type { IExecutableSchemaDefinition } from '@graphql-tools/schema';
import type {
  DocumentNode,
  FormattedExecutionResult,
  GraphQLFieldResolver,
  GraphQLFormattedError,
  GraphQLSchema,
  ParseOptions,
  ValidationRule,
} from 'graphql';
import type { KeyValueCache } from '@apollo/utils.keyvaluecache';
import type { GatewayInterface } from '@apollo/server-gateway-interface';
import type { ApolloServerPlugin } from './plugins.js';
import type { BaseContext } from './index.js';
import type { GraphQLExperimentalIncrementalExecutionResults } from '../incrementalDeliveryPolyfill.js';

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

interface ApolloServerOptionsBase<TContext extends BaseContext> {
  formatError?: (
    formattedError: GraphQLFormattedError,
    error: unknown,
  ) => GraphQLFormattedError;
  rootValue?: ((parsedQuery: DocumentNode) => unknown) | unknown;
  validationRules?: Array<ValidationRule>;
  fieldResolver?: GraphQLFieldResolver<any, TContext>;
  cache?: KeyValueCache<string> | 'bounded';
  includeStacktraceInErrorResponses?: boolean;
  logger?: Logger;
  allowBatchedHttpRequests?: boolean;
  stringifyResult?: (
    value: FormattedExecutionResult,
  ) => string | Promise<string>;
  introspection?: boolean;
  maxRecursiveSelections?: boolean | number;
  hideSchemaDetailsFromClientErrors?: boolean;
  plugins?: ApolloServerPlugin<TContext>[];
  persistedQueries?: PersistedQueryOptions | false;
  stopOnTerminationSignals?: boolean;
  apollo?: ApolloConfigInput;
  nodeEnv?: string;
  documentStore?: DocumentStore | null;
  dangerouslyDisableValidation?: boolean;
  csrfPrevention?: CSRFPreventionOptions | boolean;

  // Used for parsing operations; unlike in AS3, this is not also used for
  // parsing the schema.
  parseOptions?: ParseOptions;

  // TODO(AS5): remove OR warn + ignore with this option set, ignore option and
  // flip default behavior. Default false. This opt-in configuration fixes a
  // regression introduced in v4. In v3, Apollo Server would correctly respond
  // to a request with invalid `variables` with a 400 status code. AS4 responds
  // with a 200 status code by default. We recommend setting this to `true`
  // unless you've explicitly worked around this regression already (and maybe
  // consider undoing the workaround).
  status400ForVariableCoercionErrors?: boolean;

  // For testing only.
  __testing_incrementalExecutionResults?: GraphQLExperimentalIncrementalExecutionResults;
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

// Used internally in ApolloServer.ts but not publicly exported.
export type ApolloServerOptionsWithStaticSchema<TContext extends BaseContext> =
  | ApolloServerOptionsWithSchema<TContext>
  | ApolloServerOptionsWithTypeDefs<TContext>;

export type ApolloServerOptions<TContext extends BaseContext> =
  | ApolloServerOptionsWithGateway<TContext>
  | ApolloServerOptionsWithStaticSchema<TContext>;
