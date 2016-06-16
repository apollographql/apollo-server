import {
  assert,
} from 'chai';

import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

import { graphqlHTTP, renderGraphiQL } from './expressApollo';

const QueryType = new GraphQLObjectType({
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

const Schema = new GraphQLSchema({
    query: QueryType,
});

describe('expressApollo', () => {
  describe('graphqlHTTP', () => {
    it('returns express middleware', () => {
        const middleware = graphqlHTTP({
            schema: Schema,
        });
        assert(typeof middleware === 'function');
    });
    // it('throws error if called without schema', () => {
       // XXX there's no way to test this in Typescript, right?
       // but we need to test this for JavaScript users,
       // so maybe we should write all tests in JavaScript?
       // is that possible?
    // });
  });

  describe('renderGraphiQL', () => {
    it('returns express middleware', () => {
        const query = `{ testString }`;
        const middleware = renderGraphiQL({
            query: query,
        });
        assert(typeof middleware === 'function');
    });
  });
});
