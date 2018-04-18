import { GraphQLError } from 'graphql';
export interface IApolloError {}

export class ApolloError extends Error {
  public extensions;
  constructor(message: string, code: string, properties?: Record<string, any>) {
    super(message);
    this.extensions = { ...properties, code };
  }
}

export function formatError(error: GraphQLError, debug: boolean = false) {
  const expanded: GraphQLError = {
    ...error,
    extensions: {
      ...error.extensions,
      code:
        (error.extensions && error.extensions.code) || 'INTERNAL_SERVER_ERROR',
      exception: {
        ...(error.extensions && error.extensions.exception),
        ...(error.originalError as any),
      },
    },
  };

  //ensure that extensions is not taken from the originalError
  //graphql-js ensures that the originalError's extensions are hoisted
  //https://github.com/graphql/graphql-js/blob/0bb47b2/src/error/GraphQLError.js#L138
  delete expanded.extensions.exception.extensions;
  if (debug && !expanded.extensions.exception.stacktrace) {
    expanded.extensions.exception.stacktrace =
      (error.originalError &&
        error.originalError.stack &&
        error.originalError.stack.split('\n')) ||
      (error.stack && error.stack.split('\n'));
  }

  if (Object.keys(expanded.extensions.exception).length === 0) {
    //remove from printing an empty object
    delete expanded.extensions.exception;
  }

  return expanded;
}

export function toApolloError(
  error: Error,
  code: string = 'INTERNAL_SERVER_ERROR',
): Error & { extensions: Record<string, any> } {
  let err: GraphQLError = error;
  if (err.extensions) {
    err.extensions.code = code;
  } else {
    err.extensions = { code };
  }
  return err as Error & { extensions: Record<string, any> };
}

export function fromGraphQLError(
  error: GraphQLError,
  code: string = 'INTERNAL_SERVER_ERROR',
) {
  const copy: GraphQLError = {
    ...error,
  };
  copy.extensions = {
    ...copy.extensions,
    code,
  };

  //copy the original error, while keeping all values non-enumerable, so they
  //are not printed unless directly referenced
  Object.defineProperty(copy, 'originalError', { value: {} });
  Reflect.ownKeys(error).forEach(key => {
    Object.defineProperty(copy.originalError, key, { value: error[key] });
  });

  return copy;
}

export class ParseError extends ApolloError {
  name = 'MalformedQueryError';
  constructor(message: string) {
    super(message, 'MALFORMED_QUERY');
  }
}

export class ValidationError extends ApolloError {
  name = 'ValidationError';
  constructor(message: string) {
    super(message, 'QUERY_VALIDATION_FAILED');
  }
}

export class AuthenticationError extends ApolloError {
  name = 'UnauthorizedError';
  constructor(message: string) {
    super(message, 'UNAUTHORIZED');
  }
}
