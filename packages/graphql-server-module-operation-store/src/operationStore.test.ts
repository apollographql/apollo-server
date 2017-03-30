import 'mocha';

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
    parse,
} from 'graphql';

import { OperationStore } from './operationStore';

const queryType = new GraphQLObjectType({
    name: 'QueryType',
    fields: {
        testString: {
            type: GraphQLString,
            /*resolve() {
                return 'it works';
            },*/
        },
        testRootValue: {
            type: GraphQLString,
            /*resolve(root) {
                return root + ' works';
            },*/
        },
        testContextValue: {
            type: GraphQLString,
            /*resolve(root, args, context) {
                return context + ' works';
            },*/
        },
        testArgumentValue: {
            type: GraphQLInt,
            /*resolve(root, args, context) {
                return args['base'] + 5;
            },*/
            args: {
                base: { type: new GraphQLNonNull(GraphQLInt) },
            },
        },
    },
});

const schema = new GraphQLSchema({
    query: queryType,
});

describe('operationStore', () => {
  it('can store a query and return its ast', () => {
      const query = `query testquery{ testString }`;
      const expected = `query testquery {\n  testString\n}\n`;

      const store = new OperationStore(schema);
      store.put(query);

      return expect(print(store.get('testquery'))).to.deep.equal(expected);
  });

  it('can store a Document and return its ast', () => {
      const query = `query testquery{ testString }`;
      const expected = `query testquery {\n  testString\n}\n`;

      const store = new OperationStore(schema);
      store.put(parse(query));

      return expect(print(store.get('testquery'))).to.deep.equal(expected);
  });

  it('can store queries and return them with getMap', () => {
      const query = `query testquery{ testString }`;
      const query2 = `query testquery2{ testRootValue }`;

      const store = new OperationStore(schema);
      store.put(query);
      store.put(query2);
      return expect(store.getMap().size).to.equal(2);
  });

  it('throws a parse error if the query is invalid', () => {
      const query = `query testquery{ testString`;

      const store = new OperationStore(schema);
      return expect(() => store.put(query)).to.throw(/Syntax Error GraphQL/);
  });

  it('throws a validation error if the query is invalid', () => {
      const query = `query testquery { testStrin }`;

      const store = new OperationStore(schema);
      return expect(() => store.put(query)).to.throw(/Cannot query field/);
  });

  it('throws an error if there is more than one query or mutation', () => {
      const query = `
        query Q1{ testString }
        query Q2{ t2: testString }
      `;

      const store = new OperationStore(schema);
      return expect(() => store.put(query)).to.throw(/OperationDefinitionNode must contain only one definition/);
  });

  it('throws an error if there is no operationDefinition found', () => {
      const query = `
        schema {
            query: Q
        }
      `;

      const store = new OperationStore(schema);

      return expect(() => store.put(query)).to.throw(/must contain at least/);
  });

  it('can delete stored operations', () => {
      const query = `query testquery{ testString }`;

      const store = new OperationStore(schema);
      store.put(query);
      store.delete('testquery');

      return expect(store.get('testquery')).to.be.undefined;
  });
});
