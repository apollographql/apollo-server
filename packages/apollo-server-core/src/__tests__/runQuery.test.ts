import MockReq = require('mock-req');

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLNonNull,
  parse,
  DocumentNode,
} from 'graphql';

import {
  GraphQLExtensionStack,
  GraphQLExtension,
  GraphQLResponse,
} from 'graphql-extensions';

import { processGraphQLRequest, GraphQLRequest } from '../requestPipeline';
import { Request } from 'apollo-server-env';
import { GraphQLOptions, Context as GraphQLContext } from 'apollo-server-core';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { GraphQLRequestListener } from 'apollo-server-plugin-base';
import { InMemoryLRUCache } from 'apollo-server-caching';

// This is a temporary kludge to ensure we preserve runQuery behavior with the
// GraphQLRequestProcessor refactoring.
// These tests will be rewritten as GraphQLRequestProcessor tests after the
// refactoring is complete.

function runQuery(options: QueryOptions): Promise<GraphQLResponse> {
  const request: GraphQLRequest = {
    query: options.queryString,
    operationName: options.operationName,
    variables: options.variables,
    extensions: options.extensions,
    http: options.request,
  };

  return processGraphQLRequest(options, {
    request,
    context: options.context || {},
    debug: options.debug,
    cache: {} as any,
  });
}

interface QueryOptions
  extends Pick<
    GraphQLOptions<GraphQLContext<any>>,
    | 'cacheControl'
    | 'context'
    | 'debug'
    | 'documentStore'
    | 'extensions'
    | 'fieldResolver'
    | 'formatError'
    | 'formatResponse'
    | 'plugins'
    | 'rootValue'
    | 'schema'
    | 'tracing'
    | 'validationRules'
  > {
  queryString?: string;
  parsedQuery?: DocumentNode;
  variables?: { [key: string]: any };
  operationName?: string;
  request: Pick<Request, 'url' | 'method' | 'headers'>;
}

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
      resolve(_parent, _args, context) {
        return context.s + ' works';
      },
    },
    testArgumentValue: {
      type: GraphQLInt,
      resolve(_parent, args) {
        return args['base'] + 5;
      },
      args: {
        base: { type: new GraphQLNonNull(GraphQLInt) },
      },
    },
    testAwaitedValue: {
      type: GraphQLString,
      async resolve() {
        return 'it ' + (await 'works');
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
      expect(res.data).toEqual(expected);
    });
  });

  it.skip('returns the right result when query is a document', () => {
    const query = parse(`{ testString }`);
    const expected = { testString: 'it works' };
    return runQuery({
      schema,
      parsedQuery: query,
      request: new MockReq(),
    }).then(res => {
      expect(res.data).toEqual(expected);
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
      expect(res.data).toBeUndefined();
      expect(res.errors!.length).toEqual(1);
      expect(res.errors![0].message).toMatch(expected);
    });
  });

  it('does not call console.error if in an error occurs and debug mode is set', () => {
    const query = `query { testError }`;
    const logStub = jest.spyOn(console, 'error');
    return runQuery({
      schema,
      queryString: query,
      debug: true,
      request: new MockReq(),
    }).then(() => {
      logStub.mockRestore();
      expect(logStub.mock.calls.length).toEqual(0);
    });
  });

  it('does not call console.error if in an error occurs and not in debug mode', () => {
    const query = `query { testError }`;
    const logStub = jest.spyOn(console, 'error');
    return runQuery({
      schema,
      queryString: query,
      debug: false,
      request: new MockReq(),
    }).then(() => {
      logStub.mockRestore();
      expect(logStub.mock.calls.length).toEqual(0);
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
      expect(res.data).toBeUndefined();
      expect(res.errors!.length).toEqual(1);
      expect(res.errors![0].message).toEqual(expected);
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
      expect(res.data).toEqual(expected);
    });
  });

  it('correctly evaluates a rootValue function', () => {
    const query = `{ testRootValue }`;
    const expected = { testRootValue: 'it also works' };
    return runQuery({
      schema,
      queryString: query,
      rootValue: (doc: DocumentNode) => {
        expect(doc.kind).toEqual('Document');
        return 'it also';
      },
      request: new MockReq(),
    }).then(res => {
      expect(res.data).toEqual(expected);
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
      expect(res.data).toEqual(expected);
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
      expect(res.data).toEqual(expected);
      expect(res['extensions']).toEqual('it still');
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
      expect(res.data).toEqual(expected);
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
      expect(res.errors![0].message).toEqual(expected);
    });
  });

  it('supports yielding resolver functions', () => {
    return runQuery({
      schema,
      queryString: `{ testAwaitedValue }`,
      request: new MockReq(),
    }).then(res => {
      expect(res.data).toEqual({
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
      expect(res.data).toEqual(expected);
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

    expect(result1.data).toEqual({
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

    expect(result2.data).toEqual({
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
                resolve(_parent, _args, context) {
                  expect(context._extensionStack).toBeInstanceOf(
                    GraphQLExtensionStack,
                  );
                  expect(context._extensionStack.extensions[0]).toBeInstanceOf(
                    CustomExtension,
                  );
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
        expect(res.data).toEqual(expected);
        expect(res.extensions).toEqual({
          customExtension: { foo: 'bar' },
        });
      });
    });

    it('runs willSendResponse with extensions context', async () => {
      class CustomExtension implements GraphQLExtension<any> {
        willSendResponse(o: any) {
          expect(o).toHaveProperty('context.baz', 'always here');
          return o;
        }
      }

      const queryString = `{ testString }`;
      const expected = { testString: 'it works' };
      const extensions = [() => new CustomExtension()];
      return runQuery({
        schema,
        queryString,
        context: { baz: 'always here' },
        extensions,
        request: new MockReq(),
      }).then(res => {
        expect(res.data).toEqual(expected);
      });
    });
  });

  describe('request pipeline life-cycle hooks', () => {
    describe('requestDidStart', () => {
      const requestDidStart = jest.fn();
      it('called for each request', async () => {
        const runOnce = () =>
          runQuery({
            schema,
            queryString: '{ testString }',
            plugins: [
              {
                requestDidStart,
              },
            ],
            request: new MockReq(),
          });

        await runOnce();
        expect(requestDidStart.mock.calls.length).toBe(1);
        await runOnce();
        expect(requestDidStart.mock.calls.length).toBe(2);
      });
    });

    describe('parsingDidStart', () => {
      const parsingDidStart = jest.fn();
      it('called when parsing will result in an error', async () => {
        await runQuery({
          schema,
          queryString: '{ testStringWithParseError: }',
          plugins: [
            {
              requestDidStart() {
                return {
                  parsingDidStart,
                };
              },
            },
          ],
          request: new MockReq(),
        });

        expect(parsingDidStart).toBeCalled();
      });

      it('called when a successful parse happens', async () => {
        await runQuery({
          schema,
          queryString: '{ testString }',
          plugins: [
            {
              requestDidStart() {
                return {
                  parsingDidStart,
                };
              },
            },
          ],
          request: new MockReq(),
        });

        expect(parsingDidStart).toBeCalled();
      });
    });

    describe('didEncounterErrors', () => {
      const didEncounterErrors = jest.fn();
      const plugins: ApolloServerPlugin[] = [
        {
          requestDidStart() {
            return { didEncounterErrors };
          },
        },
      ];

      it('called when an error occurs', async () => {
        await runQuery({
          schema,
          queryString: '{ testStringWithParseError: }',
          plugins,
          request: new MockReq(),
        });

        expect(didEncounterErrors).toBeCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining([expect.any(Error)]),
          }),
        );
      });

      it('called when an error occurs in execution', async () => {
        const response = await runQuery({
          schema,
          queryString: '{ testError }',
          plugins,
          request: new MockReq(),
        });

        expect(response).toHaveProperty(
          'errors.0.message','Secret error message');
        expect(response).toHaveProperty('data.testError', null);

        expect(didEncounterErrors).toBeCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining([expect.objectContaining({
              message: 'Secret error message',
            })]),
          }),
        );
      });

      it('not called when an error does not occur', async () => {
        await runQuery({
          schema,
          queryString: '{ testString }',
          plugins,
          request: new MockReq(),
        });

        expect(didEncounterErrors).not.toBeCalled();
      });
    });
  });

  describe('parsing and validation cache', () => {
    function createLifecyclePluginMocks() {
      const validationDidStart = jest.fn();
      const parsingDidStart = jest.fn();

      const plugins: ApolloServerPlugin[] = [
        {
          requestDidStart() {
            return {
              validationDidStart,
              parsingDidStart,
            } as GraphQLRequestListener;
          },
        },
      ];

      return {
        plugins,
        events: { validationDidStart, parsingDidStart },
      };
    }

    function runRequest({
      queryString = '{ testString }',
      plugins = [],
      documentStore,
    }: {
      queryString?: string;
      plugins?: ApolloServerPlugin[];
      documentStore?: QueryOptions['documentStore'];
    }) {
      return runQuery({
        schema,
        documentStore,
        queryString,
        plugins,
        request: new MockReq(),
      });
    }

    function forgeLargerTestQuery(
      count: number,
      prefix: string = 'prefix',
    ): string {
      if (count <= 0) {
        count = 1;
      }

      let query: string = '';

      for (let q = 0; q < count; q++) {
        query += ` ${prefix}_${count}: testString\n`;
      }

      return '{\n' + query + '}';
    }

    // This should use the same logic as the calculation in InMemoryLRUCache:
    // https://github.com/apollographql/apollo-server/blob/94b98ff3/packages/apollo-server-caching/src/InMemoryLRUCache.ts#L23
    function approximateObjectSize<T>(obj: T): number {
      return Buffer.byteLength(JSON.stringify(obj), 'utf8');
    }

    it('validates each time when the documentStore is not present', async () => {
      expect.assertions(4);

      const {
        plugins,
        events: { parsingDidStart, validationDidStart },
      } = createLifecyclePluginMocks();

      // The first request will do a parse and validate. (1/1)
      await runRequest({ plugins });
      expect(parsingDidStart.mock.calls.length).toBe(1);
      expect(validationDidStart.mock.calls.length).toBe(1);

      // The second request should ALSO do a parse and validate. (2/2)
      await runRequest({ plugins });
      expect(parsingDidStart.mock.calls.length).toBe(2);
      expect(validationDidStart.mock.calls.length).toBe(2);
    });

    it('caches the DocumentNode in the documentStore when instrumented', async () => {
      expect.assertions(4);
      const documentStore = new InMemoryLRUCache<DocumentNode>();

      const {
        plugins,
        events: { parsingDidStart, validationDidStart },
      } = createLifecyclePluginMocks();

      // An uncached request will have 1 parse and 1 validate call.
      await runRequest({ plugins, documentStore });
      expect(parsingDidStart.mock.calls.length).toBe(1);
      expect(validationDidStart.mock.calls.length).toBe(1);

      // The second request should still only have a 1 validate and 1 parse.
      await runRequest({ plugins, documentStore });
      expect(parsingDidStart.mock.calls.length).toBe(1);
      expect(validationDidStart.mock.calls.length).toBe(1);
    });

    it("the documentStore calculates the DocumentNode's length by its JSON.stringify'd representation", async () => {
      expect.assertions(14);
      const {
        plugins,
        events: { parsingDidStart, validationDidStart },
      } = createLifecyclePluginMocks();

      const queryLarge = forgeLargerTestQuery(3, 'large');
      const querySmall1 = forgeLargerTestQuery(1, 'small1');
      const querySmall2 = forgeLargerTestQuery(1, 'small2');

      // We're going to create a smaller-than-default cache which will be the
      // size of the two smaller queries.  All three of these queries will never
      // fit into this cache, so we'll roll through them all.
      const maxSize =
        approximateObjectSize(parse(querySmall1)) +
        approximateObjectSize(parse(querySmall2));

      const documentStore = new InMemoryLRUCache<DocumentNode>({
        maxSize,
        sizeCalculator: approximateObjectSize,
      });

      await runRequest({ plugins, documentStore, queryString: querySmall1 });
      expect(parsingDidStart.mock.calls.length).toBe(1);
      expect(validationDidStart.mock.calls.length).toBe(1);

      await runRequest({ plugins, documentStore, queryString: querySmall2 });
      expect(parsingDidStart.mock.calls.length).toBe(2);
      expect(validationDidStart.mock.calls.length).toBe(2);

      // This query should be large enough to evict both of the previous
      // from the LRU cache since it's larger than the TOTAL limit of the cache
      // (which is capped at the length of small1 + small2) — though this will
      // still fit (barely).
      await runRequest({ plugins, documentStore, queryString: queryLarge });
      expect(parsingDidStart.mock.calls.length).toBe(3);
      expect(validationDidStart.mock.calls.length).toBe(3);

      // Make sure the large query is still cached (No incr. to parse/validate.)
      await runRequest({ plugins, documentStore, queryString: queryLarge });
      expect(parsingDidStart.mock.calls.length).toBe(3);
      expect(validationDidStart.mock.calls.length).toBe(3);

      // This small (and the other) should both trigger parse/validate since
      // the cache had to have evicted them both after accommodating the larger.
      await runRequest({ plugins, documentStore, queryString: querySmall1 });
      expect(parsingDidStart.mock.calls.length).toBe(4);
      expect(validationDidStart.mock.calls.length).toBe(4);

      await runRequest({ plugins, documentStore, queryString: querySmall2 });
      expect(parsingDidStart.mock.calls.length).toBe(5);
      expect(validationDidStart.mock.calls.length).toBe(5);

      // Finally, make sure that the large query is gone (it should be, after
      // the last two have taken its spot again.)
      await runRequest({ plugins, documentStore, queryString: queryLarge });
      expect(parsingDidStart.mock.calls.length).toBe(6);
      expect(validationDidStart.mock.calls.length).toBe(6);
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

    beforeAll(() => {
      asyncHook = asyncHooks.createHook({
        init: (asyncId: number) => ids.push(asyncId),
      });
      asyncHook.enable();
    });

    afterAll(() => {
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

      // Expect there to be several async ids provided
      expect(ids.length).toBeGreaterThanOrEqual(2);
    });
  });
});
