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
  ExecutionResult,
  separateOperations,
} from 'graphql';
import { execute } from './execute';
export { GraphQLRequest, GraphQLResponse };

// TODO(AS3) I'm not sure if this is execution.  Perhaps, a top-level export.
export { GraphQLSchemaModule } from 'apollo-graphql';

export { Context, ContextFunction } from 'apollo-server-core';

/** Options for {@link processGraphQLRequest} */
interface ProcessRequestInput<TContext extends Record<string, any>> {
  request: GraphQLRequest;
  schema: GraphQLSchema;
  context?: TContext;
}

/**
 * Process a GraphQLRequest. This includes parsing, validation,
 * and execution of a query against a provided schema.
 *
 * @param args
 * @param args.request - A GraphQLRequest object consisting of a query string and, optionally, an operationName, and variables
 * @param args.schema - A GraphQLSchema to validate and execute the request against
 * @param args.context - An optional context object which is available during GraphQL execution
 *
 * @returns A Promise consisting of:
 *   1. Errors if parsing or validation errors occurred
 *   2. Data and errors if execution occurred but encountered errors
 *   3. Data without errors if execution was successful without errors
 */
export async function processGraphqlRequest<
  TContext extends Record<string, any> = Record<string, any>
>({
  request,
  schema,
  context,
}: ProcessRequestInput<TContext>): Promise<ExecutionResult> {
  const { query, operationName, variables } = request;

  if (!query) {
    return {
      errors: [new GraphQLError('No query document provided')],
    };
  }

  // returns early with errors if the document can't be parsed
  const parseResult = parseGraphqlRequest({ query });
  if ('error' in parseResult) {
    return { errors: [parseResult.error] };
  }

  // Collect document validation errors and return early if there are any
  const documentValidationErrors = validateGraphqlRequest({
    schema,
    document: parseResult.document,
    operationName,
  });

  if (documentValidationErrors.length > 0) {
    return { errors: documentValidationErrors };
  }

  return await executeGraphqlRequest<TContext>({
    schema,
    document: parseResult.document,
    operationName,
    ...(variables && { variables }),
    ...(context && { context }),
  });
}

/** Options for {@link parseGraphqlRequest} */
interface ParseInput {
  query: string;
}

type ParseResult = { error: GraphQLError } | { document: DocumentNode };

/**
 * Parse a GraphQL query into a DocumentNode
 *
 * @param args
 * @param args.query - A string representing a GraphQL query
 *
 * @returns A GraphQL DocumentNode if parse is successful, else a GraphQLError
 */
export function parseGraphqlRequest({ query }: ParseInput): ParseResult {
  try {
    const document = parse(query);
    return { document };
  } catch (e) {
    return { error: e as GraphQLError };
  }
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
 * @returns An array of validation errors
 */
export function validateGraphqlRequest({
  document,
  schema,
  operationName,
}: ValidateInput): GraphQLError[] {
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
  return errors;
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
 * @returns
 *   1. Data if execution is successful with no errors
 *   2. Data and errors if execution occurred with errors
 *
 * @see https://github.com/graphql/graphql-spec/blob/master/spec/Section%207%20--%20Response.md#response-format
 */
export async function executeGraphqlRequest<
  TContext extends Record<string, any> = Record<string, any>
>({
  schema,
  document,
  operationName,
  variables,
  context,
}: ExecutionInput<TContext>): Promise<ExecutionResult> {
  return await execute({
    schema,
    document,
    operationName,
    ...(variables && { variableValues: variables }),
    ...(context && { contextValue: context }),
  });
}
