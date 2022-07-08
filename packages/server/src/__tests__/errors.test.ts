import { GraphQLError } from 'graphql';

import {
  AuthenticationError,
  ForbiddenError,
  ValidationError,
  UserInputError,
  SyntaxError,
} from '..';
import { normalizeAndFormatErrors } from '../errors.js';

describe('Errors', () => {
  describe('normalizeAndFormatErrors', () => {
    type CreateFormatError =
      | ((
          options: Record<string, any>,
          errors: Error[],
        ) => Record<string, any>[])
      | ((options?: Record<string, any>) => Record<string, any>);
    const message = 'message';
    const code = 'CODE';
    const key = 'value';

    const createFormattedError: CreateFormatError = (
      options?: Record<string, any>,
      errors?: Error[],
    ) => {
      if (errors === undefined) {
        const error = new GraphQLError(message, {
          extensions: { code, key },
        });
        return normalizeAndFormatErrors(
          [
            new GraphQLError(
              error.message,
              undefined,
              undefined,
              undefined,
              undefined,
              error,
            ),
          ],
          options,
        )[0];
      } else {
        return normalizeAndFormatErrors(errors, options);
      }
    };

    it('exposes a stacktrace in debug mode', () => {
      const error = createFormattedError({
        includeStackTracesInErrorResponses: true,
      });
      expect(error.message).toEqual(message);
      expect(error.extensions.key).toEqual(key);
      expect(error.extensions.exception.key).toBeUndefined();
      expect(error.extensions.code).toEqual(code);
      // stacktrace should exist under exception
      expect(error.extensions.exception.stacktrace).toBeDefined();
    });
    it('hides stacktrace by default', () => {
      const thrown = new Error(message);
      (thrown as any).key = key;
      const error = normalizeAndFormatErrors([
        new GraphQLError(
          thrown.message,
          undefined,
          undefined,
          undefined,
          undefined,
          thrown,
        ),
      ])[0];
      expect(error.message).toEqual(message);
      expect(error.extensions?.code).toEqual('INTERNAL_SERVER_ERROR');
      expect(error.extensions?.exception).toHaveProperty('key', key);
      // stacktrace should exist under exception
      expect(error.extensions?.exception).not.toHaveProperty('stacktrace');
    });
    it('exposes fields on error under exception field and provides code', () => {
      const error = createFormattedError();
      expect(error.message).toEqual(message);
      expect(error.extensions.key).toEqual(key);
      expect(error.extensions.exception).toBeUndefined();
      expect(error.extensions.code).toEqual(code);
    });
    it('calls formatError after exposing the code and stacktrace', () => {
      const error = new GraphQLError(message, {
        extensions: { code, key },
      });
      const formatError = jest.fn();
      normalizeAndFormatErrors([error], {
        formatError,
        includeStackTracesInErrorResponses: true,
      });

      expect(formatError).toHaveBeenCalledTimes(1);

      const formatErrorArgs = formatError.mock.calls[0];
      expect(formatErrorArgs[0].message).toEqual(message);
      expect(formatErrorArgs[0].extensions.key).toEqual(key);
      expect(formatErrorArgs[0].extensions.code).toEqual(code);
      expect(formatErrorArgs[1]).toEqual(error);
    });
    it('Formats native Errors in a JSON-compatible way', () => {
      const error = new Error('Hello');
      const [formattedError] = normalizeAndFormatErrors([error]);
      expect(JSON.parse(JSON.stringify(formattedError)).message).toBe('Hello');
    });
  });
  describe('Named Errors', () => {
    const message = 'message';
    function verifyError(
      error: GraphQLError,
      {
        code,
        errorClass,
        name,
      }: { code: string; errorClass: any; name: string },
    ) {
      expect(error.message).toEqual(message);
      expect(error.extensions.code).toEqual(code);
      expect(error.name).toEqual(name);
      expect(error instanceof GraphQLError).toBe(true);
      expect(error instanceof errorClass).toBe(true);
    }

    it('provides an authentication error', () => {
      verifyError(new AuthenticationError(message), {
        code: 'UNAUTHENTICATED',
        errorClass: AuthenticationError,
        name: 'AuthenticationError',
      });
    });
    it('provides a forbidden error', () => {
      verifyError(new ForbiddenError(message), {
        code: 'FORBIDDEN',
        errorClass: ForbiddenError,
        name: 'ForbiddenError',
      });
    });
    it('provides a syntax error', () => {
      verifyError(new SyntaxError(new GraphQLError(message)), {
        code: 'GRAPHQL_PARSE_FAILED',
        errorClass: SyntaxError,
        name: 'SyntaxError',
      });
    });
    it('provides a validation error', () => {
      verifyError(new ValidationError(new GraphQLError(message)), {
        code: 'GRAPHQL_VALIDATION_FAILED',
        errorClass: ValidationError,
        name: 'ValidationError',
      });
    });
    it('provides a user input error', () => {
      const error = new UserInputError(message, {
        extensions: {
          field1: 'property1',
          field2: 'property2',
        },
      });
      verifyError(error, {
        code: 'BAD_USER_INPUT',
        errorClass: UserInputError,
        name: 'UserInputError',
      });

      const formattedError = normalizeAndFormatErrors([
        new GraphQLError(
          error.message,
          undefined,
          undefined,
          undefined,
          undefined,
          error,
        ),
      ])[0];

      expect(formattedError.extensions?.field1).toEqual('property1');
      expect(formattedError.extensions?.field2).toEqual('property2');
      expect(formattedError.extensions?.exception).toBeUndefined();
    });
  });
});
