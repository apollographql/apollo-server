import {
  assert,
} from 'chai';

// XXX can be removed after tests are actually writen
/* tslint:disable:no-unused-variable */
import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
} from 'graphql';

import expressApollo from './expressApollo';

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

describe('expressApollo', () => {
  it('returns express middleware', () => {
      // XXX can be removed after tests are actually writen
      // tslint:disable-next-line:no-unused-variable
      const query = `{ testString }`;
      const middleware = expressApollo({
        schema: Schema,
      });
      assert(typeof middleware === 'function');
  });
});
