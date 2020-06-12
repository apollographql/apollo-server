import MockReq = require('mock-req');

import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

import {
  runHttpQuery,
  HttpQueryError,
  throwHttpGraphQLError,
} from '../runHttpQuery';
import {
  PersistedQueryNotFoundError,
  PersistedQueryNotSupportedError,
  ForbiddenError,
} from 'apollo-server-errors';

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

  describe('throwHttpGraphQLError', () => {
    it('should add no-cache headers if error is of type PersistedQueryNotSupportedError', () => {
      try {
        throwHttpGraphQLError(200, [new PersistedQueryNotSupportedError()]);
      } catch (err) {
        expect(err.headers).toEqual({
          'Content-Type': 'application/json',
          'Cache-Control': 'private, no-cache, must-revalidate',
        });
      }
    });

    it('should add no-cache headers if error is of type PersistedQueryNotFoundError', () => {
      try {
        throwHttpGraphQLError(200, [new PersistedQueryNotFoundError()]);
      } catch (err) {
        expect(err.headers).toEqual({
          'Content-Type': 'application/json',
          'Cache-Control': 'private, no-cache, must-revalidate',
        });
      }
    });

    it('should not add no-cache headers if error is not a PersistedQuery error', () => {
      try {
        throwHttpGraphQLError(200, [new ForbiddenError('401')]);
      } catch (err) {
        expect(err.headers).toEqual({ 'Content-Type': 'application/json' });
      }
    });
  });
});
