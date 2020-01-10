import MockReq = require('mock-req');

import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

import {
  runHttpQuery,
  HttpQueryError,
  throwHttpGraphQLError,
  processHTTPRequest,
  HttpQueryRequest
} from '../runHttpQuery';
import {
  PersistedQueryNotFoundError,
  PersistedQueryNotSupportedError,
  ForbiddenError,
} from 'apollo-server-errors';
import { Headers } from 'apollo-server-env';
import { KeyValueCache } from 'apollo-server-caching';

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

    it('should not add no-cache headers if error is not a PersitedQuery error', () => {
      try {
        throwHttpGraphQLError(200, [new ForbiddenError('401')]);
      } catch (err) {
        expect(err.headers).toEqual({ 'Content-Type': 'application/json' });
      }
    });
  });
});

describe('processHTTPRequest', () => {
  const schema = new GraphQLObjectType({
    name: 'QueryType',
    fields: {
      testString: {
        type: GraphQLString,
        resolve() {
          return 'it works';
        },
      }
    }
  });

  const parsingDidStart = jest.fn();
  const validationDidStart = jest.fn();
  const didResolveOperation = jest.fn();
  const executionDidStart = jest.fn();
  const didEncounterErrors = jest.fn();
  const willSendResponse = jest.fn();

  const options = {
    schema: new GraphQLSchema({query: schema}),
    cache: <KeyValueCache>{},
    plugins: [
      {
        requestDidStart() {
          return { parsingDidStart, validationDidStart, didResolveOperation,
                   executionDidStart, didEncounterErrors, willSendResponse};
        }
      },
    ],
    context: {}
  };

  describe('handling an HTTP request', () => {
    it('provides the parent HTTP object to the plugin context', (done) => {
      const httpRequest: HttpQueryRequest = {
        method: "POST",
        query: {
          testField: true,
          query: "{ testString }"
        },
        options: {
          schema: new GraphQLSchema({
            query: schema
          })
        },
        request: {
          url: "test",
          method: "POST",
          headers: new Headers(),
        }
      };

      return processHTTPRequest(options, httpRequest).then(() => {

        expect(parsingDidStart.mock.calls.length).toBe(1);
        expect(parsingDidStart.mock.calls[0].length).toBeGreaterThan(0);
        expect(parsingDidStart.mock.calls[0][0]).toBeDefined();
        expect(parsingDidStart.mock.calls[0][0].parent).toEqual(httpRequest);

        expect(validationDidStart.mock.calls.length).toBe(1);
        expect(validationDidStart.mock.calls[0].length).toBeGreaterThan(0);
        expect(validationDidStart.mock.calls[0][0]).toBeDefined();
        expect(validationDidStart.mock.calls[0][0].parent).toEqual(httpRequest);

        expect(didResolveOperation.mock.calls.length).toBe(1);
        expect(didResolveOperation.mock.calls[0].length).toBeGreaterThan(0);
        expect(didResolveOperation.mock.calls[0][0]).toBeDefined();
        expect(didResolveOperation.mock.calls[0][0].parent).toEqual(httpRequest);

        expect(executionDidStart.mock.calls.length).toBe(1);
        expect(executionDidStart.mock.calls[0].length).toBeGreaterThan(0);
        expect(executionDidStart.mock.calls[0][0]).toBeDefined();
        expect(executionDidStart.mock.calls[0][0].parent).toEqual(httpRequest);

        expect(didEncounterErrors.mock.calls.length).toBe(0);

        expect(willSendResponse.mock.calls.length).toBe(1);
        expect(willSendResponse.mock.calls[0].length).toBeGreaterThan(0);
        expect(willSendResponse.mock.calls[0][0]).toBeDefined();
        expect(willSendResponse.mock.calls[0][0].parent).toEqual(httpRequest);
        done();
      });
    });

  });
});
