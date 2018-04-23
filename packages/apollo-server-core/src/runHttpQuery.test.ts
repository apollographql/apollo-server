/* tslint:disable:no-unused-expression */
import { expect } from 'chai';
import { stub } from 'sinon';
import 'mocha';

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
} from 'graphql';

import { runHttpQuery, HttpQueryError } from './runHttpQuery';

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
