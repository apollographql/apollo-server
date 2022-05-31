import { ApolloServer } from '../ApolloServer';
import { ApolloServerOptions, GatewayInterface, gql } from '..';
import type { GraphQLSchema } from 'graphql';
import type { ApolloServerPlugin, BaseContext } from '../externalTypes';
import {
  ApolloServerPluginCacheControlDisabled,
  ApolloServerPluginUsageReporting,
} from '../plugin';
import { makeExecutableSchema } from '@graphql-tools/schema';

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
      throw new Error('A test error');
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

  it('succeeds when passed a graphVariant in construction', () => {
    const warn = jest.fn();
    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn,
      error: jest.fn(),
    };
    expect(
      () =>
        new ApolloServer({
          typeDefs,
          resolvers,
          apollo: {
            graphVariant: 'foo',
            key: 'service:real:key',
          },
          logger,
        }),
    ).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(
      /Apollo key but have not specified a graph ref/,
    );
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
  const redactedMessage =
    'This data graph is missing a valid configuration. More details may be available in the server logs.';

  it('start throws on startup error', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      plugins: [failToStartPlugin],
    });
    await expect(server.start()).rejects.toThrow('nope');
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

  // This is specific to serverless because on server-ful frameworks, you can't
  // get to executeOperation without server.start().
  it('execute throws redacted message on serverless startup error', async () => {
    const error = jest.fn();
    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error,
    };

    class ServerlessApolloServer extends ApolloServer<BaseContext> {
      override serverlessFramework() {
        return true;
      }
    }

    const server = new ServerlessApolloServer({
      typeDefs,
      resolvers,
      plugins: [failToStartPlugin],
      logger,
    });
    // Run the operation twice. We want to see the same error thrown and log
    // message for the "kick it off" call as the subsequent call.
    await expect(
      server.executeOperation({ query: '{__typename}' }),
    ).rejects.toThrow(redactedMessage);
    await expect(
      server.executeOperation({ query: '{__typename}' }),
    ).rejects.toThrow(redactedMessage);

    // Three times: once for the actual background _start call, twice for the
    // two operations.
    expect(error).toHaveBeenCalledTimes(3);
    for (const [message] of error.mock.calls) {
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
    });
  });

  it('returns error information with details when debug is enabled', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      includeStackTracesInErrorResponses: true,
    });
    await server.start();

    const { result } = await server.executeOperation({
      query: 'query { error }',
    });

    expect(result.errors).toHaveLength(1);
    const extensions = result.errors?.[0].extensions;
    expect(extensions).toHaveProperty('code', 'INTERNAL_SERVER_ERROR');
    expect(extensions).toHaveProperty('exception.stacktrace');
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
  });

  it('parse errors', async () => {
    const server = new ApolloServer({
      typeDefs,
      resolvers,
    });
    await server.start();

    const { result } = await server.executeOperation({ query: '{' });
    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0].extensions?.code).toBe('GRAPHQL_PARSE_FAILED');
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
              let n: number = contextValue.foo;
              // @ts-expect-error
              let s: string = contextValue.foo;
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
    });

    // This works due to the __forceTContextToBeContravariant hack.
    it('context is contravariant', () => {
      // @ts-expect-error
      const server1: ApolloServer<{}> = new ApolloServer<{
        foo: number;
      }>({ typeDefs: 'type Query{id: ID}' });
      // avoid the expected error just being an unused variable
      expect(server1).toBeDefined();

      // The opposite is OK: we can pass a more specific context object to
      // something expecting less.
      const server2: ApolloServer<{
        foo: number;
      }> = new ApolloServer<{}>({ typeDefs: 'type Query{id: ID}' });
      expect(server2).toBeDefined();
    });

    it('typing for context objects works with argument to usage reporting', () => {
      new ApolloServer<{ foo: number }>({
        typeDefs: 'type Query { n: Int! }',
        plugins: [
          ApolloServerPluginUsageReporting({
            generateClientInfo({ contextValue }) {
              let n: number = contextValue.foo;
              // @ts-expect-error
              let s: string = contextValue.foo;
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
      takesPlugin<SpecificContext>(basePlugin);

      new ApolloServer<BaseContext>({
        typeDefs: 'type Query { x: ID }',
        // @ts-expect-error
        plugins: [specificPlugin],
      });
      new ApolloServer<SpecificContext>({
        typeDefs: 'type Query { x: ID }',
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
  });
});
