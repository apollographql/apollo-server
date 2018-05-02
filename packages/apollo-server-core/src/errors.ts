import { GraphQLError } from 'graphql';
import { LogStep, LogAction, LogMessage, LogFunction } from './logging';

export class ApolloError extends Error {
  public extensions;
  constructor(
    message: string,
    code?: string,
    properties?: Record<string, any>,
  ) {
    super(message);
    this.extensions = { ...properties, code };
  }
}

export function enrichError(error: GraphQLError, debug: boolean = false) {
  const expanded: GraphQLError = {
    message: error.message,
    path: error.path,
    locations: error.locations,
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

export interface ErrorOptions {
  code?: string;
  errorClass?: typeof ApolloError;
}

export function fromGraphQLError(error: GraphQLError, options?: ErrorOptions) {
  const copy: GraphQLError =
    options && options.errorClass
      ? new options.errorClass(error.message)
      : new ApolloError(error.message);

  //copy enumerable keys
  Object.keys(error).forEach(key => {
    copy[key] = error[key];
  });

  //extensions are non enumerable, so copy them directly
  copy.extensions = {
    ...copy.extensions,
    ...error.extensions,
  };

  //Fallback on default for code
  if (!copy.extensions.code) {
    copy.extensions.code = (options && options.code) || 'INTERNAL_SERVER_ERROR';
  }

  //copy the original error, while keeping all values non-enumerable, so they
  //are not printed unless directly referenced
  Object.defineProperty(copy, 'originalError', { value: {} });
  Reflect.ownKeys(error).forEach(key => {
    Object.defineProperty(copy.originalError, key, { value: error[key] });
  });

  return copy;
}

export class SyntaxError extends ApolloError {
  // TODO make the name nonenumerable
  // name = 'SyntaxError';
  constructor(message: string) {
    super(message, 'GRAPHQL_PARSE_FAILED');
  }
}

export class ValidationError extends ApolloError {
  // TODO make the name nonenumerable
  // name = 'ValidationError';
  constructor(message: string) {
    super(message, 'GRAPHQL_VALIDATION_FAILED');
  }
}

export class AuthenticationError extends ApolloError {
  // TODO make the name nonenumerable
  // name = 'AuthenticationError';
  constructor(message: string) {
    super(message, 'UNAUTHENTICATED');
  }
}

export class ForbiddenError extends ApolloError {
  // TODO make the name nonenumerable
  // name = 'ForbiddenError';
  constructor(message: string) {
    super(message, 'FORBIDDEN');
  }
}

export function formatApolloErrors(
  errors: Array<Error>,
  options?: {
    formatter?: Function;
    logFunction?: LogFunction;
    debug?: boolean;
  },
): Array<Error> {
  const { formatter, debug, logFunction } = options;
  return errors.map(error => enrichError(error, debug)).map(error => {
    if (formatter !== undefined) {
      try {
        return formatter(error);
      } catch (err) {
        logFunction({
          action: LogAction.cleanup,
          step: LogStep.status,
          data: err,
          key: 'error',
        });

        if (debug) {
          return enrichError(err, debug);
        } else {
          //obscure error
          const newError: GraphQLError = fromGraphQLError(
            new GraphQLError('Internal server error'),
          );
          return enrichError(newError, debug);
        }
      }
    } else {
      return error;
    }
  }) as Array<Error>;
}
