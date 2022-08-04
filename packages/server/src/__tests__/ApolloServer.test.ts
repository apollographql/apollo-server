import { ApolloServer } from '..';
import type { ApolloServerOptions, GatewayInterface } from '..';
import { GraphQLError, GraphQLSchema } from 'graphql';
import type { ApolloServerPlugin, BaseContext } from '../externalTypes';
import { ApolloServerPluginCacheControlDisabled } from '../plugin/disabled/index.js';
import { ApolloServerPluginUsageReporting } from '../plugin/usageReporting/index.js';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { HeaderMap } from '../runHttpQuery.js';
import { mockLogger } from './mockLogger.js';
import gql from 'graphql-tag';

const typeDefs = gql`
  type Query {
    hello: String
    error: Boolean
    contextFoo: String
  }
`;

const resolvers = {
  Query: {
    hello() {
      return 'world';
    },
    error() {
      throw new GraphQLError('A test error', {
        extensions: { someField: 'value' },
      });
    },
    contextFoo(_root: any, _args: any, context: any) {
      return context.foo;
    },
  },
};

describe('ApolloServer construction', () => {
  it('succeeds when a valid configuration options are provided to typeDefs and resolvers', () => {
    expect(() => new ApolloServer({ typeDefs, resolvers })).not.toThrow();
  });

  it('throws error if called without schema', function () {
    // @ts-expect-error
    expect(() => new ApolloServer()).toThrow();
  });

  it('succeeds when a valid GraphQLSchema is provided to the schema configuration option', () => {
    expect(
      () =>
        new ApolloServer({
          schema: makeExecutableSchema({ typeDefs, resolvers }),
        }),
    ).not.toThrow();
  });

  it('succeeds when passed a graphVariant in construction', async () => {
    const logger = mockLogger();
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      apollo: {
        graphVariant: 'foo',
        key: 'service:real:key',
      },
      logger,
    });
    expect(logger.warn).toHaveBeenCalledTimes(0);
    await server.start();
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.warn.mock.calls[0][0]).toMatch(
      /Apollo key but have not specified a graph ref/,
    );
    await server.stop();
  });

  it('throws when a GraphQLSchema is not provided to the schema configuration option', () => {
    expect(() => {
      new ApolloServer({
        schema: {} as GraphQLSchema,
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `"Expected {} to be a GraphQL schema."`,
    );
  });

  it('throws when no schema configuration option is provided', () => {
    expect(() => {
      // @ts-expect-error
      new ApolloServer({});
    }).toThrow();
  });

  it('TypeScript enforces schema-related option combinations', async () => {
    const schema = makeExecutableSchema({ typeDefs, resolvers });
    const gateway: GatewayInterface<BaseContext> = {
      async load() {
        return { schema, executor: null };
      },
      async stop() {},
      onSchemaLoadOrUpdate() {
        return () => {};
      },
    };

    function takesConfig(_c: ApolloServerOptions<BaseContext>) {}

    takesConfig({ gateway });
    takesConfig({ schema });
    takesConfig({ typeDefs });
    takesConfig({ typeDefs, resolvers });

    // @ts-expect-error
    takesConfig({ gateway, schema });
    // @ts-expect-error
    takesConfig({ gateway, typeDefs });
    // @ts-expect-error
    takesConfig({ schema, resolvers });
    // @ts-expect-error
    takesConfig({ schema, typeDefs });

    // This used to exist in AS3.
    // @ts-expect-error
    takesConfig({ modules: [] });
  });
});

const failToStartPlugin: ApolloServerPlugin<BaseContext> = {
  async serverWillStart() {
    throw Error('nope');
  },
};

describe('ApolloServer start', () => {
  it('start throws on startup error and startupDidFail hook is called with error', async () => {
    const startupDidFail = jest.fn();
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [failToStartPlugin, { startupDidFail }],
    });
    await expect(server.start()).rejects.toThrow('nope');
    expect(startupDidFail.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "error": [Error: nope],
          },
        ],
      ]
    `);
  });

  it('stop throws on stop error', async () => {
    let n = 1;
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [
        {
          async serverWillStart() {
            return {
              async serverWillStop() {
                throw Error(`no way ${n++}`);
              },
            };
          },
        },
      ],
    });
    await server.start();
    const initialStopPromise = server.stop();
    const concurrentStopPromise = server.stop();
    await expect(initialStopPromise).rejects.toThrow('no way 1');
    // A concurrent call will throw the same error again.
    await expect(concurrentStopPromise).rejects.toThrow('no way 1');
    // A subsequent call will throw the same error again.
    await expect(server.stop()).rejects.toThrow('no way 1');
  });

  // We care more specifically about this in the background start case because
  // integrations shouldn't call executeHTTPGraphQLRequest if a "foreground"
  // start fails.
  it('executeHTTPGraphQLRequest returns redacted error if background start fails', async () => {
    const logger = mockLogger();

    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [failToStartPlugin],
      logger,
    });

    server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

    const request = {
      httpGraphQLRequest: {
        method: 'POST',
        headers: new HeaderMap([['content-type', 'application-json']]),
        body: JSON.stringify({ query: '{__typename}' }),
        search: '',
      },
      context: async () => ({}),
    };

    expect(await server.executeHTTPGraphQLRequest(request))
      .toMatchInlineSnapshot(`
      Object {
        "bodyChunks": null,
        "completeBody": "{\\"errors\\":[{\\"message\\":\\"This data graph is missing a valid configuration. More details may be available in the server logs.\\",\\"extensions\\":{\\"code\\":\\"INTERNAL_SERVER_ERROR\\"}}]}
      ",
        "headers": Map {
          "content-type" => "application/json",
        },
        "statusCode": 500,
      }
    `);

    expect(await server.executeHTTPGraphQLRequest(request))
      .toMatchInlineSnapshot(`
      Object {
        "bodyChunks": null,
        "completeBody": "{\\"errors\\":[{\\"message\\":\\"This data graph is missing a valid configuration. More details may be available in the server logs.\\",\\"extensions\\":{\\"code\\":\\"INTERNAL_SERVER_ERROR\\"}}]}
      ",
        "headers": Map {
          "content-type" => "application/json",
        },
        "statusCode": 500,
      }
    `);

    // Three times: once for the actual background _start call, twice for the
    // two operations.
    expect(logger.error).toHaveBeenCalledTimes(3);
    for (const [message] of logger.error.mock.calls) {
      expect(message).toBe(
        'An error occurred during Apollo Server startup. All ' +
          'GraphQL requests will now fail. The startup error was: nope',
      );
    }
  });
});

describe('ApolloServer executeOperation', () => {
  it('returns error information without details by default', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();

    const { result } = await server.executeOperation({
      query: 'query { error }',
    });

    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0].extensions).toStrictEqual({
      code: 'INTERNAL_SERVER_ERROR',
      someField: 'value',
    });
    await server.stop();
  });

  it('returns error information with details when debug is enabled', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      includeStacktraceInErrorResponses: true,
    });
    await server.start();

    const { result } = await server.executeOperation({
      query: 'query { error }',
    });

    expect(result.errors).toHaveLength(1);
    const extensions = result.errors?.[0].extensions;
    expect(extensions).toHaveProperty('code', 'INTERNAL_SERVER_ERROR');
    expect(extensions).toHaveProperty('stacktrace');
    expect(extensions).toHaveProperty('someField', 'value');
    await server.stop();
  });

  it('works with string', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();

    const { result } = await server.executeOperation({ query: '{ hello }' });
    expect(result.errors).toBeUndefined();
    expect(result.data?.hello).toBe('world');
    await server.stop();
  });

  it('works with AST', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();

    const { result } = await server.executeOperation({
      query: gql`
        {
          hello
        }
      `,
    });
    expect(result.errors).toBeUndefined();
    expect(result.data?.hello).toBe('world');
    await server.stop();
  });

  it('parse errors', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();

    const { result } = await server.executeOperation({ query: '{' });
    expect(result.errors).toEqual([
      {
        message: 'Syntax Error: Expected Name, found <EOF>.',
        locations: [{ line: 1, column: 2 }],
        extensions: {
          code: 'GRAPHQL_PARSE_FAILED',
        },
      },
    ]);
    await server.stop();
  });

  it('validation errors', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();

    const { result } = await server.executeOperation({ query: '{ unknown }' });
    expect(result.errors).toEqual([
      {
        message: 'Cannot query field "unknown" on type "Query".',
        locations: [{ line: 1, column: 3 }],
        extensions: {
          code: 'GRAPHQL_VALIDATION_FAILED',
        },
      },
    ]);
    await server.stop();
  });

  it('passes its second argument as context object', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();

    const { result } = await server.executeOperation(
      { query: '{ contextFoo }' },
      { foo: 'bla' },
    );
    expect(result.errors).toBeUndefined();
    expect(result.data?.contextFoo).toBe('bla');
    await server.stop();
  });

  describe('context generic typing', () => {
    it('typing for context objects works', async () => {
      const server = new ApolloServer<{ foo: number }>({
        typeDefs: 'type Query { n: Int!, n2: String! }',
        resolvers: {
          Query: {
            n(_parent: any, _args: any, context): number {
              return context.foo;
            },
            n2(_parent: any, _args: any, context): string {
              // It knows that context.foo is a number so it doesn't work as a string.
              // @ts-expect-error
              return context.foo;
            },
          },
        },
        plugins: [
          {
            // Works with plugins too!
            async requestDidStart({ contextValue }) {
              const n: number = contextValue.foo;
              // @ts-expect-error
              const s: string = contextValue.foo;
              // Make sure both variables are used (so the only expected error
              // is the type error).
              JSON.stringify({ n, s });
            },
          },
          // Plugins declared to be <BaseContext> still work.
          ApolloServerPluginCacheControlDisabled(),
        ],
      });
      await server.start();
      const { result } = await server.executeOperation(
        { query: '{ n }' },
        { foo: 123 },
      );
      expect(result.errors).toBeUndefined();
      expect(result.data?.n).toBe(123);

      const { result: result2 } = await server.executeOperation(
        { query: '{ n }' },
        // It knows that context.foo is a number so it doesn't work as a string.
        // @ts-expect-error
        { foo: 'asdf' },
      );
      // GraphQL will be sad that a string was returned from an Int! field.
      expect(result2.errors).toBeDefined();
      await server.stop();
    });

    // This works due to using `in` on the TContext generic.
    it('generic TContext argument is invariant (in out)', () => {
      // You cannot assign a server that wants a specific context to
      // one that wants a more vague context. That's because
      // `server1.executeOperation(request, {})` should typecheck, but that's
      // not good enough for the ApolloServer that expects its context to have
      // `foo` on it.
      // @ts-expect-error
      const server1: ApolloServer<{}> = new ApolloServer<{
        foo: number;
      }>({ typeDefs: 'type Query{id: ID}' });
      // avoid the expected error just being an unused variable
      expect(server1).toBeDefined();

      // The opposite is also not allowed, for a more subtle reason. If this
      // compiled, then you would be able to call `server2.addPlugin` with an
      // `ApolloServerPlugin<{foo: number}>`. That plugin is allowed to
      // assume that its hooks will be called with `contextValue` including
      // a `foo` field. But that's not the case for an `ApolloServer<{}>`!
      // So in fact, you shouldn't be able to assign an ApolloServer<X>
      // to ApolloServer<Y> when X and Y are different.
      // @ts-expect-error
      const server2: ApolloServer<{
        foo: number;
      }> = new ApolloServer<{}>({ typeDefs: 'type Query{id: ID}' });
      // avoid the expected error just being an unused variable
      expect(server2).toBeDefined();
    });

    it('typing for context objects works with argument to usage reporting', () => {
      new ApolloServer<{ foo: number }>({
        typeDefs: 'type Query { n: Int! }',
        plugins: [
          ApolloServerPluginUsageReporting({
            generateClientInfo({ contextValue }) {
              const n: number = contextValue.foo;
              // @ts-expect-error
              const s: string = contextValue.foo;
              // Make sure both variables are used (so the only expected error
              // is the type error).
              return {
                clientName: `client ${n} ${s}`,
              };
            },
          }),
        ],
      });

      // Don't start the server because we don't actually want any usage reporting.
    });

    it('typing for plugins works appropriately', () => {
      type SpecificContext = { someField: boolean };

      function takesPlugin<TContext extends BaseContext>(
        _p: ApolloServerPlugin<TContext>,
      ) {}

      const specificPlugin: ApolloServerPlugin<SpecificContext> = {
        async requestDidStart({ contextValue }) {
          console.log(contextValue.someField); // this doesn't actually run
        },
      };

      const basePlugin: ApolloServerPlugin<BaseContext> = {
        async requestDidStart({ contextValue }) {
          console.log(contextValue); // this doesn't actually run
        },
      };

      // @ts-expect-error
      takesPlugin<BaseContext>(specificPlugin);
      // @ts-expect-error
      takesPlugin<SpecificContext>(basePlugin);

      new ApolloServer<BaseContext>({
        typeDefs: 'type Query { x: ID }',
        // @ts-expect-error
        plugins: [specificPlugin],
      });
      new ApolloServer<SpecificContext>({
        typeDefs: 'type Query { x: ID }',
        // @ts-expect-error
        plugins: [basePlugin],
      });
    });
  });
});

describe('ApolloServer addPlugin', () => {
  it('can add a plugin before calling `start()`', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    expect(server['internals'].state.phase).toMatchInlineSnapshot(
      `"initialized"`,
    );
    server.addPlugin(failToStartPlugin);
    await expect(server.start()).rejects.toThrow('nope');
  });

  it('throws an error if you try to add a plugin after calling `start()`', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();

    expect(() =>
      server.addPlugin(failToStartPlugin),
    ).toThrowErrorMatchingInlineSnapshot(
      `"Can't add plugins after the server has started"`,
    );
    await server.stop();
  });
});
