import MockReq = require('mock-req');

import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

import { runHttpQuery, HttpQueryError } from '../runHttpQuery';
import { generateSchemaHash } from '../utils/schemaHash';

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
        schemaHash: generateSchemaHash(schema),
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
});
