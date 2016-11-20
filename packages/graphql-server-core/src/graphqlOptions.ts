import { GraphQLSchema, ValidationContext } from 'graphql';
import { LogFunction } from './runQuery';

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
 * - (optional) debug: a boolean that will print additional debug logging if execution errors occur
 *
 */
interface GraphQLServerOptions {
  schema: GraphQLSchema;
  formatError?: Function;
  rootValue?: any;
  context?: any;
  logFunction?: LogFunction;
  formatParams?: Function;
  validationRules?: Array<ValidationRule>;
  formatResponse?: Function;
  debug?: boolean;
}

export type ValidationRule = (context: ValidationContext) => any;

export default GraphQLServerOptions;
