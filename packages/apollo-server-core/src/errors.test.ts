/* tslint:disable:no-unused-expression */
import { expect } from 'chai';
import { stub } from 'sinon';
import 'mocha';

import { GraphQLError } from 'graphql';

import {
  ApolloError,
  formatApolloErrors,
  AuthenticationError,
  ForbiddenError,
  ValidationError,
  UserInputError,
  SyntaxError,
} from 'apollo-server-errors';

describe('Errors', () => {
  describe('ApolloError', () => {
    const message = 'message';
    it('defaults code to INTERNAL_SERVER_ERROR', () => {
      const error = new ApolloError(message);
      expect(error.message).to.equal(message);
      expect(error.extensions.code).not.to.exist;
    });
    it('allows code setting and additional properties', () => {
      const code = 'CODE';
      const key = 'key';
      const error = new ApolloError(message, code, { key });
      expect(error.message).to.equal(message);
      expect(error.key).to.equal(key);
      expect(error.extensions.code).to.equal(code);
    });
  });

  describe('formatApolloErrors', () => {
    type CreateFormatError =
      | ((
          options: Record<string, any>,
          errors: Error[],
        ) => Record<string, any>[])
      | ((options?: Record<string, any>) => Record<string, any>);
    const message = 'message';
    const code = 'CODE';
    const key = 'key';

    const createFormattedError: CreateFormatError = (
      options?: Record<string, any>,
      errors?: Error[],
    ) => {
      if (errors === undefined) {
        const error = new ApolloError(message, code, { key });
        return formatApolloErrors(
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
        return formatApolloErrors(errors, options);
      }
    };

    it('exposes a stacktrace in debug mode', () => {
      const error = createFormattedError({ debug: true });
      expect(error.message).to.equal(message);
      expect(error.extensions.exception.key).to.equal(key);
      expect(error.extensions.code).to.equal(code);
      expect(
        error.extensions.exception.stacktrace,
        'stacktrace should exist under exception',
      ).to.exist;
    });
    it('hides stacktrace by default', () => {
      const thrown = new Error(message);
      (thrown as any).key = key;
      const error = formatApolloErrors([
        new GraphQLError(
          thrown.message,
          undefined,
          undefined,
          undefined,
          undefined,
          thrown,
        ),
      ])[0];
      expect(error.message).to.equal(message);
      expect(error.extensions.code).to.equal('INTERNAL_SERVER_ERROR');
      expect(error.extensions.exception.key).to.equal(key);
      expect(
        error.extensions.exception.stacktrace,
        'stacktrace should exist under exception',
      ).not.to.exist;
    });
    it('exposes fields on error under exception field and provides code', () => {
      const error = createFormattedError();
      expect(error.message).to.equal(message);
      expect(error.extensions.exception.key).to.equal(key);
      expect(error.extensions.code).to.equal(code);
      expect(
        error.extensions.exception.stacktrace,
        'stacktrace should exist under exception',
      ).not.to.exist;
    });
    it('calls formatter after exposing the code and stacktrace', () => {
      const error = new ApolloError(message, code, { key });
      const formatter = stub();
      formatApolloErrors([error], {
        formatter,
        debug: true,
      });
      expect(error.message).to.equal(message);
      expect(error.key).to.equal(key);
      expect(error.extensions.code).to.equal(code);
      expect(error instanceof ApolloError).true;
      expect(formatter.calledOnce);
    });
  });
  describe('Named Errors', () => {
    const message = 'message';
    function verifyError(
      error: ApolloError,
      {
        code,
        errorClass,
        name,
      }: { code: string; errorClass: any; name: string },
    ) {
      expect(error.message).to.equal(message);
      expect(error.extensions.code).to.equal(code);
      expect(error.name).equals(name);
      expect(error instanceof ApolloError).true;
      expect(error instanceof errorClass).true;
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
      verifyError(new SyntaxError(message), {
        code: 'GRAPHQL_PARSE_FAILED',
        errorClass: SyntaxError,
        name: 'SyntaxError',
      });
    });
    it('provides a validation error', () => {
      verifyError(new ValidationError(message), {
        code: 'GRAPHQL_VALIDATION_FAILED',
        errorClass: ValidationError,
        name: 'ValidationError',
      });
    });
    it('provides a user input error', () => {
      const error = new UserInputError(message, {
        field1: 'property1',
        field2: 'property2',
      });
      verifyError(error, {
        code: 'BAD_USER_INPUT',
        errorClass: UserInputError,
        name: 'UserInputError',
      });

      const formattedError = formatApolloErrors([
        new GraphQLError(
          error.message,
          undefined,
          undefined,
          undefined,
          undefined,
          error,
        ),
      ])[0];

      expect(formattedError.extensions.exception.field1).to.equal('property1');
      expect(formattedError.extensions.exception.field2).to.equal('property2');
    });
  });
});
