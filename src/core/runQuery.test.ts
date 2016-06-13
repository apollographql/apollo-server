import {
  expect,
} from 'chai';

// XXX can be removed after tests are actually writen
/* tslint:disable:no-unused-variable */
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

import { runQuery } from './runQuery';

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
// XXX can be removed after tests are actually writen
/* tslint:enable:no-unused-variable */

describe('runQuery', () => {
  it('returns a response', () => {
      // XXX can be removed after tests are actually writen
      // tslint:disable-next-line:no-unused-variable
      const query = `{ testString }`;
      const expected = { testString: 'it works' };
      return runQuery({ schema: Schema, query: query }).then((res) => {
          return expect(res.data).to.deep.equal(expected);
      });
  });
});
