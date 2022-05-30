import {
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

export interface ErrorOptions {
  code?: string;
  // This declaration means it takes any "class" that has a constructor that
  // takes a single string, and should be invoked via the `new` operator.
  errorClass?: new (message: string) => GraphQLError;
}

export function fromGraphQLError(error: GraphQLError, options?: ErrorOptions) {
  const copy: GraphQLError = options?.errorClass
    ? new options.errorClass(error.message)
    : new GraphQLError(error.message);

  // copy enumerable keys
  for (const [key, value] of Object.entries(error)) {
    // extensions are handled bellow
    if (key !== 'extensions') {
      (copy as any)[key] = value;
    }
  }

  // merge extensions instead of just copying them
  (copy as any).extensions = {
    ...copy.extensions,
    ...error.extensions,
  };

  // Fallback on default for code
  if (!copy.extensions.code) {
    copy.extensions.code = options?.code || 'INTERNAL_SERVER_ERROR';
  }

  // copy the original error, while keeping all values non-enumerable, so they
  // are not printed unless directly referenced
  Object.defineProperty(copy, 'originalError', { value: {} });
  Object.getOwnPropertyNames(error).forEach((key) => {
    Object.defineProperty(copy.originalError, key, {
      value: (error as any)[key],
    });
  });

  return copy;
}

export class SyntaxError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'GRAPHQL_PARSE_FAILED' } });

    this.name = 'SyntaxError';
  }
}

export class ValidationError extends GraphQLError {
  constructor(message: string) {
    super(message, { extensions: { code: 'GRAPHQL_VALIDATION_FAILED' } });

    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends GraphQLError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, { extensions: { ...extensions, code: 'UNAUTHENTICATED' } });

    this.name = 'AuthenticationError';
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, { extensions: { ...extensions, code: 'FORBIDDEN' } });

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
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, { extensions: { ...extensions, code: 'BAD_USER_INPUT' } });

    this.name = 'UserInputError';
  }
}

// TODO(AS4): We added this in AS4. Is that a good idea? We should at least
// document it, and maybe consider using it for more of the errors in
// runHttpQuery instead of just returning text/plain errors.
export class BadRequestError extends GraphQLError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, { extensions: { ...extensions, code: 'BAD_REQUEST' } });

    this.name = 'BadRequestError';
  }
}

// This function should not throw.
export function formatApolloErrors(
  errors: ReadonlyArray<unknown>,
  options: {
    formatError?: (
      formattedError: GraphQLFormattedError,
      error: unknown,
    ) => GraphQLFormattedError;
    includeStackTracesInErrorResponses?: boolean;
    errorCode?: string;
  } = {},
): Array<GraphQLFormattedError> {
  // Errors that occur in graphql-tools can contain an errors array that contains the errors thrown in a merged schema
  // https://github.com/apollographql/graphql-tools/blob/3d53986ca/src/stitching/errors.ts#L104-L107
  //
  // They are are wrapped in an extra GraphQL error
  // https://github.com/apollographql/graphql-tools/blob/3d53986ca/src/stitching/errors.ts#L109-L113
  // which calls:
  // https://github.com/graphql/graphql-js/blob/0a30b62964/src/error/locatedError.js#L18-L37
  // Some processing for these nested errors could be done here:
  //
  // if (Array.isArray((error as any).errors)) {
  //   (error as any).errors.forEach(e => flattenedErrors.push(e));
  // } else if (
  //   (error as any).originalError &&
  //   Array.isArray((error as any).originalError.errors)
  // ) {
  //   (error as any).originalError.errors.forEach(e => flattenedErrors.push(e));
  // } else {
  //   flattenedErrors.push(error);
  // }

  const { includeStackTracesInErrorResponses, errorCode } = options;

  const formatError = options.formatError ?? ((error) => error);
  return errors.map((error) => {
    try {
      return formatError(enrichError(error), error);
    } catch (err) {
      if (includeStackTracesInErrorResponses) {
        return enrichError(err);
      } else {
        // obscure error
        return { message: 'Internal server error' };
      }
    }
  });

  function enrichError(maybeError: unknown): GraphQLFormattedError {
    const error: Error =
      maybeError instanceof Error
        ? maybeError
        : new GraphQLError('Unexpected error value: ' + String(maybeError));

    const graphqlError: GraphQLError =
      error instanceof GraphQLError
        ? error
        : new GraphQLError(error.message, { originalError: error });

    const extensions: GraphQLErrorExtensions = {
      ...graphqlError.extensions,
      code:
        graphqlError.extensions.code ?? errorCode ?? 'INTERNAL_SERVER_ERROR',
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

    if (includeStackTracesInErrorResponses) {
      extensions.exception = {
        ...extensions.exception,
        stacktrace: graphqlError.stack?.split('\n'),
      };
    }

    return { ...graphqlError.toJSON(), extensions };
  }
}
