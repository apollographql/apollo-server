import {
  GraphQLError,
  GraphQLErrorOptions,
  GraphQLFormattedError,
  GraphQLErrorExtensions,
} from 'graphql';

declare module 'graphql' {
  export interface GraphQLErrorExtensions {
    code?: string;
    exception?: {
      stacktrace?: ReadonlyArray<string>;
    };
  }
}

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
  }
}

export enum ApolloServerErrorCode {
  GRAPHQL_PARSE_FAILED = 'GRAPHQL_PARSE_FAILED',
  GRAPHQL_VALIDATION_FAILED = 'GRAPHQL_VALIDATION_FAILED',
  PERSISTED_QUERY_NOT_FOUND = 'PERSISTED_QUERY_NOT_FOUND',
  PERSISTED_QUERY_NOT_SUPPORTED = 'PERSISTED_QUERY_NOT_SUPPORTED',
  BAD_USER_INPUT = 'BAD_USER_INPUT',
  OPERATION_RESOLUTION_FAILURE = 'OPERATION_RESOLUTION_FAILURE',
  BAD_REQUEST = 'BAD_REQUEST',
}

export class SyntaxError extends GraphQLErrorWithCode {
  constructor(graphqlError: GraphQLError) {
    super(graphqlError.message, ApolloServerErrorCode.GRAPHQL_PARSE_FAILED, {
      source: graphqlError.source,
      positions: graphqlError.positions,
      extensions: graphqlError.extensions,
      originalError: graphqlError,
    });

    this.name = 'SyntaxError';
  }
}

export class ValidationError extends GraphQLErrorWithCode {
  constructor(graphqlError: GraphQLError) {
    super(
      graphqlError.message,
      ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
      {
        nodes: graphqlError.nodes,
        extensions: graphqlError.extensions,
        originalError: graphqlError.originalError ?? graphqlError,
      },
    );

    this.name = 'ValidationError';
  }
}

export class PersistedQueryNotFoundError extends GraphQLErrorWithCode {
  constructor() {
    super(
      'PersistedQueryNotFound',
      ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND,
    );
    this.name = 'PersistedQueryNotFoundError';
  }
}

export class PersistedQueryNotSupportedError extends GraphQLErrorWithCode {
  constructor() {
    super(
      'PersistedQueryNotSupported',
      ApolloServerErrorCode.PERSISTED_QUERY_NOT_SUPPORTED,
    );
    this.name = 'PersistedQueryNotSupportedError';
  }
}

export class UserInputError extends GraphQLErrorWithCode {
  constructor(graphqlError: GraphQLError) {
    super(graphqlError.message, ApolloServerErrorCode.BAD_USER_INPUT, {
      nodes: graphqlError.nodes,
      originalError: graphqlError.originalError ?? graphqlError,
      extensions: graphqlError.extensions,
    });

    this.name = 'UserInputError';
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
        extensions: graphqlError.extensions,
      },
    );

    this.name = 'OperationResolutionError';
  }
}

// TODO(AS4): We added this in AS4. Is that a good idea? We should at least
// document it, and maybe consider using it for more of the errors in
// runHttpQuery instead of just returning text/plain errors.
export class BadRequestError extends GraphQLErrorWithCode {
  constructor(message: string) {
    super(message, ApolloServerErrorCode.BAD_REQUEST);

    this.name = 'BadRequestError';
  }
}

// This function accepts any value that were thrown and convert it to GraphQLFormatterError.
// It also add default extensions.code and copy stack trace onto an extension if requested.
// This function should not throw.
export function normalizeAndFormatErrors(
  errors: ReadonlyArray<unknown>,
  options: {
    formatError?: (
      formattedError: GraphQLFormattedError,
      error: unknown,
    ) => GraphQLFormattedError;
    includeStackTracesInErrorResponses?: boolean;
  } = {},
): Array<GraphQLFormattedError> {
  const formatError = options.formatError ?? ((error) => error);
  return errors.map((error) => {
    try {
      return formatError(enrichError(error), error);
    } catch (formattingError) {
      if (options.includeStackTracesInErrorResponses) {
        // includeStackTracesInErrorResponses is used in development
        // so it will be helpful to show errors thrown by formatError hooks in that mode
        return enrichError(formattingError);
      } else {
        // obscure error
        return {
          message: 'Internal server error',
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        };
      }
    }
  });

  function enrichError(maybeError: unknown): GraphQLFormattedError {
    const graphqlError = ensureGraphQLError(maybeError);

    const extensions: GraphQLErrorExtensions = {
      ...graphqlError.extensions,
      code: graphqlError.extensions.code ?? 'INTERNAL_SERVER_ERROR',
    };

    const { originalError } = graphqlError;
    if (originalError != null && !(originalError instanceof GraphQLError)) {
      const originalErrorEnumerableEntries = Object.entries(
        originalError,
      ).filter(([key]) => key !== 'extensions');

      if (originalErrorEnumerableEntries.length > 0) {
        extensions.exception = {
          ...extensions.exception,
          ...Object.fromEntries(originalErrorEnumerableEntries),
        };
      }
    }

    if (options.includeStackTracesInErrorResponses) {
      extensions.exception = {
        ...extensions.exception,
        stacktrace: graphqlError.stack?.split('\n'),
      };
    }

    return { ...graphqlError.toJSON(), extensions };
  }
}

export function ensureError(maybeError: unknown): Error {
  return maybeError instanceof Error
    ? maybeError
    : new GraphQLError('Unexpected error value: ' + String(maybeError));
}

export function ensureGraphQLError(maybeError: unknown): GraphQLError {
  const error: Error = ensureError(maybeError);

  return error instanceof GraphQLError
    ? error
    : new GraphQLError(error.message, { originalError: error });
}
