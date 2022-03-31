import { formatApolloErrors } from './errors';
import {
  processGraphQLRequest,
  GraphQLRequest,
  GraphQLRequestContext,
  GraphQLResponse,
} from './requestPipeline';
import type {
  BaseContext,
  HTTPGraphQLRequest,
  HTTPGraphQLResponse,
} from '@apollo/server-types';
import { newCachePolicy } from './cachePolicy';
import type { ApolloServerInternals, SchemaDerivedData } from './ApolloServer';

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

export class HttpQueryError extends Error {
  public statusCode: number;
  public isGraphQLError: boolean;
  // TODO(AS4): consider making this a map (or whatever type we settle on
  // for headers)
  public headers: Map<string, string>;

  constructor(
    statusCode: number,
    message: string,
    isGraphQLError: boolean = false,
    headers?: Map<string, string>,
  ) {
    super(message);
    this.name = 'HttpQueryError';
    this.statusCode = statusCode;
    this.isGraphQLError = isGraphQLError;
    // This throws if any header names have capital leaders.
    this.headers = new HeaderMap(headers ?? []);
  }

  // TODO(AS4): Do we really want any text/plain errors, or
  // or should we unify error handling so that every single error
  // works the same way (JSON + sent through the plugin system)?
  asHTTPGraphQLResponse(): HTTPGraphQLResponse {
    return {
      statusCode: this.statusCode,
      // Copy to HeaderMap to ensure lower-case keys.
      headers: new HeaderMap([
        ['content-type', 'text/plain'],
        ...this.headers.entries(),
      ]),
      completeBody: this.message,
      bodyChunks: null,
    };
  }
}

export function isHttpQueryError(e: unknown): e is HttpQueryError {
  return (e as any)?.name === 'HttpQueryError';
}

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
      throw new HttpQueryError(
        400,
        `The ${fieldName} search parameter contains invalid JSON.`,
      );
    }
    if (!isStringRecord(hopefullyRecord)) {
      throw new HttpQueryError(
        400,
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
    throw new HttpQueryError(
      400,
      "GraphQL queries must be strings. It looks like you're sending the " +
        'internal graphql-js representation of a parsed query in your ' +
        'request instead of a request in the GraphQL query language. You ' +
        'can convert an AST to a string using the `print` function from ' +
        '`graphql`, or use a client like `apollo-client` which converts ' +
        'the internal representation to a string for you.',
    );
  } else {
    throw new HttpQueryError(400, 'GraphQL queries must be strings.');
  }
}

// This function should not throw.
export async function runHttpQuery<TContext extends BaseContext>(
  httpRequest: HTTPGraphQLRequest,
  context: TContext,
  schemaDerivedData: SchemaDerivedData,
  internals: ApolloServerInternals<TContext>,
): Promise<HTTPGraphQLResponse> {
  try {
    let graphqlRequest: GraphQLRequest;

    switch (httpRequest.method) {
      case 'POST':
        // TODO(AS4): If it's an array, some error about enabling batching?
        if (!isNonEmptyStringRecord(httpRequest.body)) {
          return new HttpQueryError(
            400,
            'POST body missing, invalid Content-Type, or JSON object has no keys.',
          ).asHTTPGraphQLResponse();
        }

        ensureQueryIsStringOrMissing(httpRequest.body.query);

        if (typeof httpRequest.body.variables === 'string') {
          // TODO(AS4): make sure we note this change in migration
          return new HttpQueryError(
            400,
            '`variables` in a POST body should be provided as an object, not a recursively JSON-encoded string.',
          ).asHTTPGraphQLResponse();
        }

        if (typeof httpRequest.body.extensions === 'string') {
          // TODO(AS4): make sure we note this change in migration
          return new HttpQueryError(
            400,
            '`extensions` in a POST body should be provided as an object, not a recursively JSON-encoded string.',
          ).asHTTPGraphQLResponse();
        }

        graphqlRequest = {
          query: fieldIfString(httpRequest.body, 'query'),
          operationName: fieldIfString(httpRequest.body, 'operationName'),
          variables: fieldIfRecord(httpRequest.body, 'variables'),
          extensions: fieldIfRecord(httpRequest.body, 'extensions'),
          http: httpRequest,
        };

        break;
      case 'GET':
        if (!isStringRecord(httpRequest.searchParams)) {
          return new HttpQueryError(
            400,
            'GET query missing.',
          ).asHTTPGraphQLResponse();
        }

        ensureQueryIsStringOrMissing(httpRequest.searchParams.query);

        graphqlRequest = {
          query: fieldIfString(httpRequest.searchParams, 'query'),
          operationName: fieldIfString(
            httpRequest.searchParams,
            'operationName',
          ),
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
        return new HttpQueryError(
          405,
          'Apollo Server supports only GET/POST requests.',
          false,
          new HeaderMap([['allow', 'GET, POST']]),
        ).asHTTPGraphQLResponse();
    }

    const partialResponse: Pick<HTTPGraphQLResponse, 'headers' | 'statusCode'> =
      {
        headers: new HeaderMap([['content-type', 'application/json']]),
        statusCode: undefined,
      };

    const requestContext: GraphQLRequestContext<TContext> = {
      logger: internals.logger,
      schema: schemaDerivedData.schema,
      request: graphqlRequest,
      response: { http: partialResponse },
      // We clone the context because there are some assumptions that every operation
      // execution has a brand new context object; specifically, in order to implement
      // willResolveField we put a Symbol on the context that is specific to a particular
      // request pipeline execution. We could avoid this if we had a better way of
      // instrumenting execution.
      //
      // We don't want to do a deep clone here, because one of the main advantages of
      // using batched HTTP requests is to share context across operations for a
      // single request.
      // NOTE: THIS IS DUPLICATED IN ApolloServer.prototype.executeOperation.
      context: cloneObject(context),
      cache: internals.cache,
      metrics: {},
      overallCachePolicy: newCachePolicy(),
    };
    const response = await processGraphQLRequest(
      schemaDerivedData,
      internals,
      requestContext,
    );

    // This code is run on parse/validation errors and any other error that
    // doesn't reach GraphQL execution
    if (response.errors && typeof response.data === 'undefined') {
      // don't include options, since the errors have already been formatted
      return {
        statusCode: response.http?.statusCode || 400,
        headers: new HeaderMap([
          ['content-type', 'application/json'],
          ...(response.http?.headers ?? new Map()),
        ]),
        completeBody: prettyJSONStringify({
          // TODO(AS4): Understand why we don't call formatApolloErrors here.
          errors: response.errors,
          extensions: response.extensions,
        }),
        bodyChunks: null,
      };
    }

    const body = prettyJSONStringify(serializeGraphQLResponse(response));

    partialResponse.headers.set(
      'content-length',
      Buffer.byteLength(body, 'utf8').toString(),
    );

    return {
      ...partialResponse,
      completeBody: body,
      bodyChunks: null,
    };
  } catch (error) {
    if (error instanceof HttpQueryError) {
      return error.asHTTPGraphQLResponse();
    }

    return {
      statusCode: 500,
      headers: new HeaderMap([['content-type', 'application/json']]),
      completeBody: prettyJSONStringify({
        errors: formatApolloErrors([error as Error], {
          debug: internals.includeStackTracesInErrorResponses,
          formatter: internals.formatError,
        }),
      }),
      bodyChunks: null,
    };
  }
}

function serializeGraphQLResponse(
  response: GraphQLResponse,
): Pick<GraphQLResponse, 'errors' | 'data' | 'extensions'> {
  // See https://github.com/facebook/graphql/pull/384 for why
  // errors comes first.
  return {
    errors: response.errors,
    data: response.data,
    extensions: response.extensions,
  };
}

// The result of a curl does not appear well in the terminal, so we add an extra new line
export function prettyJSONStringify(value: any) {
  return JSON.stringify(value) + '\n';
}

export function cloneObject<T extends Object>(object: T): T {
  return Object.assign(Object.create(Object.getPrototypeOf(object)), object);
}
