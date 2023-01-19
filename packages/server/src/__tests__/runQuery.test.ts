import {
  DocumentNode,
  FormattedExecutionResult,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  parse,
} from 'graphql';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import {
  ApolloServer,
  ApolloServerOptions,
  ApolloServerPlugin,
  BaseContext,
  GraphQLRequest,
  GraphQLRequestExecutionListener,
  GraphQLRequestListener,
  GraphQLRequestListenerDidResolveField,
  GraphQLRequestListenerExecutionDidEnd,
  GraphQLRequestListenerParsingDidEnd,
  GraphQLRequestListenerValidationDidEnd,
  HeaderMap,
} from '..';
import { mockLogger } from './mockLogger';
import { jest, describe, it, expect } from '@jest/globals';

async function runQuery(
  config: ApolloServerOptions<BaseContext>,
  request: GraphQLRequest,
): Promise<FormattedExecutionResult>;
async function runQuery<TContext extends BaseContext>(
  config: ApolloServerOptions<TContext>,
  request: GraphQLRequest,
  contextValue: TContext,
): Promise<FormattedExecutionResult>;
async function runQuery<TContext extends BaseContext>(
  config: ApolloServerOptions<TContext>,
  request: GraphQLRequest,
  contextValue?: TContext,
): Promise<FormattedExecutionResult> {
  const server = new ApolloServer(config);
  await server.start();
  const response = await server.executeOperation(
    request,
    // `as` safe because TContext must be BaseContext if no contextValue provided
    { contextValue: contextValue ?? ({} as TContext) },
  );
  await server.stop();
  if (!('singleResult' in response.body)) {
    throw Error('expected single result');
  }
  return response.body.singleResult;
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
        await new Promise<void>((resolve) => setTimeout(resolve, 2));
        return 'it works';
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

it('returns the right result when query is a string', async () => {
  const query = `{ testString }`;
  const expected = { testString: 'it works' };
  const res = await runQuery({ schema }, { query });
  expect(res.data).toEqual(expected);
});

it('returns a syntax error if the query string contains one', async () => {
  const query = `query { test `;
  const expected = /Syntax Error/;
  const res = await runQuery(
    { schema },
    {
      query,
      variables: { base: 1 },
    },
  );
  expect(res.data).toBeUndefined();
  expect(res.errors!.length).toEqual(1);
  expect(res.errors![0].message).toMatch(expected);
});

// Maybe we used to log field errors and we want to make sure we don't do that?
// Our Jest tests automatically fail if anything is logged to the console.
it.each([true, false])(
  'does not call console.error if in an error occurs and includeStacktraceInErrorResponses is %s',
  async (includeStacktraceInErrorResponses) => {
    const query = `query { testError }`;
    const res = await runQuery(
      {
        schema,
        includeStacktraceInErrorResponses,
      },
      { query },
    );
    expect(res.data).toEqual({ testError: null });
    expect(res.errors!.length).toEqual(1);
    expect(res.errors![0].message).toEqual('Secret error message');
  },
);

it('returns a validation error if the query string does not pass validation', async () => {
  const query = `query TestVar($base: String){ testArgumentValue(base: $base) }`;
  const expected =
    'Variable "$base" of type "String" used in position expecting type "Int!".';
  const res = await runQuery(
    { schema },
    {
      query,
      variables: { base: 1 },
    },
  );
  expect(res.data).toBeUndefined();
  expect(res.errors!.length).toEqual(1);
  expect(res.errors![0].message).toEqual(expected);
});

it('correctly passes in the rootValue', async () => {
  const query = `{ testRootValue }`;
  const expected = { testRootValue: 'it also works' };
  const res = await runQuery(
    {
      schema,
      rootValue: 'it also',
    },
    { query },
  );
  expect(res.data).toEqual(expected);
});

it('correctly evaluates a rootValue function', async () => {
  const query = `{ testRootValue }`;
  const expected = { testRootValue: 'it also works' };
  const res = await runQuery(
    {
      schema,
      rootValue: (doc_1: DocumentNode) => {
        expect(doc_1.kind).toEqual('Document');
        return 'it also';
      },
    },
    { query },
  );
  expect(res.data).toEqual(expected);
});

it('correctly passes in the context', async () => {
  const query = `{ testContextValue }`;
  const expected = { testContextValue: 'it still works' };
  const res = await runQuery({ schema }, { query }, { s: 'it still' });
  expect(res.data).toEqual(expected);
});

it('correctly passes in variables (and arguments)', async () => {
  const query = `query TestVar($base: Int!){ testArgumentValue(base: $base) }`;
  const expected = { testArgumentValue: 6 };
  const res = await runQuery(
    { schema },
    {
      query,
      variables: { base: 1 },
    },
  );
  expect(res.data).toEqual(expected);
});

it('throws an error if there are missing variables', async () => {
  const query = `query TestVar($base: Int!){ testArgumentValue(base: $base) }`;
  const expected = 'Variable "$base" of required type "Int!" was not provided.';
  const res = await runQuery({ schema }, { query });
  expect(res.errors![0].message).toEqual(expected);
});

it('supports yielding resolver functions', async () => {
  const res = await runQuery({ schema }, { query: `{ testAwaitedValue }` });
  expect(res.data).toEqual({ testAwaitedValue: 'it works' });
});

it('runs the correct operation when operationName is specified', async () => {
  const query = `
        query Q1 {
            testString
        }
        query Q2 {
            testRootValue
        }`;
  const expected = { testString: 'it works' };
  const res = await runQuery(
    { schema },
    {
      query,
      operationName: 'Q1',
    },
  );
  expect(res.data).toEqual(expected);
});

it('uses custom field resolver', async () => {
  const query = `
        query Q1 {
          testObject {
            testString
          }
        }
      `;

  const result1 = await runQuery(
    { schema },
    {
      query,
      operationName: 'Q1',
    },
  );

  expect(result1.data).toEqual({
    testObject: {
      testString: 'a very test string',
    },
  });

  const result2 = await runQuery(
    { schema, fieldResolver: () => 'a very testful field resolver string' },
    {
      query,
      operationName: 'Q1',
    },
  );

  expect(result2.data).toEqual({
    testObject: {
      testString: 'a very testful field resolver string',
    },
  });
});

describe('request pipeline life-cycle hooks', () => {
  it('requestDidStart called for each request', async () => {
    const requestDidStart = jest.fn(async (_rc) => {});
    const runOnce = () =>
      runQuery(
        {
          schema,
          plugins: [{ requestDidStart }],
        },
        { query: '{ testString }' },
      );

    await runOnce();
    expect(requestDidStart).toBeCalledTimes(1);
    expect(requestDidStart.mock.calls[0][0]).toHaveProperty('schema', schema);
    await runOnce();
    expect(requestDidStart).toBeCalledTimes(2);
  });

  /**
   * This tests the simple invocation of the "didResolveSource" hook, but
   * doesn't test one of the primary reasons why "source" isn't guaranteed
   * sooner in the request life-cycle: when "source" is populated via an APQ
   * cache HIT.
   *
   * That functionality is tested in `@apollo/server-integration-testsuite`,
   * within the "Persisted Queries" tests. (Search for "didResolveSource").
   */
  it('didResolveSource called with the source', async () => {
    const didResolveSource = jest.fn(async (_rc) => {});
    await runQuery(
      {
        schema,
        plugins: [
          {
            async requestDidStart() {
              return {
                didResolveSource,
              };
            },
          },
        ],
      },
      { query: '{ testString }' },
    );

    expect(didResolveSource).toHaveBeenCalled();
    expect(didResolveSource.mock.calls[0][0]).toHaveProperty(
      'source',
      '{ testString }',
    );
  });

  describe('parsingDidStart', () => {
    const parsingDidStart = jest.fn(async (_rc) => {});
    const plugin = {
      async requestDidStart() {
        return {
          parsingDidStart,
        };
      },
    };
    it('called when parsing will result in an error', async () => {
      await runQuery(
        {
          schema,
          plugins: [plugin],
        },
        { query: '{ testStringWithParseError: }' },
      );

      expect(parsingDidStart).toBeCalled();
    });

    it('called when a successful parse happens', async () => {
      await runQuery(
        {
          schema,
          plugins: [plugin],
        },
        { query: '{ testString }' },
      );

      expect(parsingDidStart).toBeCalled();
    });
  });

  describe('executionDidStart', () => {
    it('called when execution starts', async () => {
      const executionDidStart = jest.fn(async (_rc) => {});
      await runQuery(
        {
          schema,
          plugins: [
            {
              async requestDidStart() {
                return {
                  executionDidStart,
                };
              },
            },
          ],
        },
        { query: '{ testString }' },
      );

      expect(executionDidStart).toHaveBeenCalledTimes(1);
    });

    describe('executionDidEnd', () => {
      it('works as a listener on an object returned from "executionDidStart"', async () => {
        const executionDidEnd = jest.fn(async (_rc) => {});
        const executionDidStart = jest.fn(
          async (): Promise<GraphQLRequestExecutionListener<BaseContext>> => ({
            executionDidEnd,
          }),
        );

        await runQuery(
          {
            schema,
            plugins: [
              {
                async requestDidStart() {
                  return {
                    executionDidStart,
                  };
                },
              },
            ],
          },
          { query: '{ testString }' },
        );

        expect(executionDidStart).toHaveBeenCalledTimes(1);
        expect(executionDidEnd).toHaveBeenCalledTimes(1);
      });

      it('is only called once if it throws', async () => {
        const executionDidEnd = jest.fn(() => {
          throw new Error('boom');
        });

        const plugins = [
          {
            async requestDidStart() {
              return {
                async executionDidStart() {
                  return {
                    executionDidEnd,
                  };
                },
              };
            },
          },
        ];

        const logger = mockLogger();

        await expect(
          runQuery(
            {
              schema,
              plugins,
              logger,
            },
            { query: '{ testString }' },
          ),
        ).rejects.toThrowError(/Internal server error/);

        expect(executionDidEnd).toHaveBeenCalledTimes(1);
        expect(logger.error).toHaveBeenCalledWith(
          'Unexpected error processing request: Error: boom',
        );
      });
    });

    describe('willResolveField', () => {
      it('called when resolving a field starts', async () => {
        const willResolveField = jest.fn((_frp) => {});
        const executionDidEnd = jest.fn(async (_rc) => {});
        const executionDidStart = jest.fn(
          async (): Promise<GraphQLRequestExecutionListener<BaseContext>> => ({
            willResolveField,
            executionDidEnd,
          }),
        );

        await runQuery(
          {
            schema,
            plugins: [
              {
                async requestDidStart() {
                  return {
                    executionDidStart,
                  };
                },
              },
            ],
          },
          { query: '{ testString }' },
        );

        expect(executionDidStart).toHaveBeenCalledTimes(1);
        expect(willResolveField).toHaveBeenCalledTimes(1);
        expect(executionDidEnd).toHaveBeenCalledTimes(1);
      });

      it('called once for each field being resolved', async () => {
        const willResolveField = jest.fn((_frp) => {});
        const executionDidEnd = jest.fn(async (_rc) => {});
        const executionDidStart = jest.fn(
          async (): Promise<GraphQLRequestExecutionListener<BaseContext>> => ({
            willResolveField,
            executionDidEnd,
          }),
        );

        await runQuery(
          {
            schema,
            plugins: [
              {
                async requestDidStart() {
                  return {
                    executionDidStart,
                  };
                },
              },
            ],
          },
          { query: '{ testString again:testString }' },
        );

        expect(executionDidStart).toHaveBeenCalledTimes(1);
        expect(willResolveField).toHaveBeenCalledTimes(2);
        expect(executionDidEnd).toHaveBeenCalledTimes(1);
      });

      describe('receives correct resolver parameter object', () => {
        it('receives undefined parent when there is no parent', async () => {
          const willResolveField = jest.fn((_frp) => {});

          await runQuery(
            {
              schema,
              plugins: [
                {
                  async requestDidStart() {
                    return {
                      executionDidStart: async () => ({
                        willResolveField,
                      }),
                    };
                  },
                },
              ],
            },
            { query: '{ testString }' },
          );

          // It is called only once.
          expect(willResolveField).toHaveBeenCalledTimes(1);
          const call = willResolveField.mock.calls[0];
          expect(call[0]).toHaveProperty('source', undefined);
          expect(call[0]).toHaveProperty('info.path.key', 'testString');
          expect(call[0]).toHaveProperty('info.path.prev', undefined);
        });

        it('receives the parent when there is one', async () => {
          const willResolveField = jest.fn((_frp) => {});

          await runQuery(
            {
              schema,
              plugins: [
                {
                  async requestDidStart() {
                    return {
                      executionDidStart: async () => ({
                        willResolveField,
                      }),
                    };
                  },
                },
              ],
            },
            { query: '{ testObject { testString } }' },
          );

          // It is called 1st for `testObject` and then 2nd for `testString`.
          expect(willResolveField).toHaveBeenCalledTimes(2);
          const [firstCall, secondCall] = willResolveField.mock.calls;
          expect(firstCall[0]).toHaveProperty('source', undefined);
          expect(firstCall[0]).toHaveProperty('info.path.key', 'testObject');
          expect(firstCall[0]).toHaveProperty('info.path.prev', undefined);

          expect(secondCall[0]).toHaveProperty('source', {
            testString: 'a very test string',
          });
          expect(secondCall[0]).toHaveProperty('info.path.key', 'testString');
          expect(secondCall[0]).toHaveProperty('info.path.prev', {
            key: 'testObject',
            prev: undefined,
            typename: 'QueryType',
          });
        });

        it('receives context', async () => {
          const willResolveField = jest.fn((_frp) => {});

          await runQuery(
            {
              schema,
              plugins: [
                {
                  async requestDidStart() {
                    return {
                      executionDidStart: async () => ({
                        willResolveField,
                      }),
                    };
                  },
                },
              ],
            },
            {
              query: '{ testString }',
            },
            { ourSpecialContext: true },
          );

          expect(willResolveField).toHaveBeenCalledTimes(1);
          expect(willResolveField.mock.calls[0][0]).toHaveProperty(
            'contextValue',
            expect.objectContaining({ ourSpecialContext: true }),
          );
        });

        it('receives arguments', async () => {
          const willResolveField = jest.fn((_frp) => {});

          await runQuery(
            {
              schema,
              plugins: [
                {
                  async requestDidStart() {
                    return {
                      executionDidStart: async () => ({
                        willResolveField,
                      }),
                    };
                  },
                },
              ],
            },
            { query: '{ testArgumentValue(base: 99) }' },
          );

          expect(willResolveField).toHaveBeenCalledTimes(1);
          expect(willResolveField.mock.calls[0][0]).toHaveProperty(
            'args.base',
            99,
          );
        });
      });

      it('calls the end handler', async () => {
        const didResolveField: GraphQLRequestListenerDidResolveField =
          jest.fn();
        const willResolveField = jest.fn(() => didResolveField);
        const executionDidEnd = jest.fn(async () => {});
        const executionDidStart = jest.fn(
          async (): Promise<GraphQLRequestExecutionListener<BaseContext>> => ({
            willResolveField,
            executionDidEnd,
          }),
        );

        await runQuery(
          {
            schema,
            plugins: [
              {
                async requestDidStart() {
                  return {
                    executionDidStart,
                  };
                },
              },
            ],
          },
          { query: '{ testString }' },
        );

        expect(executionDidStart).toHaveBeenCalledTimes(1);
        expect(willResolveField).toHaveBeenCalledTimes(1);
        expect(didResolveField).toHaveBeenCalledTimes(1);
        expect(executionDidEnd).toHaveBeenCalledTimes(1);
      });

      it('calls the end handler for each field being resolved', async () => {
        const didResolveField: GraphQLRequestListenerDidResolveField =
          jest.fn();
        const willResolveField = jest.fn(() => didResolveField);
        const executionDidEnd = jest.fn(async () => {});
        const executionDidStart = jest.fn(
          async (): Promise<GraphQLRequestExecutionListener<BaseContext>> => ({
            willResolveField,
            executionDidEnd,
          }),
        );

        await runQuery(
          {
            schema,
            plugins: [
              {
                async requestDidStart() {
                  return {
                    executionDidStart,
                  };
                },
              },
            ],
          },
          { query: '{ testString again: testString }' },
        );

        expect(executionDidStart).toHaveBeenCalledTimes(1);
        expect(willResolveField).toHaveBeenCalledTimes(2);
        expect(didResolveField).toHaveBeenCalledTimes(2);
        expect(executionDidEnd).toHaveBeenCalledTimes(1);
      });

      it('uses the custom "fieldResolver" when defined', async () => {
        const schemaWithResolver = new GraphQLSchema({
          query: new GraphQLObjectType({
            name: 'QueryType',
            fields: {
              testString: {
                type: GraphQLString,
                resolve() {
                  return 'using schema-defined resolver';
                },
              },
            },
          }),
        });

        const schemaWithoutResolver = new GraphQLSchema({
          query: new GraphQLObjectType({
            name: 'QueryType',
            fields: {
              testString: {
                type: GraphQLString,
              },
            },
          }),
        });

        const differentFieldResolver = () =>
          "I'm different, ya, I'm different.";

        const queryString = `{ testString } `;

        const didResolveField: GraphQLRequestListenerDidResolveField =
          jest.fn();
        const willResolveField = jest.fn(() => didResolveField);

        const plugins: ApolloServerPlugin<BaseContext>[] = [
          {
            requestDidStart: async () => ({
              executionDidStart: async () => ({
                willResolveField,
              }),
            }),
          },
        ];

        const resultFromSchemaWithResolver = await runQuery(
          {
            schema: schemaWithResolver,
            plugins,
            fieldResolver: differentFieldResolver,
          },
          { query: queryString },
        );

        expect(willResolveField).toHaveBeenCalledTimes(1);
        expect(didResolveField).toHaveBeenCalledTimes(1);

        expect(resultFromSchemaWithResolver.data).toEqual({
          testString: 'using schema-defined resolver',
        });

        const resultFromSchemaWithoutResolver = await runQuery(
          {
            schema: schemaWithoutResolver,
            plugins,
            fieldResolver: differentFieldResolver,
          },
          { query: queryString },
        );

        expect(willResolveField).toHaveBeenCalledTimes(2);
        expect(didResolveField).toHaveBeenCalledTimes(2);

        expect(resultFromSchemaWithoutResolver.data).toEqual({
          testString: "I'm different, ya, I'm different.",
        });
      });
    });
  });

  describe('didEncounterErrors', () => {
    const didEncounterErrors = jest.fn(async () => {});
    const plugins: ApolloServerPlugin<BaseContext>[] = [
      {
        async requestDidStart() {
          return { didEncounterErrors };
        },
      },
    ];

    it('called when an parsing error occurs', async () => {
      await runQuery(
        {
          schema,
          plugins,
        },
        { query: '{ testStringWithParseError: }' },
      );

      expect(didEncounterErrors).toBeCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: 'Syntax Error: Expected Name, found "}".',
              extensions: {
                code: 'GRAPHQL_PARSE_FAILED',
                http: { status: 400, headers: expect.any(HeaderMap) },
              },
            }),
          ]),
        }),
      );
    });

    it('called when a validation error occurs', async () => {
      await runQuery(
        {
          schema,
          plugins,
        },
        { query: '{ testStringWithParseError }' },
      );

      expect(didEncounterErrors).toBeCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              message:
                'Cannot query field "testStringWithParseError" on type "QueryType".',
              extensions: {
                code: 'GRAPHQL_VALIDATION_FAILED',
                http: { status: 400, headers: expect.any(HeaderMap) },
              },
            }),
          ]),
        }),
      );
    });

    it('called when an error occurs in execution', async () => {
      const response = await runQuery(
        {
          schema,
          plugins,
        },
        { query: '{ testError }' },
      );

      expect(response).toHaveProperty(
        'errors.0.message',
        'Secret error message',
      );
      expect(response).toHaveProperty('data.testError', null);

      expect(didEncounterErrors).toBeCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: 'Secret error message',
            }),
          ]),
        }),
      );
    });

    it('not called when an error does not occur', async () => {
      await runQuery(
        {
          schema,
          plugins,
        },
        { query: '{ testString }' },
      );

      expect(didEncounterErrors).not.toBeCalled();
    });
  });

  describe('ordering', () => {
    it('calls hooks in the expected order', async () => {
      const callOrder: string[] = [];
      let stopAwaiting: Function;
      const toBeAwaited = new Promise((resolve) => (stopAwaiting = resolve));

      const parsingDidEnd: GraphQLRequestListenerParsingDidEnd = jest.fn(
        async () => {
          callOrder.push('parsingDidEnd');
        },
      );
      const parsingDidStart: GraphQLRequestListener<BaseContext>['parsingDidStart'] =
        jest.fn(async () => {
          callOrder.push('parsingDidStart');
          return parsingDidEnd;
        });

      const validationDidEnd: GraphQLRequestListenerValidationDidEnd = jest.fn(
        async () => {
          callOrder.push('validationDidEnd');
        },
      );
      const validationDidStart: GraphQLRequestListener<BaseContext>['validationDidStart'] =
        jest.fn(async () => {
          callOrder.push('validationDidStart');
          return validationDidEnd;
        });

      const didResolveSource: GraphQLRequestListener<BaseContext>['didResolveSource'] =
        jest.fn(async () => {
          callOrder.push('didResolveSource');
        });

      const didResolveField: GraphQLRequestListenerDidResolveField = jest.fn(
        () => callOrder.push('didResolveField'),
      );

      const willResolveField = jest.fn(() => {
        callOrder.push('willResolveField');
        return didResolveField;
      });

      const executionDidEnd: GraphQLRequestListenerExecutionDidEnd = jest.fn(
        async () => {
          callOrder.push('executionDidEnd');
        },
      );

      const executionDidStart = jest.fn(
        async (): Promise<GraphQLRequestExecutionListener<BaseContext>> => {
          callOrder.push('executionDidStart');
          return { willResolveField, executionDidEnd };
        },
      );

      const schema = new GraphQLSchema({
        query: new GraphQLObjectType({
          name: 'QueryType',
          fields: {
            testString: {
              type: GraphQLString,
              async resolve() {
                callOrder.push('beforeAwaiting');
                await toBeAwaited;
                callOrder.push('afterAwaiting');
                return 'it works';
              },
            },
          },
        }),
      });

      Promise.resolve().then(() => stopAwaiting());

      await runQuery(
        {
          schema,
          plugins: [
            {
              async requestDidStart() {
                return {
                  parsingDidStart,
                  validationDidStart,
                  didResolveSource,
                  executionDidStart,
                };
              },
            },
          ],
        },
        { query: '{ testString }' },
      );

      expect(parsingDidStart).toHaveBeenCalledTimes(1);
      expect(parsingDidEnd).toHaveBeenCalledTimes(1);
      expect(validationDidStart).toHaveBeenCalledTimes(1);
      expect(validationDidEnd).toHaveBeenCalledTimes(1);
      expect(executionDidStart).toHaveBeenCalledTimes(1);
      expect(willResolveField).toHaveBeenCalledTimes(1);
      expect(didResolveField).toHaveBeenCalledTimes(1);
      expect(callOrder).toStrictEqual([
        'didResolveSource',
        'parsingDidStart',
        'parsingDidEnd',
        'validationDidStart',
        'validationDidEnd',
        'executionDidStart',
        'willResolveField',
        'beforeAwaiting',
        'afterAwaiting',
        'didResolveField',
        'executionDidEnd',
      ]);
    });
  });
});

describe('parsing and validation cache', () => {
  function createLifecyclePluginMocks() {
    const validationDidStart = jest.fn();
    const parsingDidStart = jest.fn();

    const plugins: ApolloServerPlugin<BaseContext>[] = [
      {
        async requestDidStart() {
          return {
            validationDidStart,
            parsingDidStart,
          } as GraphQLRequestListener<BaseContext>;
        },
      },
    ];

    return {
      plugins,
      events: { validationDidStart, parsingDidStart },
    };
  }

  function forgeLargerTestQuery(count: number, prefix = 'prefix'): string {
    if (count <= 0) {
      count = 1;
    }

    let query = '';

    for (let q = 0; q < count; q++) {
      query += ` ${prefix}_${count}: testString\n`;
    }

    return '{\n' + query + '}';
  }

  it('validates each time when the documentStore is null', async () => {
    const {
      plugins,
      events: { parsingDidStart, validationDidStart },
    } = createLifecyclePluginMocks();

    const server = new ApolloServer({
      schema,
      plugins,
      documentStore: null,
    });
    await server.start();

    const query = '{ testString }';

    // The first request will do a parse and validate. (1/1)
    await server.executeOperation({ query });
    expect(parsingDidStart.mock.calls.length).toBe(1);
    expect(validationDidStart.mock.calls.length).toBe(1);

    // The second request should ALSO do a parse and validate. (2/2)
    await server.executeOperation({ query });
    expect(parsingDidStart.mock.calls.length).toBe(2);
    expect(validationDidStart.mock.calls.length).toBe(2);

    await server.stop();
  });

  it('only validates and parses once by default', async () => {
    const {
      plugins,
      events: { parsingDidStart, validationDidStart },
    } = createLifecyclePluginMocks();

    const server = new ApolloServer({
      schema,
      plugins,
    });
    await server.start();

    const query = '{ testString }';

    // The first request will do a parse and validate. (1/1)
    await server.executeOperation({ query });
    expect(parsingDidStart.mock.calls.length).toBe(1);
    expect(validationDidStart.mock.calls.length).toBe(1);

    // The second request should still only have a 1 validate and 1 parse.
    await server.executeOperation({ query });
    expect(parsingDidStart.mock.calls.length).toBe(1);
    expect(validationDidStart.mock.calls.length).toBe(1);

    await server.stop();
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

    // The (stringified) objects returned by this function represent how they're
    // stored in the cache and the form they're in when having size calculations
    // performed on them.
    function cacheRepresentationOfQuery(query: string): string {
      return JSON.stringify({ value: parse(query), expires: null });
    }

    // We're going to create a smaller-than-default cache which will be the size
    // of the two smaller queries. All three of these queries will never fit
    // into this cache, so we'll roll through them all.
    const maxSize =
      InMemoryLRUCache.sizeCalculation(
        cacheRepresentationOfQuery(querySmall1),
      ) +
      InMemoryLRUCache.sizeCalculation(cacheRepresentationOfQuery(querySmall2));

    const documentStore = new InMemoryLRUCache<DocumentNode>({
      maxSize,
    });

    const server = new ApolloServer({
      schema,
      plugins,
      documentStore,
    });
    await server.start();

    await server.executeOperation({ query: querySmall1 });
    expect(parsingDidStart.mock.calls.length).toBe(1);
    expect(validationDidStart.mock.calls.length).toBe(1);

    await server.executeOperation({ query: querySmall2 });
    expect(parsingDidStart.mock.calls.length).toBe(2);
    expect(validationDidStart.mock.calls.length).toBe(2);

    // This query should be large enough to evict both of the previous
    // from the LRU cache since it's larger than the TOTAL limit of the cache
    // (which is capped at the length of small1 + small2) — though this will
    // still fit (barely).
    await server.executeOperation({ query: queryLarge });
    expect(parsingDidStart.mock.calls.length).toBe(3);
    expect(validationDidStart.mock.calls.length).toBe(3);

    // Make sure the large query is still cached (No incr. to parse/validate.)
    await server.executeOperation({ query: queryLarge });
    expect(parsingDidStart.mock.calls.length).toBe(3);
    expect(validationDidStart.mock.calls.length).toBe(3);

    // This small (and the other) should both trigger parse/validate since
    // the cache had to have evicted them both after accommodating the larger.
    await server.executeOperation({ query: querySmall1 });
    expect(parsingDidStart.mock.calls.length).toBe(4);
    expect(validationDidStart.mock.calls.length).toBe(4);

    await server.executeOperation({ query: querySmall2 });
    expect(parsingDidStart.mock.calls.length).toBe(5);
    expect(validationDidStart.mock.calls.length).toBe(5);

    // Finally, make sure that the large query is gone (it should be, after
    // the last two have taken its spot again.)
    await server.executeOperation({ query: queryLarge });
    expect(parsingDidStart.mock.calls.length).toBe(6);
    expect(validationDidStart.mock.calls.length).toBe(6);
  });
});
