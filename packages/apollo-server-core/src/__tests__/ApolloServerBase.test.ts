import { ApolloServerBase } from '../ApolloServer';
import { buildServiceDefinition } from '@apollographql/apollo-tools';
import { gql } from '../';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import type { GraphQLSchema } from 'graphql';
import { Logger } from 'apollo-server-types';

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

describe('ApolloServerBase construction', () => {
  it('succeeds when a valid configuration options are provided to typeDefs and resolvers', () => {
    expect(() => new ApolloServerBase({ typeDefs, resolvers })).not.toThrow();
  });

  it('succeeds when a valid GraphQLSchema is provided to the schema configuration option', () => {
    expect(
      () =>
        new ApolloServerBase({
          schema: buildServiceDefinition([{ typeDefs, resolvers }]).schema,
        }),
    ).not.toThrow();
  });

  it('succeeds when passed a graphVariant in construction', () => {
    const warn = jest.fn();
    const logger: Logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn,
      error: jest.fn(),
    };
    expect(() =>
      new ApolloServerBase({
        typeDefs,
        resolvers,
        apollo: {
          graphVariant: 'foo',
          key: 'service:real:key',
        },
        logger,
      }).stop(),
    ).not.toThrow();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(
      /Apollo key but have not specified a graph ref/,
    );
  });

  it('throws when a GraphQLSchema is not provided to the schema configuration option', () => {
    expect(() => {
      new ApolloServerBase({
        schema: {} as GraphQLSchema,
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `"Expected {} to be a GraphQL schema."`,
    );
  });

  it('throws when the no schema configuration option is provided', () => {
    expect(() => {
      new ApolloServerBase({});
    }).toThrowErrorMatchingInlineSnapshot(
      `"Apollo Server requires either an existing schema, modules or typeDefs"`,
    );
  });
});

describe('ApolloServerBase start', () => {
  const failToStartPlugin: ApolloServerPlugin = {
    async serverWillStart() {
      throw Error('nope');
    },
  };
  const redactedMessage =
    'This data graph is missing a valid configuration. More details may be available in the server logs.';

  it('start throws on startup error', async () => {
    const server = new ApolloServerBase({
      typeDefs,
      resolvers,
      plugins: [failToStartPlugin],
    });
    await expect(server.start()).rejects.toThrow('nope');
  });

  // This is specific to serverless because on server-ful frameworks, you can't
  // get to executeOperation without server.start().
  it('execute throws redacted message on serverless startup error', async () => {
    const error = jest.fn();
    const logger: Logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error,
    };

    class ServerlessApolloServer extends ApolloServerBase {
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

describe('ApolloServerBase executeOperation', () => {
  it('returns error information without details by default', async () => {
    const server = new ApolloServerBase({
      typeDefs,
      resolvers,
    });
    await server.start();

    const result = await server.executeOperation({ query: 'query { error }' });

    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0].extensions).toStrictEqual({
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  it('returns error information with details when debug is enabled', async () => {
    const server = new ApolloServerBase({
      typeDefs,
      resolvers,
      debug: true,
    });
    await server.start();

    const result = await server.executeOperation({ query: 'query { error }' });

    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0].extensions?.code).toBe('INTERNAL_SERVER_ERROR');
    expect(result.errors?.[0].extensions?.exception?.stacktrace).toBeDefined();
  });

  it('works with string', async () => {
    const server = new ApolloServerBase({
      typeDefs,
      resolvers,
    });
    await server.start();

    const result = await server.executeOperation({ query: '{ hello }' });
    expect(result.errors).toBeUndefined();
    expect(result.data?.hello).toBe('world');
  });

  it('works with AST', async () => {
    const server = new ApolloServerBase({
      typeDefs,
      resolvers,
    });
    await server.start();

    const result = await server.executeOperation({
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
    const server = new ApolloServerBase({
      typeDefs,
      resolvers,
    });
    await server.start();

    const result = await server.executeOperation({ query: '{' });
    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0].extensions?.code).toBe('GRAPHQL_PARSE_FAILED');
  });

  it('passes its second argument to context function', async () => {
    const server = new ApolloServerBase({
      typeDefs,
      resolvers,
      context: ({ fooIn }) => ({ foo: fooIn }),
    });
    await server.start();

    const result = await server.executeOperation(
      { query: '{ contextFoo }' },
      { fooIn: 'bla' },
    );
    expect(result.errors).toBeUndefined();
    expect(result.data?.contextFoo).toBe('bla');
  });
});
