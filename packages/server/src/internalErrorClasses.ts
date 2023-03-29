import { GraphQLError, type GraphQLErrorOptions } from 'graphql';
import { ApolloServerErrorCode } from './errors/index.js';
import { newHTTPGraphQLHead } from './runHttpQuery.js';
import { HeaderMap } from './utils/HeaderMap.js';

// These error classes are not part of Apollo Server's external API; the
// ApolloServerErrorCode enum is (exported from `@apollo/server/errors`).

class GraphQLErrorWithCode extends GraphQLError {
  constructor(
    message: string,
    code: ApolloServerErrorCode,
    options?: GraphQLErrorOptions,
  ) {
    super(message, {
      ...options,
      extensions: { ...options?.extensions, code },
    });
    this.name = this.constructor.name;
  }
}

export class SyntaxError extends GraphQLErrorWithCode {
  constructor(graphqlError: GraphQLError) {
    super(graphqlError.message, ApolloServerErrorCode.GRAPHQL_PARSE_FAILED, {
      source: graphqlError.source,
      positions: graphqlError.positions,
      extensions: { http: newHTTPGraphQLHead(400), ...graphqlError.extensions },
      originalError: graphqlError,
    });
  }
}

export class ValidationError extends GraphQLErrorWithCode {
  constructor(graphqlError: GraphQLError) {
    super(
      graphqlError.message,
      ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
      {
        nodes: graphqlError.nodes,
        extensions: {
          http: newHTTPGraphQLHead(400),
          ...graphqlError.extensions,
        },
        originalError: graphqlError.originalError ?? graphqlError,
      },
    );
  }
}

// Persisted query errors (especially "not found") need to be uncached, because
// hopefully we're about to fill in the APQ cache and the same request will
// succeed next time. We also want a 200 response to avoid any error handling
// that may mask the contents of an error response. (Otherwise, the default
// status code for a response with `errors` but no `data` (even null) is 400.)
const getPersistedQueryErrorHttp = () => ({
  status: 200,
  headers: new HeaderMap([
    ['cache-control', 'private, no-cache, must-revalidate'],
  ]),
});

export class PersistedQueryNotFoundError extends GraphQLErrorWithCode {
  constructor() {
    super(
      'PersistedQueryNotFound',
      ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND,
      { extensions: { http: getPersistedQueryErrorHttp() } },
    );
  }
}

export class PersistedQueryNotSupportedError extends GraphQLErrorWithCode {
  constructor() {
    super(
      'PersistedQueryNotSupported',
      ApolloServerErrorCode.PERSISTED_QUERY_NOT_SUPPORTED,
      // Not super clear why we need this to be uncached (makes sense for
      // PersistedQueryNotFoundError, because there we're about to fill the
      // cache and make the next copy of the same request succeed) but we've
      // been doing it for years so :shrug:
      { extensions: { http: getPersistedQueryErrorHttp() } },
    );
  }
}

export class UserInputError extends GraphQLErrorWithCode {
  constructor(graphqlError: GraphQLError) {
    super(graphqlError.message, ApolloServerErrorCode.BAD_USER_INPUT, {
      nodes: graphqlError.nodes,
      originalError: graphqlError.originalError ?? graphqlError,
      extensions: graphqlError.extensions,
    });
  }
}

export class OperationResolutionError extends GraphQLErrorWithCode {
  constructor(graphqlError: GraphQLError) {
    super(
      graphqlError.message,
      ApolloServerErrorCode.OPERATION_RESOLUTION_FAILURE,
      {
        nodes: graphqlError.nodes,
        originalError: graphqlError.originalError ?? graphqlError,
        extensions: {
          http: newHTTPGraphQLHead(400),
          ...graphqlError.extensions,
        },
      },
    );
  }
}

export class BadRequestError extends GraphQLErrorWithCode {
  constructor(message: string, options?: GraphQLErrorOptions) {
    super(message, ApolloServerErrorCode.BAD_REQUEST, {
      ...options,
      // Default to 400 status code, but caller can override. (If caller just
      // wants to override headers... well, they can't, sorry.)
      extensions: { http: newHTTPGraphQLHead(400), ...options?.extensions },
    });
  }
}
