/* tslint:disable:no-unused-expression */
import MockReq = require('mock-req');

import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

import { runHttpQuery, HttpQueryError } from '../runHttpQuery';
import {
  AuthenticationError,
  ForbiddenError,
  ValidationError,
} from 'apollo-server-core';

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  fields: {
    testString: {
      type: GraphQLString,
      resolve() {
        return 'it works';
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: queryType,
});

describe('runHttpQuery', () => {
  describe('handling a GET query', () => {
    const mockQueryRequest = {
      method: 'GET',
      query: {
        query: '{ testString }',
      },
      options: {
        schema,
      },
      request: new MockReq(),
    };

    it('raises a 400 error if the query is missing', () => {
      const noQueryRequest = Object.assign({}, mockQueryRequest, {
        query: 'foo',
      });

      expect.assertions(2);
      return runHttpQuery([], noQueryRequest).catch((err: HttpQueryError) => {
        expect(err.statusCode).toEqual(400);
        expect(err.message).toEqual('Must provide query string.');
      });
    });
  });
  describe('error handling in context function', () => {
    const mockQueryRequest = {
      method: 'GET',
      query: {
        query: '{ testString }',
      },
      options: {
        schema,
      },
      request: new MockReq(),
    };

    it('raises a 401 error if an AuthenticationError is thrown', () => {
      const noQueryRequest = Object.assign({}, mockQueryRequest, {
        options: {
          ...mockQueryRequest.options,
          context: () => {
            throw new AuthenticationError('This is the error');
          },
        },
      });

      expect.assertions(2);
      return runHttpQuery([], noQueryRequest).catch((err: HttpQueryError) => {
        expect(err.statusCode).toEqual(401);
        expect(err.message.trim()).toEqual(
          '{"errors":[{"message":"Context creation failed: This is the error","extensions":{"code":"UNAUTHENTICATED"}}]}',
        );
      });
    });
    it('raises a 403 error if a ForbiddenError is thrown', () => {
      const noQueryRequest = Object.assign({}, mockQueryRequest, {
        options: {
          ...mockQueryRequest.options,
          context: () => {
            throw new ForbiddenError('This is the error');
          },
        },
      });

      expect.assertions(2);
      return runHttpQuery([], noQueryRequest).catch((err: HttpQueryError) => {
        expect(err.statusCode).toEqual(403);
        expect(err.message.trim()).toEqual(
          '{"errors":[{"message":"Context creation failed: This is the error","extensions":{"code":"FORBIDDEN"}}]}',
        );
      });
    });
    it('raises a 400 error if any other GraphQL error is thrown', () => {
      const noQueryRequest = Object.assign({}, mockQueryRequest, {
        options: {
          ...mockQueryRequest.options,
          context: () => {
            throw new ValidationError('This is the error');
          },
        },
      });

      expect.assertions(2);
      return runHttpQuery([], noQueryRequest).catch((err: HttpQueryError) => {
        expect(err.statusCode).toEqual(400);
        expect(err.message.trim()).toEqual(
          '{"errors":[{"message":"Context creation failed: This is the error","extensions":{"code":"GRAPHQL_VALIDATION_FAILED"}}]}',
        );
      });
    });
    it('raises a 500 error if any other error is thrown', () => {
      const noQueryRequest = Object.assign({}, mockQueryRequest, {
        options: {
          ...mockQueryRequest.options,
          context: () => {
            throw new Error('This is the error');
          },
        },
      });

      expect.assertions(2);
      return runHttpQuery([], noQueryRequest).catch((err: HttpQueryError) => {
        expect(err.statusCode).toEqual(500);
        expect(err.message.trim()).toEqual(
          '{"errors":[{"message":"Context creation failed: This is the error","extensions":{"code":"INTERNAL_SERVER_ERROR"}}]}',
        );
      });
    });
  });
});
