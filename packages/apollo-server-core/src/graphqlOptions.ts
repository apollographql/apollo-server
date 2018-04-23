import {
  GraphQLSchema,
  ValidationContext,
  GraphQLFieldResolver,
} from 'graphql';
import { LogFunction } from './runQuery';
import { GraphQLExtension } from 'graphql-extensions';
import { CacheControlExtensionOptions } from 'apollo-cache-control';

/*
 * GraphQLServerOptions
 *
 * - schema: an executable GraphQL schema used to fulfill requests.
 * - (optional) formatError: Formatting function applied to all errors before response is sent
 * - (optional) rootValue: rootValue passed to GraphQL execution
 * - (optional) context: the context passed to GraphQL execution
 * - (optional) logFunction: a function called for logging events such as execution times
 * - (optional) formatParams: a function applied to the parameters of every invocation of runQuery
 * - (optional) validationRules: extra validation rules applied to requests
 * - (optional) formatResponse: a function applied to each graphQL execution result
 * - (optional) fieldResolver: a custom default field resolver
 * - (optional) debug: a boolean that will print additional debug logging if execution errors occur
 *
 */
export interface GraphQLServerOptions<TContext = any> {
  schema: GraphQLSchema;
  formatError?: Function;
  rootValue?: any;
  context?: TContext;
  logFunction?: LogFunction;
  formatParams?: Function;
  validationRules?: Array<(context: ValidationContext) => any>;
  formatResponse?: Function;
  fieldResolver?: GraphQLFieldResolver<any, TContext>;
  debug?: boolean;
  tracing?: boolean;
  cacheControl?: boolean | CacheControlExtensionOptions;
}

export default GraphQLServerOptions;

export async function resolveGraphqlOptions(
  options: GraphQLServerOptions | Function,
  ...args
): Promise<GraphQLServerOptions> {
  if (typeof options === 'function') {
    try {
      return await options(...args);
    } catch (e) {
      throw new Error(`Invalid options provided to ApolloServer: ${e.message}`);
    }
  } else {
    return options;
  }
}
