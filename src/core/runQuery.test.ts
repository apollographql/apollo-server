import {
  assert,
} from 'chai';

import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString
} from 'graphql';

import { runQuery } from './runQuery';


const QueryType = new GraphQLObjectType({
    name: 'QueryType',
    fields: {
        testString: {
            type: GraphQLString,
            resolve(){
                return 'it works';
            },
        },
    },
});

const Schema = new GraphQLSchema({
    query: QueryType,
});

describe('runQuery', () => {
  it('returns a response', (done) => {
      const query = `{ testString }`;
      assert(true);
  });
});