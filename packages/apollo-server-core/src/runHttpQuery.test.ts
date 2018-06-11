/* tslint:disable:no-unused-expression */
import { expect } from 'chai';
import 'mocha';
import MockReq from 'mock-req';

import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

import { runHttpQuery } from './runHttpQuery';

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
      return runHttpQuery([], noQueryRequest).catch(err => {
        expect(err.statusCode).to.equal(400);
        expect(err.message).to.equal('Must provide query string.');
      });
    });
  });
});
