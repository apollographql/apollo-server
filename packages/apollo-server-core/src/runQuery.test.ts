/* tslint:disable:no-unused-expression */
import { expect } from 'chai';
import { stub } from 'sinon';
import MockReq = require('mock-req');
import 'mocha';

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  parse,
} from 'graphql';

import { runQuery } from './runQuery';

// Make the global Promise constructor Fiber-aware to simulate a Meteor
// environment.
import { makeCompatible } from 'meteor-promise';
import Fiber = require('fibers');
import { GraphQLExtensionStack, GraphQLExtension } from 'graphql-extensions';
makeCompatible(Promise, Fiber);

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  fields: {
    testString: {
      type: GraphQLString,
      resolve() {
        return 'it works';
      },
    },
    testObject: {
      type: new GraphQLObjectType({
        name: 'TestObject',
        fields: {
          testString: {
            type: GraphQLString,
          },
        },
      }),
      resolve() {
        return {
          testString: 'a very test string',
        };
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
      resolve(_root, _args, context) {
        return context.s + ' works';
      },
    },
    testArgumentValue: {
      type: GraphQLInt,
      resolve(_root, args) {
        return args['base'] + 5;
      },
      args: {
        base: { type: new GraphQLNonNull(GraphQLInt) },
      },
    },
    testAwaitedValue: {
      type: GraphQLString,
      resolve() {
        // Calling Promise.await is legal here even though this is
        // not an async function, because we are guaranteed to be
        // running in a Fiber.
        return 'it ' + (<any>Promise).await('works');
      },
    },
    testError: {
      type: GraphQLString,
      resolve() {
        throw new Error('Secret error message');
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: queryType,
});

describe('runQuery', () => {
  it('returns the right result when query is a string', () => {
    const query = `{ testString }`;
    const expected = { testString: 'it works' };
    return runQuery({
      schema,
      queryString: query,
      request: new MockReq(),
    }).then(res => {
      expect(res.data).to.deep.equal(expected);
    });
  });

  it('returns the right result when query is a document', () => {
    const query = parse(`{ testString }`);
    const expected = { testString: 'it works' };
    return runQuery({
      schema,
      parsedQuery: query,
      request: new MockReq(),
    }).then(res => {
      expect(res.data).to.deep.equal(expected);
    });
  });

  it('returns a syntax error if the query string contains one', () => {
    const query = `query { test `;
    const expected = /Syntax Error/;
    return runQuery({
      schema,
      queryString: query,
      variables: { base: 1 },
      request: new MockReq(),
    }).then(res => {
      expect(res.data).to.be.undefined;
      expect(res.errors!.length).to.equal(1);
      expect(res.errors![0].message).to.match(expected);
    });
  });

  it('does not call console.error if in an error occurs and debug mode is set', () => {
    const query = `query { testError }`;
    const logStub = stub(console, 'error');
    return runQuery({
      schema,
      queryString: query,
      debug: true,
      request: new MockReq(),
    }).then(() => {
      logStub.restore();
      expect(logStub.callCount).to.equal(0);
    });
  });

  it('does not call console.error if in an error occurs and not in debug mode', () => {
    const query = `query { testError }`;
    const logStub = stub(console, 'error');
    return runQuery({
      schema,
      queryString: query,
      debug: false,
      request: new MockReq(),
    }).then(() => {
      logStub.restore();
      expect(logStub.callCount).to.equal(0);
    });
  });

  it('returns a validation error if the query string does not pass validation', () => {
    const query = `query TestVar($base: String){ testArgumentValue(base: $base) }`;
    const expected =
      'Variable "$base" of type "String" used in position expecting type "Int!".';
    return runQuery({
      schema,
      queryString: query,
      variables: { base: 1 },
      request: new MockReq(),
    }).then(res => {
      expect(res.data).to.be.undefined;
      expect(res.errors!.length).to.equal(1);
      expect(res.errors![0].message).to.deep.equal(expected);
    });
  });

  it('correctly passes in the rootValue', () => {
    const query = `{ testRootValue }`;
    const expected = { testRootValue: 'it also works' };
    return runQuery({
      schema,
      queryString: query,
      rootValue: 'it also',
      request: new MockReq(),
    }).then(res => {
      expect(res.data).to.deep.equal(expected);
    });
  });

  it('correctly passes in the context', () => {
    const query = `{ testContextValue }`;
    const expected = { testContextValue: 'it still works' };
    return runQuery({
      schema,
      queryString: query,
      context: { s: 'it still' },
      request: new MockReq(),
    }).then(res => {
      expect(res.data).to.deep.equal(expected);
    });
  });

  it('passes the options to formatResponse', () => {
    const query = `{ testContextValue }`;
    const expected = { testContextValue: 'it still works' };
    return runQuery({
      schema,
      queryString: query,
      context: { s: 'it still' },
      formatResponse: (response: any, { context }: { context: any }) => {
        response['extensions'] = context.s;
        return response;
      },
      request: new MockReq(),
    }).then(res => {
      expect(res.data).to.deep.equal(expected);
      expect(res['extensions']).to.equal('it still');
    });
  });

  it('correctly passes in variables (and arguments)', () => {
    const query = `query TestVar($base: Int!){ testArgumentValue(base: $base) }`;
    const expected = { testArgumentValue: 6 };
    return runQuery({
      schema,
      queryString: query,
      variables: { base: 1 },
      request: new MockReq(),
    }).then(res => {
      expect(res.data).to.deep.equal(expected);
    });
  });

  it('throws an error if there are missing variables', () => {
    const query = `query TestVar($base: Int!){ testArgumentValue(base: $base) }`;
    const expected =
      'Variable "$base" of required type "Int!" was not provided.';
    return runQuery({
      schema,
      queryString: query,
      request: new MockReq(),
    }).then(res => {
      expect(res.errors![0].message).to.deep.equal(expected);
    });
  });

  it('supports yielding resolver functions', () => {
    return runQuery({
      schema,
      queryString: `{ testAwaitedValue }`,
      request: new MockReq(),
    }).then(res => {
      expect(res.data).to.deep.equal({
        testAwaitedValue: 'it works',
      });
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
    return runQuery({
      schema,
      queryString: query,
      operationName: 'Q1',
      request: new MockReq(),
    }).then(res => {
      expect(res.data).to.deep.equal(expected);
    });
  });

  it('uses custom field resolver', async () => {
    const query = `
        query Q1 {
          testObject {
            testString
          }
        }
      `;

    const result1 = await runQuery({
      schema,
      queryString: query,
      operationName: 'Q1',
      request: new MockReq(),
    });

    expect(result1.data).to.deep.equal({
      testObject: {
        testString: 'a very test string',
      },
    });

    const result2 = await runQuery({
      schema,
      queryString: query,
      operationName: 'Q1',
      fieldResolver: () => 'a very testful field resolver string',
      request: new MockReq(),
    });

    expect(result2.data).to.deep.equal({
      testObject: {
        testString: 'a very testful field resolver string',
      },
    });
  });

  describe('graphql extensions', () => {
    class CustomExtension implements GraphQLExtension<any> {
      format(): [string, any] {
        return ['customExtension', { foo: 'bar' }];
      }
    }

    it('creates the extension stack', async () => {
      const queryString = `{ testString }`;
      const extensions = [() => new CustomExtension()];
      return runQuery({
        schema: new GraphQLSchema({
          query: new GraphQLObjectType({
            name: 'QueryType',
            fields: {
              testString: {
                type: GraphQLString,
                resolve(_root, _args, context) {
                  expect(context._extensionStack).to.be.instanceof(
                    GraphQLExtensionStack,
                  );
                  expect(
                    context._extensionStack.extensions[0],
                  ).to.be.instanceof(CustomExtension);
                },
              },
            },
          }),
        }),
        queryString,
        extensions,
        request: new MockReq(),
      });
    });

    it('runs format response from extensions', async () => {
      const queryString = `{ testString }`;
      const expected = { testString: 'it works' };
      const extensions = [() => new CustomExtension()];
      return runQuery({
        schema,
        queryString,
        extensions,
        request: new MockReq(),
      }).then(res => {
        expect(res.data).to.deep.equal(expected);
        expect(res.extensions).to.deep.equal({
          customExtension: { foo: 'bar' },
        });
      });
    });
  });

  describe('async_hooks', () => {
    let asyncHooks: typeof import('async_hooks');
    let asyncHook: import('async_hooks').AsyncHook;
    const ids: number[] = [];

    try {
      asyncHooks = require('async_hooks');
    } catch (err) {
      return; // async_hooks not present, give up
    }

    before(() => {
      asyncHook = asyncHooks.createHook({
        init: (asyncId: number) => ids.push(asyncId),
      });
      asyncHook.enable();
    });

    after(() => {
      asyncHook.disable();
    });

    it('does not break async_hook call stack', async () => {
      const query = `
        query Q1 {
          testObject {
            testString
          }
        }
      `;

      await runQuery({
        schema,
        queryString: query,
        operationName: 'Q1',
        request: new MockReq(),
      });

      // this is the only async process so we expect the async ids to be a sequence
      ids.forEach((id, i) => {
        if (i > 0) {
          expect(id).to.equal(ids[i - 1] + 1);
        }
      });
    });
  });
});
