// The functions in this file are not part of Apollo Server's external API.

import {
  GraphQLError,
  GraphQLErrorExtensions,
  GraphQLFormattedError,
} from 'graphql';
import { ApolloServerErrorCode } from './errors/index.js';
import type { HTTPGraphQLHead } from './externalTypes/http.js';
import { mergeHTTPGraphQLHead, newHTTPGraphQLHead } from './runHttpQuery.js';
import { HeaderMap } from './utils/HeaderMap.js';

// This function accepts any value that were thrown and convert it to GraphQLFormattedError.
// It also add default extensions.code and copy stack trace onto an extension if requested.
// Additionally, it returns an `HTTPGraphQLHead` created from combining the values of any
// `HTTPGraphqlHead` objects found on `extensions.http` (the behavior when multiple errors
// set a status code or set the same header should be treated as undefined); these extensions
// are removed from the formatted error.
//
// This function should not throw.
export function normalizeAndFormatErrors(
  errors: ReadonlyArray<unknown>,
  options: {
    formatError?: (
      formattedError: GraphQLFormattedError,
      error: unknown,
    ) => GraphQLFormattedError;
    includeStacktraceInErrorResponses?: boolean;
  } = {},
): {
  formattedErrors: Array<GraphQLFormattedError>;
  httpFromErrors: HTTPGraphQLHead;
} {
  const formatError = options.formatError ?? ((error) => error);
  const httpFromErrors = newHTTPGraphQLHead();

  return {
    httpFromErrors,
    formattedErrors: errors.map((error) => {
      try {
        return formatError(enrichError(error), error);
      } catch (formattingError) {
        if (options.includeStacktraceInErrorResponses) {
          // includeStacktraceInErrorResponses is used in development
          // so it will be helpful to show errors thrown by formatError hooks in that mode
          return enrichError(formattingError);
        } else {
          // obscure error
          return {
            message: 'Internal server error',
            extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
          };
        }
      }
    }),
  };

  function enrichError(maybeError: unknown): GraphQLFormattedError {
    const graphqlError = ensureGraphQLError(maybeError);

    const extensions: GraphQLErrorExtensions = {
      ...graphqlError.extensions,
      code:
        graphqlError.extensions.code ??
        ApolloServerErrorCode.INTERNAL_SERVER_ERROR,
    };

    if (isPartialHTTPGraphQLHead(extensions.http)) {
      mergeHTTPGraphQLHead(httpFromErrors, {
        headers: new HeaderMap(),
        ...extensions.http,
      });
      delete extensions.http;
    }

    if (options.includeStacktraceInErrorResponses) {
      // Note that if ensureGraphQLError created graphqlError from an
      // originalError, graphqlError.stack will be the same as
      // originalError.stack due to some special code in the GraphQLError
      // constructor.
      extensions.stacktrace = graphqlError.stack?.split('\n');
    }

    return { ...graphqlError.toJSON(), extensions };
  }
}

export function ensureError(maybeError: unknown): Error {
  return maybeError instanceof Error
    ? maybeError
    : new GraphQLError('Unexpected error value: ' + String(maybeError));
}

export function ensureGraphQLError(
  maybeError: unknown,
  messagePrefixIfNotGraphQLError: string = '',
): GraphQLError {
  const error: Error = ensureError(maybeError);

  return error instanceof GraphQLError
    ? error
    : new GraphQLError(messagePrefixIfNotGraphQLError + error.message, {
        originalError: error,
      });
}

function isPartialHTTPGraphQLHead(x: unknown): x is Partial<HTTPGraphQLHead> {
  return (
    !!x &&
    typeof x === 'object' &&
    (!('status' in x) || typeof (x as any).status === 'number') &&
    (!('headers' in x) || (x as any).headers instanceof Map)
  );
}
