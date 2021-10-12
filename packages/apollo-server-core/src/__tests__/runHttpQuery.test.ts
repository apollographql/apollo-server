import MockReq = require('mock-req');

import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

import { runHttpQuery, HttpQueryError } from '../runHttpQuery';
import type { SchemaHash } from 'apollo-server-types';

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
        debug: false,
        schema,
        schemaHash: 'deprecated' as SchemaHash,
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
        expect(err.message).toEqual(
          JSON.stringify({
            errors: [
              {
                message:
                  'GraphQL operations must contain a non-empty `query` or a `persistedQuery` extension.',
                extensions: { code: 'INTERNAL_SERVER_ERROR' },
              },
            ],
          }) + '\n',
        );
      });
    });
  });

  describe('when allowBatchedHttpRequests is false', () => {
    const mockDisabledBatchQueryRequest = {
      method: 'GET',
      query: {
        query: '{ testString }',
      },
      options: {
        debug: false,
        schema,
        schemaHash: 'deprecated' as SchemaHash,
        allowBatchedHttpRequests: false,
      },
      request: new MockReq(),
    };

    it('succeeds when there are no batched queries in the request', async () => {
      await expect(
        runHttpQuery([], mockDisabledBatchQueryRequest),
      ).resolves.not.toThrow();
    });

    it('throws when there are batched queries in the request', () => {
      const batchedQueryRequest = Object.assign(
        {},
        mockDisabledBatchQueryRequest,
        {
          query: [
            {
              query: '{ testString }',
            },
            {
              query: '{ testString }',
            },
          ],
        },
      );
      return runHttpQuery([], batchedQueryRequest).catch(
        (err: HttpQueryError) => {
          expect(err.statusCode).toEqual(400);
          expect(err.message).toEqual(
            JSON.stringify({
              errors: [
                {
                  message: 'Operation batching disabled.',
                  extensions: { code: 'INTERNAL_SERVER_ERROR' },
                },
              ],
            }) + '\n',
          );
        },
      );
    });
  });

  describe('when allowBatchedHttpRequests is true', () => {
    const mockEnabledBatchQueryRequest = {
      method: 'GET',
      query: {
        query: '{ testString }',
      },
      options: {
        debug: false,
        schema,
        schemaHash: 'deprecated' as SchemaHash,
        allowBatchedHttpRequests: true,
      },
      request: new MockReq(),
    };

    it('succeeds when there are multiple queries in the request', async () => {
      const multipleQueryRequest = Object.assign(
        {},
        mockEnabledBatchQueryRequest,
        {
          query: [
            {
              query: '{ testString }',
            },
            {
              query: '{ testString }',
            },
          ],
        },
      );

      await expect(
        runHttpQuery([], multipleQueryRequest),
      ).resolves.not.toThrow();
    });
  });
});
