import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { unwrapResolverError } from '@apollo/server/errors';

import { normalizeAndFormatErrors } from '../errorNormalize.js';
import { jest, describe, it, expect } from '@jest/globals';

describe('Errors', () => {
  describe('normalizeAndFormatErrors', () => {
    const message = 'message';
    const code = 'CODE';
    const key = 'value';

    it('exposes a stacktrace in debug mode', () => {
      const thrown = new Error(message);
      (thrown as any).key = key;
      const [error] = normalizeAndFormatErrors(
        [
          new GraphQLError(thrown.message, {
            originalError: thrown,
            extensions: { code, key },
          }),
        ],
        { includeStacktraceInErrorResponses: true },
      ).formattedErrors;
      expect(error.message).toEqual(message);
      expect(error.extensions?.key).toEqual(key);
      expect(error.extensions).not.toHaveProperty('exception'); // Removed in AS4
      expect(error.extensions?.code).toEqual(code);
      // stacktrace should exist
      expect(error.extensions?.stacktrace).toBeDefined();
    });
    it('hides stacktrace by default', () => {
      const thrown = new Error(message);
      (thrown as any).key = key;
      const error = normalizeAndFormatErrors([
        new GraphQLError(thrown.message, { originalError: thrown }),
      ]).formattedErrors[0];
      expect(error.message).toEqual(message);
      expect(error.extensions?.code).toEqual('INTERNAL_SERVER_ERROR');
      expect(error.extensions).not.toHaveProperty('exception'); // Removed in AS4
      // stacktrace should not exist
      expect(error.extensions).not.toHaveProperty('stacktrace');
    });
    it('exposes extensions on error as extensions field and provides code', () => {
      const error = normalizeAndFormatErrors([
        new GraphQLError(message, {
          extensions: { code, key },
        }),
      ]).formattedErrors[0];
      expect(error.message).toEqual(message);
      expect(error.extensions?.key).toEqual(key);
      expect(error.extensions).not.toHaveProperty('exception'); // Removed in AS4
      expect(error.extensions?.code).toEqual(code);
    });
    it('calls formatError after exposing the code and stacktrace', () => {
      const error = new GraphQLError(message, {
        extensions: { code, key },
      });
      const formatError = jest.fn(
        (fErr: GraphQLFormattedError, _err: unknown) => fErr,
      );
      normalizeAndFormatErrors([error], {
        formatError,
        includeStacktraceInErrorResponses: true,
      });

      expect(formatError).toHaveBeenCalledTimes(1);

      const formatErrorArgs = formatError.mock.calls[0];
      expect(formatErrorArgs[0].message).toEqual(message);
      expect(formatErrorArgs[0].extensions?.key).toEqual(key);
      expect(formatErrorArgs[0].extensions?.code).toEqual(code);
      expect(formatErrorArgs[1]).toEqual(error);
    });
    it('Formats native Errors in a JSON-compatible way', () => {
      const error = new Error('Hello');
      const [formattedError] = normalizeAndFormatErrors([
        error,
      ]).formattedErrors;
      expect(JSON.parse(JSON.stringify(formattedError)).message).toBe('Hello');
    });

    describe('formatError can be used to provide AS3-compatible extensions', () => {
      function formatError(
        formattedError: GraphQLFormattedError,
        error: unknown,
      ) {
        const originalError = unwrapResolverError(error);
        const exception: Record<string, unknown> = {
          ...(typeof originalError === 'object' ? originalError : null),
        };
        delete exception.extensions;
        if (formattedError.extensions?.stacktrace) {
          exception.stacktrace = formattedError.extensions.stacktrace;
        }
        const extensions: Record<string, unknown> = {
          ...formattedError.extensions,
          exception,
        };
        delete extensions.stacktrace;

        return {
          ...formattedError,
          extensions,
        };
      }

      it('with stack trace', () => {
        const thrown = new Error(message);
        (thrown as any).key = key;
        const errors = normalizeAndFormatErrors([thrown], {
          formatError,
          includeStacktraceInErrorResponses: true,
        }).formattedErrors;
        expect(errors).toHaveLength(1);
        const [error] = errors;
        expect(error.extensions?.exception).toHaveProperty('stacktrace');
        delete (error as any).extensions.exception.stacktrace;
        expect(error).toMatchInlineSnapshot(`
          {
            "extensions": {
              "code": "INTERNAL_SERVER_ERROR",
              "exception": {
                "key": "value",
              },
            },
            "message": "message",
          }
        `);
      });

      it('without stack trace', () => {
        const thrown = new Error(message);
        (thrown as any).key = key;
        const errors = normalizeAndFormatErrors([thrown], {
          formatError,
          includeStacktraceInErrorResponses: false,
        }).formattedErrors;
        expect(errors).toHaveLength(1);
        const [error] = errors;
        expect(error).toMatchInlineSnapshot(`
          {
            "extensions": {
              "code": "INTERNAL_SERVER_ERROR",
              "exception": {
                "key": "value",
              },
            },
            "message": "message",
          }
        `);
      });
    });
  });
});
