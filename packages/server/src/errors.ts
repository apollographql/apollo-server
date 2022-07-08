import {
  ASTNode,
  GraphQLError,
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

export class SyntaxError extends GraphQLError {
  constructor(graphqlError: GraphQLError) {
    super(graphqlError.message, {
      source: graphqlError.source,
      positions: graphqlError.positions,
      extensions: {
        ...graphqlError.extensions,
        code: 'GRAPHQL_PARSE_FAILED',
      },
      originalError: graphqlError,
    });

    this.name = 'SyntaxError';
  }
}

export class ValidationError extends GraphQLError {
  constructor(graphqlError: GraphQLError) {
    super(graphqlError.message, {
      nodes: graphqlError.nodes,
      extensions: {
        ...graphqlError.extensions,
        code: 'GRAPHQL_VALIDATION_FAILED',
      },
      originalError: graphqlError.originalError ?? graphqlError,
    });

    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends GraphQLError {
  constructor(message: string, options?: { extensions?: Record<string, any> }) {
    super(message, {
      extensions: { ...options?.extensions, code: 'UNAUTHENTICATED' },
    });

    this.name = 'AuthenticationError';
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message: string, options?: { extensions?: Record<string, any> }) {
    super(message, {
      extensions: { ...options?.extensions, code: 'FORBIDDEN' },
    });

    this.name = 'ForbiddenError';
  }
}

export class PersistedQueryNotFoundError extends GraphQLError {
  constructor() {
    super('PersistedQueryNotFound', {
      extensions: { code: 'PERSISTED_QUERY_NOT_FOUND' },
    });

    this.name = 'PersistedQueryNotFoundError';
  }
}

export class PersistedQueryNotSupportedError extends GraphQLError {
  constructor() {
    super('PersistedQueryNotSupported', {
      extensions: { code: 'PERSISTED_QUERY_NOT_SUPPORTED' },
    });

    this.name = 'PersistedQueryNotSupportedError';
  }
}

export class UserInputError extends GraphQLError {
  constructor(
    message: string,
    options?: {
      nodes?: ReadonlyArray<ASTNode> | undefined;
      originalError?: Error;
      extensions?: Record<string, any>;
    },
  ) {
    super(message, {
      nodes: options?.nodes,
      originalError: options?.originalError,
      extensions: { ...options?.extensions, code: 'BAD_USER_INPUT' },
    });

    this.name = 'UserInputError';
  }
}

export class UnknownOperationNameError extends GraphQLError {
  constructor(
    message: string,
    options?: {
      nodes?: ReadonlyArray<ASTNode> | undefined;
      originalError?: Error;
      extensions?: Record<string, any>;
    },
  ) {
    super(message, {
      nodes: options?.nodes,
      originalError: options?.originalError,
      extensions: { ...options?.extensions, code: 'UNKNOWN_OPERATION_NAME' },
    });

    this.name = 'UnknownOperationNameError';
  }
}

// TODO(AS4): We added this in AS4. Is that a good idea? We should at least
// document it, and maybe consider using it for more of the errors in
// runHttpQuery instead of just returning text/plain errors.
export class BadRequestError extends GraphQLError {
  constructor(message: string, options?: { extensions?: Record<string, any> }) {
    super(message, {
      extensions: { ...options?.extensions, code: 'BAD_REQUEST' },
    });

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
    const error: Error = ensureError(maybeError);

    const graphqlError: GraphQLError =
      error instanceof GraphQLError
        ? error
        : new GraphQLError(error.message, { originalError: error });

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
