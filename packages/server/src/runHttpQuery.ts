import type {
  BaseContext,
  GraphQLRequest,
  HTTPGraphQLHead,
  HTTPGraphQLRequest,
  HTTPGraphQLResponse,
} from './externalTypes';
import {
  ApolloServer,
  ApolloServerInternals,
  internalExecuteOperation,
  SchemaDerivedData,
} from './ApolloServer.js';
import { FormattedExecutionResult, Kind } from 'graphql';
import { BadRequestError } from './internalErrorClasses.js';
import { URLSearchParams } from 'url';

// TODO(AS4): keep rethinking whether Map is what we want or if we just
// do want to use (our own? somebody else's?) Headers class.
// TODO(AS4): probably should do something better if you pass upper-case
// to get/has/delete as well.
export class HeaderMap extends Map<string, string> {
  override set(key: string, value: string): this {
    if (key.toLowerCase() !== key) {
      throw Error(`Headers must be lower-case, unlike ${key}`);
    }
    return super.set(key, value);
  }
}

function fieldIfString(
  o: Record<string, unknown>,
  fieldName: string,
): string | undefined {
  const value = o[fieldName];
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

function searchParamIfSpecifiedOnce(
  searchParams: URLSearchParams,
  paramName: string,
) {
  const values = searchParams.getAll(paramName);
  switch (values.length) {
    case 0:
      return undefined;
    case 1:
      return values[0];
    default:
      throw new BadRequestError(
        `The '${paramName}' search parameter may only be specified once.`,
      );
  }
}

function jsonParsedSearchParamIfSpecifiedOnce(
  searchParams: URLSearchParams,
  fieldName: string,
): Record<string, unknown> | undefined {
  const value = searchParamIfSpecifiedOnce(searchParams, fieldName);
  if (value === undefined) {
    return undefined;
  }
  let hopefullyRecord;
  try {
    hopefullyRecord = JSON.parse(value);
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

function fieldIfRecord(
  o: Record<string, unknown>,
  fieldName: string,
): Record<string, unknown> | undefined {
  const value = o[fieldName];
  if (isStringRecord(value)) {
    return value;
  }
  return undefined;
}

function isStringRecord(o: unknown): o is Record<string, unknown> {
  return (
    !!o && typeof o === 'object' && !Buffer.isBuffer(o) && !Array.isArray(o)
  );
}

function isNonEmptyStringRecord(o: unknown): o is Record<string, unknown> {
  return isStringRecord(o) && Object.keys(o).length > 0;
}

function ensureQueryIsStringOrMissing(query: unknown) {
  if (!query || typeof query === 'string') {
    return;
  }
  // Check for a common error first.
  if ((query as any).kind === Kind.DOCUMENT) {
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
  server: ApolloServer<TContext>,
  httpRequest: HTTPGraphQLRequest,
  contextValue: TContext,
  schemaDerivedData: SchemaDerivedData,
  internals: ApolloServerInternals<TContext>,
): Promise<HTTPGraphQLResponse> {
  let graphQLRequest: GraphQLRequest;

  switch (httpRequest.method) {
    case 'POST': {
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
    }

    case 'GET': {
      const searchParams = new URLSearchParams(httpRequest.search);

      graphQLRequest = {
        query: searchParamIfSpecifiedOnce(searchParams, 'query'),
        operationName: searchParamIfSpecifiedOnce(
          searchParams,
          'operationName',
        ),
        variables: jsonParsedSearchParamIfSpecifiedOnce(
          searchParams,
          'variables',
        ),
        extensions: jsonParsedSearchParamIfSpecifiedOnce(
          searchParams,
          'extensions',
        ),
        http: httpRequest,
      };

      break;
    }
    default:
      throw new BadRequestError(badMethodErrorMessage);
  }

  const graphQLResponse = await internalExecuteOperation({
    server,
    graphQLRequest,
    contextValue,
    internals,
    schemaDerivedData,
  });

  const body = prettyJSONStringify(
    orderExecutionResultFields(graphQLResponse.result),
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
export function prettyJSONStringify(value: FormattedExecutionResult) {
  return JSON.stringify(value) + '\n';
}

export function cloneObject<T extends Object>(object: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(object)), object);
}

export function newHTTPGraphQLHead(status?: number): HTTPGraphQLHead {
  return {
    status,
    headers: new HeaderMap(),
  };
}
