export {
  processGraphQLRequest,
  GraphQLRequestContext,
  GraphQLRequestPipelineConfig,
} from 'apollo-server-core/dist/requestPipeline';
import {
  GraphQLRequest,
  GraphQLResponse,
  VariableValues,
} from 'apollo-server-types';
import {
  DocumentNode,
  parse,
  GraphQLError,
  GraphQLSchema,
  validate,
  execute,
  ExecutionResult,
  separateOperations,
} from 'graphql';
export { GraphQLRequest, GraphQLResponse };

// TODO(AS3) I'm not sure if this is execution.  Perhaps, a top-level export.
export { GraphQLSchemaModule } from 'apollo-graphql';

export { Context, ContextFunction } from 'apollo-server-core';

/** Options for {@link processGraphQLRequest} */
interface ProcessRequestInput {
  request: GraphQLRequest;
  schema: GraphQLSchema;
}

/**
 * Process a GraphQLRequest. This includes parsing, validation,
 * and execution of a query against a provided schema.
 *
 * @param args
 * @param args.request - A GraphQLRequest object consisting of a query string and, optionally, an operationName, and variables
 * @param args.schema - A GraphQLSchema to validate and execute the request against
 *
 * @returns A Promise consisting of data and errors from execution
 * @throws GraphQLError on parse failure
 * @throws GraphQLError[] on validation failure
 */
export async function processGraphqlRequest<TData = Record<string, any>>({
  request,
  schema,
}: ProcessRequestInput): Promise<ExecutionResult<TData>> {
  const { query, operationName, variables } = request;

  if (!query) {
    throw new GraphQLError('No query document provided');
  }

  // throws GraphQLError on unparseable document
  const document = parseGraphqlRequest({ query });

  // throws GraphQLError[] with all validation errors
  validateGraphqlRequest({
    schema,
    document,
    operationName,
  });

  return await executeGraphqlRequest<TData>({
    schema,
    document,
    operationName,
    ...(variables && { variables }),
  });
}

/** Options for {@link parseGraphqlRequest} */
interface ParseInput {
  query: string;
}

/**
 * Parse a GraphQL query into a DocumentNode
 *
 * @param args
 * @param args.query - A string representing a GraphQL query
 *
 * @returns A GraphQL DocumentNode
 * @throws GraphQLError on parse failure
 */
export function parseGraphqlRequest({ query }: ParseInput): DocumentNode {
  return parse(query);
}

/** Options for {@link validateGraphqlRequest} */
interface ValidateInput {
  document: DocumentNode;
  schema: GraphQLSchema;
  operationName?: string;
}

/**
 * Validate a query document against a schema
 *
 * @param args A query document
 * @param args.document A query document
 * @param args.schema The schema to validate a query document against
 * @param args.operationName (optional) An operationName must be provided if multiple operations exist in the provided document
 *
 * @throws GraphQLError[] An array of validation errors
 */
export function validateGraphqlRequest({
  document,
  schema,
  operationName,
}: ValidateInput): void {
  const errors: GraphQLError[] = [];
  const operations = separateOperations(document);
  if (Object.keys(operations).length > 1 && !operationName) {
    errors.push(
      new GraphQLError(
        'An `operationName` must be provided if multiple operations exist in the query document.'
      )
    );
  }

  errors.push(...validate(schema, document));

  if (errors.length > 0) {
    throw errors;
  }
}

/** Options for {@link executeGraphqlRequest} */
interface ExecutionInput<
  TContext extends Record<string, any> = Record<string, any>
> {
  schema: GraphQLSchema;
  document: DocumentNode;
  operationName?: string;
  variables?: VariableValues;
  context?: TContext;
}

/**
 * Parse a GraphQL query into a DocumentNode
 *
 * @param args
 * @param args.schema - A GraphQLSchema to execute a query against
 * @param args.document - A DocumentNode representing a GraphQL query
 * @param args.operationName - (optional) The name of the operation from the document to execute. Not required if only one operation is provided in the document.
 * @param args.variables - (optional) Any variables to be provided to the query
 * @param args.context - (optional) A context object which will be accessible to resolvers during execution
 *
 * @returns Data and errors from GraphQL execution
 * @throws GraphQLError
 */
export async function executeGraphqlRequest<TData = Record<string, any>>({
  schema,
  document,
  operationName,
  variables,
  context,
}: ExecutionInput): Promise<ExecutionResult<TData>> {
  return await execute<TData>({
    schema,
    document,
    operationName,
    ...(variables && { variableValues: variables }),
    ...(context && { contextValue: context }),
  });
}
