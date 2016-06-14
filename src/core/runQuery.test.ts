import {
  expect,
} from 'chai';

import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLNonNull,
    parse,
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

describe('runQuery', () => {
  it('returns the right result when query is a string', () => {
      const query = `{ testString }`;
      const expected = { testString: 'it works' };
      return runQuery({ schema: Schema, query: query })
      .then((res) => {
          return expect(res.data).to.deep.equal(expected);
      });
  });

  it('returns the right result when query is a document', () => {
      const query = parse(`{ testString }`);
      const expected = { testString: 'it works' };
      return runQuery({ schema: Schema, query: query })
      .then((res) => {
          return expect(res.data).to.deep.equal(expected);
      });
  });

    it('returns a syntax error if the query string contains one', () => {
      const query = `query { test`;
      const expected = 'Syntax Error GraphQL (1:13) Expected Name, found EOF\n\n1: query { test\n               ^\n';
      return runQuery({
          schema: Schema,
          query: query,
          variables: { base: 1 },
      }).then((res) => {
          expect(res.data).to.be.undefined;
          expect(res.errors.length).to.equal(1);
          return expect(res.errors[0].message).to.deep.equal(expected);
      });
  });

  it('returns a validation error if the query string does not pass validation', () => {
      const query = `query TestVar($base: String){ testArgumentValue(base: $base) }`;
      const expected = 'Variable "$base" of type "String" used in position expecting type "Int!".';
      return runQuery({
          schema: Schema,
          query: query,
          variables: { base: 1 },
      }).then((res) => {
          expect(res.data).to.be.undefined;
          expect(res.errors.length).to.equal(1);
          return expect(res.errors[0].message).to.deep.equal(expected);
      });
  });

  it('does not run validation if the query is a document', () => {
      // this would not pass validation, because $base ought to be Int!, not String
      // what effecively happens is string concatentation, but it's returned as Int
      const query = parse(`query TestVar($base: String){ testArgumentValue(base: $base) }`);
      const expected = { testArgumentValue: 15 };
      return runQuery({
          schema: Schema,
          query: query,
          variables: { base: 1 },
      }).then((res) => {
          return expect(res.data).to.deep.equal(expected);
      });
  });

  it('correctly passes in the rootValue', () => {
      const query = `{ testRootValue }`;
      const expected = { testRootValue: 'it also works' };
      return runQuery({ schema: Schema, query: query, rootValue: 'it also' })
      .then((res) => {
          return expect(res.data).to.deep.equal(expected);
      });
  });

  it('correctly passes in the context', () => {
      const query = `{ testContextValue }`;
      const expected = { testContextValue: 'it still works' };
      return runQuery({ schema: Schema, query: query, context: 'it still' })
      .then((res) => {
          return expect(res.data).to.deep.equal(expected);
      });
  });

  it('correctly passes in variables (and arguments)', () => {
      // XXX can be removed after tests are actually writen
      const query = `query TestVar($base: Int!){ testArgumentValue(base: $base) }`;
      const expected = { testArgumentValue: 6 };
      return runQuery({
          schema: Schema,
          query: query,
          variables: { base: 1 },
      }).then((res) => {
          return expect(res.data).to.deep.equal(expected);
      });
  });

    it('runs the correct operation when operationName is specified', () => {
      const query = `
        query Q1 {
            testString
        }
        query Q2 {
            testRootValue
        }`;
      const expected = {
          testString: 'it works',
        };
      return runQuery({ schema: Schema, query: query, operationName: 'Q1' })
      .then((res) => {
          return expect(res.data).to.deep.equal(expected);
      });
  });
});
