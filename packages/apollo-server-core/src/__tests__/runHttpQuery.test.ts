/* tslint:disable:no-unused-expression */
import MockReq = require('mock-req');

import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import { FormatErrorExtension } from '../formatters';

import {
  runHttpQuery,
  HttpQueryError,
  HttpQueryResponse,
  HttpQueryRequest,
} from '../runHttpQuery';

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  fields: {
    testString: {
      type: GraphQLString,
      resolve() {
        return 'it works';
      },
    },
    circularFailure: {
      type: GraphQLString,
      resolve() {
        // Errors that have circular references are surprisingly common. Many
        // HTTP client libraries throw errors that include circular references
        const error = new Error('Self referencing failure');
        (error as any).circle = error;
        throw error;
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

    it('handles errors with circular references gracefully', () => {
      const failingRequest: HttpQueryRequest = Object.assign(
        {},
        mockQueryRequest,
        {
          options: {
            schema,
            extensions: [() => new FormatErrorExtension(undefined, true)],
          },
          query: {
            query: '{circularFailure}',
          },
        },
      );

      return runHttpQuery([], failingRequest).then(
        (response: HttpQueryResponse) => {
          const parsed = JSON.parse(response.graphqlResponse);
          expect(parsed.errors).toHaveLength(1);
          expect(parsed.errors[0].message).toBe('Self referencing failure');
          expect(parsed.errors[0].path).toEqual(['circularFailure']);
        },
      );
    });
  });
});
