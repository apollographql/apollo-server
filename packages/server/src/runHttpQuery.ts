import type {
  BaseContext,
  GraphQLExperimentalFormattedIncrementalResult,
  GraphQLExperimentalFormattedInitialIncrementalExecutionResult,
  GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult,
  GraphQLRequest,
  HTTPGraphQLHead,
  HTTPGraphQLRequest,
  HTTPGraphQLResponse,
} from './externalTypes/index.js';
import {
  ApolloServer,
  ApolloServerInternals,
  chooseContentTypeForSingleResultResponse,
  internalExecuteOperation,
  MEDIA_TYPES,
  SchemaDerivedData,
} from './ApolloServer.js';
import { FormattedExecutionResult, Kind } from 'graphql';
import { BadRequestError } from './internalErrorClasses.js';
import Negotiator from 'negotiator';
import { HeaderMap } from './utils/HeaderMap.js';

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

export async function runHttpQuery<TContext extends BaseContext>({
  server,
  httpRequest,
  contextValue,
  schemaDerivedData,
  internals,
  sharedResponseHTTPGraphQLHead,
}: {
  server: ApolloServer<TContext>;
  httpRequest: HTTPGraphQLRequest;
  contextValue: TContext;
  schemaDerivedData: SchemaDerivedData;
  internals: ApolloServerInternals<TContext>;
  sharedResponseHTTPGraphQLHead: HTTPGraphQLHead | null;
}): Promise<HTTPGraphQLResponse> {
  let graphQLRequest: GraphQLRequest;

  switch (httpRequest.method) {
    case 'POST': {
      if (!isNonEmptyStringRecord(httpRequest.body)) {
        throw new BadRequestError(
          'POST body missing, invalid Content-Type, or JSON object has no keys.',
        );
      }

      ensureQueryIsStringOrMissing(httpRequest.body.query);

      if (typeof httpRequest.body.variables === 'string') {
        throw new BadRequestError(
          '`variables` in a POST body should be provided as an object, not a recursively JSON-encoded string.',
        );
      }

      if (typeof httpRequest.body.extensions === 'string') {
        throw new BadRequestError(
          '`extensions` in a POST body should be provided as an object, not a recursively JSON-encoded string.',
        );
      }

      if (
        'extensions' in httpRequest.body &&
        httpRequest.body.extensions !== null &&
        !isStringRecord(httpRequest.body.extensions)
      ) {
        throw new BadRequestError(
          '`extensions` in a POST body must be an object if provided.',
        );
      }

      if (
        'variables' in httpRequest.body &&
        httpRequest.body.variables !== null &&
        !isStringRecord(httpRequest.body.variables)
      ) {
        throw new BadRequestError(
          '`variables` in a POST body must be an object if provided.',
        );
      }

      if (
        'operationName' in httpRequest.body &&
        httpRequest.body.operationName !== null &&
        typeof httpRequest.body.operationName !== 'string'
      ) {
        throw new BadRequestError(
          '`operationName` in a POST body must be a string if provided.',
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
      throw new BadRequestError(
        'Apollo Server supports only GET/POST requests.',
        {
          extensions: {
            http: {
              status: 405,
              headers: new HeaderMap([['allow', 'GET, POST']]),
            },
          },
        },
      );
  }

  const graphQLResponse = await internalExecuteOperation(
    {
      server,
      graphQLRequest,
      internals,
      schemaDerivedData,
      sharedResponseHTTPGraphQLHead,
    },
    { contextValue },
  );

  if (graphQLResponse.body.kind === 'single') {
    if (!graphQLResponse.http.headers.get('content-type')) {
      // If we haven't already set the content-type (via a plugin or something),
      // decide which content-type to use based on the accept header.
      const contentType = chooseContentTypeForSingleResultResponse(httpRequest);
      if (contentType === null) {
        throw new BadRequestError(
          `An 'accept' header was provided for this request which does not accept ` +
            `${MEDIA_TYPES.APPLICATION_JSON} or ${MEDIA_TYPES.APPLICATION_GRAPHQL_RESPONSE_JSON}`,
          // Use 406 Not Accepted
          { extensions: { http: { status: 406 } } },
        );
      }
      graphQLResponse.http.headers.set('content-type', contentType);
    }

    return {
      ...graphQLResponse.http,
      body: {
        kind: 'complete',
        string: prettyJSONStringify(
          orderExecutionResultFields(graphQLResponse.body.singleResult),
        ),
      },
    };
  }

  // Note that incremental delivery is not yet part of the official GraphQL
  // spec. We are implementing a proposed version of the spec, and require
  // clients to explicitly state `deferSpec=20220824`. Once incremental delivery
  // has been added to the GraphQL spec, we will support `accept` headers
  // without `deferSpec` as well (perhaps with slightly different behavior if
  // anything has changed).
  const acceptHeader = httpRequest.headers.get('accept');
  if (
    !(
      acceptHeader &&
      new Negotiator({
        headers: { accept: httpRequest.headers.get('accept') },
      }).mediaType([
        // mediaType() will return the first one that matches, so if the client
        // doesn't include the deferSpec parameter it will match this one here,
        // which isn't good enough.
        MEDIA_TYPES.MULTIPART_MIXED_NO_DEFER_SPEC,
        MEDIA_TYPES.MULTIPART_MIXED_EXPERIMENTAL,
      ]) === MEDIA_TYPES.MULTIPART_MIXED_EXPERIMENTAL
    )
  ) {
    // The client ran an operation that would yield multiple parts, but didn't
    // specify `accept: multipart/mixed`. We return an error.
    throw new BadRequestError(
      'Apollo server received an operation that uses incremental delivery ' +
        '(@defer or @stream), but the client does not accept multipart/mixed ' +
        'HTTP responses. To enable incremental delivery support, add the HTTP ' +
        "header 'Accept: multipart/mixed; deferSpec=20220824'.",
      // Use 406 Not Accepted
      { extensions: { http: { status: 406 } } },
    );
  }

  graphQLResponse.http.headers.set(
    'content-type',
    'multipart/mixed; boundary="-"; deferSpec=20220824',
  );
  return {
    ...graphQLResponse.http,
    body: {
      kind: 'chunked',
      asyncIterator: writeMultipartBody(
        graphQLResponse.body.initialResult,
        graphQLResponse.body.subsequentResults,
      ),
    },
  };
}

async function* writeMultipartBody(
  initialResult: GraphQLExperimentalFormattedInitialIncrementalExecutionResult,
  subsequentResults: AsyncIterable<GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult>,
): AsyncGenerator<string> {
  // Note: we assume in this function that every result other than the last has
  // hasNext=true and the last has hasNext=false. That is, we choose which kind
  // of delimiter to place at the end of each block based on the contents of the
  // message, not the structure of the async iterator. This makes sense because
  // we want to write the delimiter as soon as each block is done (so the client
  // can parse it immediately) but we may not know whether a general async
  // iterator is finished until we do async work.

  yield `\r\n---\r\ncontent-type: application/json; charset=utf-8\r\n\r\n${JSON.stringify(
    orderInitialIncrementalExecutionResultFields(initialResult),
  )}\r\n---${initialResult.hasNext ? '' : '--'}\r\n`;

  for await (const result of subsequentResults) {
    yield `content-type: application/json; charset=utf-8\r\n\r\n${JSON.stringify(
      orderSubsequentIncrementalExecutionResultFields(result),
    )}\r\n---${result.hasNext ? '' : '--'}\r\n`;
  }
}

// See https://github.com/facebook/graphql/pull/384 for why
// errors comes first.
function orderExecutionResultFields(
  result: FormattedExecutionResult,
): FormattedExecutionResult {
  return {
    errors: result.errors,
    data: result.data,
    extensions: result.extensions,
  };
}
function orderInitialIncrementalExecutionResultFields(
  result: GraphQLExperimentalFormattedInitialIncrementalExecutionResult,
): GraphQLExperimentalFormattedInitialIncrementalExecutionResult {
  return {
    hasNext: result.hasNext,
    errors: result.errors,
    data: result.data,
    incremental: orderIncrementalResultFields(result.incremental),
    extensions: result.extensions,
  };
}
function orderSubsequentIncrementalExecutionResultFields(
  result: GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult,
): GraphQLExperimentalFormattedSubsequentIncrementalExecutionResult {
  return {
    hasNext: result.hasNext,
    incremental: orderIncrementalResultFields(result.incremental),
    extensions: result.extensions,
  };
}

function orderIncrementalResultFields(
  incremental?: readonly GraphQLExperimentalFormattedIncrementalResult[],
): undefined | GraphQLExperimentalFormattedIncrementalResult[] {
  return incremental?.map((i: any) => ({
    hasNext: i.hasNext,
    errors: i.errors,
    path: i.path,
    label: i.label,
    data: i.data,
    items: i.items,
    extensions: i.extensions,
  }));
}

// The result of a curl does not appear well in the terminal, so we add an extra new line
export function prettyJSONStringify(value: FormattedExecutionResult) {
  return JSON.stringify(value) + '\n';
}

export function newHTTPGraphQLHead(status?: number): HTTPGraphQLHead {
  return {
    status,
    headers: new HeaderMap(),
  };
}

// Updates `target` with status code and headers from `source`. For now let's
// consider it undefined what happens if both have a status code set or both set
// the same header.
export function mergeHTTPGraphQLHead(
  target: HTTPGraphQLHead,
  source: HTTPGraphQLHead,
) {
  if (source.status) {
    target.status = source.status;
  }
  if (source.headers) {
    for (const [name, value] of source.headers) {
      // If source.headers contains non-lowercase header names, this will
      // catch that case as long as target.headers is a HeaderMap.
      target.headers.set(name, value);
    }
  }
}
