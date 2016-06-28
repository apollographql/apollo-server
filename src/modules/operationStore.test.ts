import {
  expect,
} from 'chai';

import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLNonNull,
    print,
} from 'graphql';

import { OperationStore } from './operationStore';

const QueryType = new GraphQLObjectType({
    name: 'QueryType',
    fields: {
        testString: {
            type: GraphQLString,
            resolve() {
                return 'it works';
            },
        },
        testRootValue: {
            type: GraphQLString,
            resolve(root) {
                return root + ' works';
            },
        },
        testContextValue: {
            type: GraphQLString,
            resolve(root, args, context) {
                return context + ' works';
            },
        },
        testArgumentValue: {
            type: GraphQLInt,
            resolve(root, args, context) {
                return args['base'] + 5;
            },
            args: {
                base: { type: new GraphQLNonNull(GraphQLInt) },
            },
        },
    },
});

const Schema = new GraphQLSchema({
    query: QueryType,
});

describe('operationStore', () => {
  it('can store a query and return its ast', () => {
      const query = `{ testString }`;
      const expected = `{\n  testString\n}\n`;

      const store = new OperationStore(Schema);
      store.put('testquery', query);

      return expect(print(store.get('testquery'))).to.deep.equal(expected);
  });

  it('throws a parse error if the query is invalid', () => {
      const query = `{ testString`;

      const store = new OperationStore(Schema);
      return expect(() => store.put('testquery', query)).to.throw(/found EOF/);
  });

  it('throws a validation error if the query is invalid', () => {
      const query = `{ testStrin }`;

      const store = new OperationStore(Schema);
      return expect(() => store.put('testquery', query)).to.throw(/Cannot query field/);
  });

  it('throws an error if there is more than one query or mutation', () => {
      const query = `
        query Q1{ testString }
        query Q2{ t2: testString }
      `;

      const store = new OperationStore(Schema);
      return expect(() => store.put('testquery', query)).to.throw(/operationDefinition must contain only one definition/);
  });

  it('throws an error if there is no operationDefinition found', () => {
      const query = `
        type Q {
            f1: Int
        }

        schema {
            query: Q
        }
      `;

      const store = new OperationStore(Schema);

      return expect(() => store.put('testquery', query)).to.throw(/must contain an OperationDefintion/);
  });

  it('can delete stored operations', () => {
      const query = `{ testString }`;

      const store = new OperationStore(Schema);
      store.put('testquery', query);
      store.delete('testquery');

      return expect(store.get('testquery')).to.be.undefined;
  });
});
