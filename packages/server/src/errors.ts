import { GraphQLError, GraphQLFormattedError } from 'graphql';

declare module 'graphql' {
  export interface GraphQLErrorExtensions {
    exception?: {
      code?: string;
      stacktrace?: ReadonlyArray<string>;
    };
  }
}

function enrichError(
  error: Partial<GraphQLError>,
  includeStackTracesInErrorResponses: boolean = false,
) {
  // follows similar structure to https://github.com/graphql/graphql-js/blob/main/src/error/GraphQLError.ts#L127-L176
  // with the addition of name
  const expanded = Object.create(Object.getPrototypeOf(error), {
    name: {
      value: error.name,
    },
    message: {
      value: error.message,
      enumerable: true,
      writable: true,
    },
    locations: {
      value: error.locations || undefined,
      enumerable: true,
    },
    path: {
      value: error.path || undefined,
      enumerable: true,
    },
    nodes: {
      value: error.nodes || undefined,
    },
    source: {
      value: error.source || undefined,
    },
    positions: {
      value: error.positions || undefined,
    },
    originalError: {
      value: error.originalError,
    },
  });

  const originalErrorExtensions =
    error.originalError instanceof GraphQLError ? {} : error.originalError;
  expanded.extensions = {
    ...error.extensions,
    code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
    exception: {
      ...error.extensions?.exception,
      ...originalErrorExtensions,
    },
  };

  // ensure that extensions is not taken from the originalError
  // graphql-js ensures that the originalError's extensions are hoisted
  // https://github.com/graphql/graphql-js/blob/0bb47b2/src/error/GraphQLError.js#L138
  delete expanded.extensions.exception.extensions;
  if (
    includeStackTracesInErrorResponses &&
    !expanded.extensions.exception.stacktrace
  ) {
    const stack = error.originalError?.stack || error.stack;
    expanded.extensions.exception.stacktrace = stack?.split('\n');
  }

  if (Object.keys(expanded.extensions.exception).length === 0) {
    // remove from printing an empty object
    delete expanded.extensions.exception;
  }

  return expanded as GraphQLError;
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
  errors: ReadonlyArray<Error>,
  options?: {
    formatError?: (error: GraphQLError) => GraphQLFormattedError;
    includeStackTracesInErrorResponses?: boolean;
  },
): Array<GraphQLFormattedError> {
  if (!options) {
    return errors.map((error) => enrichError(error));
  }
  const { formatError, includeStackTracesInErrorResponses } = options;

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

  const enrichedErrors = errors.map((error) =>
    enrichError(error, includeStackTracesInErrorResponses),
  );
  if (!formatError) {
    return enrichedErrors;
  }

  return enrichedErrors.map((error) => {
    try {
      return formatError(error);
    } catch (err) {
      if (includeStackTracesInErrorResponses) {
        // XXX: This cast is pretty sketchy, as other error types can be thrown!
        return enrichError(
          err as Partial<GraphQLError>,
          includeStackTracesInErrorResponses,
        );
      } else {
        // obscure error
        return new GraphQLError('Internal server error');
      }
    }
  });
}
