import type {
  BaseContext,
  GraphQLRequest,
  HTTPGraphQLHead,
  HTTPGraphQLRequest,
  HTTPGraphQLResponse,
} from './externalTypes';
import {
  ApolloServerInternals,
  internalExecuteOperation,
  SchemaDerivedData,
} from './ApolloServer';
import type { FormattedExecutionResult } from 'graphql';
import { BadRequestError } from './errors';
import { HeaderMap } from './internal';

function fieldIfString(
  o: Record<string, any>,
  fieldName: string,
): string | undefined {
  if (typeof o[fieldName] === 'string') {
    return o[fieldName];
  }
  return undefined;
}

function jsonParsedFieldIfNonEmptyString(
  o: Record<string, any>,
  fieldName: string,
): Record<string, any> | undefined {
  if (typeof o[fieldName] === 'string' && o[fieldName]) {
    let hopefullyRecord;
    try {
      hopefullyRecord = JSON.parse(o[fieldName]);
    } catch {
      throw new BadRequestError(
        `The ${fieldName} search parameter contains invalid JSON.`,
      );
    }
    if (!isStringRecord(hopefullyRecord)) {
      throw new BadRequestError(
        `The ${fieldName} search parameter should contain a JSON-encoded object.`,
      );
    }
    return hopefullyRecord;
  }
  return undefined;
}

function fieldIfRecord(
  o: Record<string, any>,
  fieldName: string,
): Record<string, any> | undefined {
  if (isStringRecord(o[fieldName])) {
    return o[fieldName];
  }
  return undefined;
}

function isStringRecord(o: any): o is Record<string, any> {
  return o && typeof o === 'object' && !Buffer.isBuffer(o) && !Array.isArray(o);
}

function isNonEmptyStringRecord(o: any): o is Record<string, any> {
  return isStringRecord(o) && Object.keys(o).length > 0;
}

function ensureQueryIsStringOrMissing(query: any) {
  if (!query || typeof query === 'string') {
    return;
  }
  // Check for a common error first.
  if (query.kind === 'Document') {
    throw new BadRequestError(
      "GraphQL queries must be strings. It looks like you're sending the " +
        'internal graphql-js representation of a parsed query in your ' +
        'request instead of a request in the GraphQL query language. You ' +
        'can convert an AST to a string using the `print` function from ' +
        '`graphql`, or use a client like `apollo-client` which converts ' +
        'the internal representation to a string for you.',
    );
  } else {
    throw new BadRequestError('GraphQL queries must be strings.');
  }
}

export const badMethodErrorMessage =
  'Apollo Server supports only GET/POST requests.';

export async function runHttpQuery<TContext extends BaseContext>(
  httpRequest: HTTPGraphQLRequest,
  contextValue: TContext,
  schemaDerivedData: SchemaDerivedData,
  internals: ApolloServerInternals<TContext>,
): Promise<HTTPGraphQLResponse> {
  let graphQLRequest: GraphQLRequest;

  switch (httpRequest.method) {
    case 'POST':
      // TODO(AS4): If it's an array, some error about enabling batching?
      if (!isNonEmptyStringRecord(httpRequest.body)) {
        throw new BadRequestError(
          'POST body missing, invalid Content-Type, or JSON object has no keys.',
        );
      }

      ensureQueryIsStringOrMissing(httpRequest.body.query);

      if (typeof httpRequest.body.variables === 'string') {
        // TODO(AS4): make sure we note this change in migration
        throw new BadRequestError(
          '`variables` in a POST body should be provided as an object, not a recursively JSON-encoded string.',
        );
      }

      if (typeof httpRequest.body.extensions === 'string') {
        // TODO(AS4): make sure we note this change in migration
        throw new BadRequestError(
          '`extensions` in a POST body should be provided as an object, not a recursively JSON-encoded string.',
        );
      }

      graphQLRequest = {
        query: fieldIfString(httpRequest.body, 'query'),
        operationName: fieldIfString(httpRequest.body, 'operationName'),
        variables: fieldIfRecord(httpRequest.body, 'variables'),
        extensions: fieldIfRecord(httpRequest.body, 'extensions'),
        http: httpRequest,
      };

      break;
    case 'GET':
      if (!isStringRecord(httpRequest.searchParams)) {
        throw new BadRequestError('GET query missing.');
      }

      ensureQueryIsStringOrMissing(httpRequest.searchParams.query);

      graphQLRequest = {
        query: fieldIfString(httpRequest.searchParams, 'query'),
        operationName: fieldIfString(httpRequest.searchParams, 'operationName'),
        variables: jsonParsedFieldIfNonEmptyString(
          httpRequest.searchParams,
          'variables',
        ),
        extensions: jsonParsedFieldIfNonEmptyString(
          httpRequest.searchParams,
          'extensions',
        ),
        http: httpRequest,
      };

      break;
    default:
      throw new BadRequestError(badMethodErrorMessage);
  }

  const graphQLResponse = await internalExecuteOperation({
    graphQLRequest,
    contextValue,
    internals,
    schemaDerivedData,
  });

  const body = prettyJSONStringify(
    orderExecutionResultFields(graphQLResponse.result),
  );

  graphQLResponse.http.headers.set(
    'content-length',
    Buffer.byteLength(body, 'utf8').toString(),
  );

  return {
    ...graphQLResponse.http,
    completeBody: body,
    bodyChunks: null,
  };
}

function orderExecutionResultFields(
  result: FormattedExecutionResult,
): FormattedExecutionResult {
  // See https://github.com/facebook/graphql/pull/384 for why
  // errors comes first.
  return {
    errors: result.errors,
    data: result.data,
    extensions: result.extensions,
  };
}

// The result of a curl does not appear well in the terminal, so we add an extra new line
export function prettyJSONStringify(value: any) {
  return JSON.stringify(value) + '\n';
}

export function cloneObject<T extends Object>(object: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(object)), object);
}

export function newHTTPGraphQLHead(statusCode?: number): HTTPGraphQLHead {
  return {
    statusCode,
    headers: new HeaderMap(),
  };
}
