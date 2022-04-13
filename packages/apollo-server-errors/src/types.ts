export enum ErrorCode {
  /**
   * The GraphQL operation string contains a syntax error.
   */
  GRAPHQL_PARSE_FAILED = 'GRAPHQL_PARSE_FAILED',
  /**
   * The GraphQL operation is not valid against the server's schema.
   */
  GRAPHQL_VALIDATION_FAILED = 'GRAPHQL_VALIDATION_FAILED',
  /**
   * The GraphQL operation includes an invalid value for a field argument.
   */
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  /**
   * The server failed to authenticate with a required data source, such as a REST API.
   */
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  /**
   * The server was unauthorized to access a required data source, such as a REST API.
   */
  FORBIDDEN = 'FORBIDDEN',
  /**
   * A client sent the hash of a query string to execute via automatic persisted queries, but the query was not in the APQ cache.
   */
  PERSISTED_QUERY_NOT_FOUND = 'PERSISTED_QUERY_NOT_FOUND',
  /**
   * A client sent the hash of a query string to execute via automatic persisted queries, but the server has disabled APQ.
   */
  PERSISTED_QUERY_NOT_SUPPORTED = 'PERSISTED_QUERY_NOT_SUPPORTED',
  /**
   * This is the default error code returned by any ApolloError instance that doesn't specify a different code.
   */
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

export type TErrorCode = `${ErrorCode}`;

export enum ErrorName {
  /**
   * A error occurred without a name provided. This is the default name.
   */
  APOLLO_ERROR = 'ApolloError',
  /**
   * The GraphQL operation string contains a syntax error.
   */
  SYNTAX_ERROR = 'SyntaxError',
  /**
   * The GraphQL operation is not valid against the server's schema.
   */
  VALIDATION_ERROR = 'ValidationError',
  /**
   * The server failed to authenticate with a required data source, such as a REST API.
   */
  AUTHENTICATION_ERROR = 'AuthenticationError',
  /**
   * The server was unauthorized to access a required data source, such as a REST API.
   */
  FORBIDDEN_ERROR = 'ForbiddenError',
  /**
   * A client sent the hash of a query string to execute via automatic persisted queries, but the query was not in the APQ cache.
   */
  PERSISTED_QUERY_NOT_FOUND_ERROR = 'PersistedQueryNotFoundError',
  /**
   * A client sent the hash of a query string to execute via automatic persisted queries, but the server has disabled APQ.
   */
  PERSISTED_QUERY_NOT_SUPPORTED_ERROR = 'PersistedQueryNotSupportedError',
  /**
   * The GraphQL operation includes an invalid value for a field argument.
   */
  USER_INPUT_ERROR = 'UserInputError',
}

export type TErrorName = `${ErrorName}`;
