import {
  assert,
  expect,
} from 'chai';

import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

// TODO use import, not require... help appreciated.
import * as express from 'express';
import request from 'supertest-as-promised';

import { graphqlHTTP, ExpressApolloOptions, renderGraphiQL } from './expressApollo';

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
    it('throws error if called without schema', () => {
       expect(() => graphqlHTTP(undefined as ExpressApolloOptions)).to.throw('Apollo graphqlHTTP middleware requires options.');
    });


    it('can serve a basic request', () => {
        const app = express();
        app.use('/graphql', graphqlHTTP({ schema: Schema }));
        const expected = {
            testString: 'it works',
        };
        return request(app).get(
            '/graphql?query={ testString }'
        )
        .expect(200)
        .then((res) => {
            return expect(res.body.data).to.deep.equal(expected);
        });
    });
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
