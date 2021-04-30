import { ApolloServerBase } from '../ApolloServer';
import { buildServiceDefinition } from '@apollographql/apollo-tools';
import gql from 'graphql-tag';
import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import type { GraphQLSchema } from 'graphql';

const typeDefs = gql`
  type Query {
    hello: String
    error: Boolean
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
    expect(() =>
      new ApolloServerBase({
        typeDefs,
        resolvers,
        engine: {
          graphVariant: 'foo',
          apiKey: 'not:real:key',
        },
      }).stop(),
    ).not.toThrow();
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

  it('execute throws redacted message on implicit startup error', async () => {
    const error = jest.fn();
    const logger: Logger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error,
    };

    const server = new ApolloServerBase({
      typeDefs,
      resolvers,
      plugins: [failToStartPlugin],
      logger,
    });
    // Run the operation twice (the first will kick off the start process). We
    // want to see the same error thrown and log message for the "kick it off"
    // call as the subsequent call.
    await expect(
      server.executeOperation({ query: '{__typename}' }),
    ).rejects.toThrow(redactedMessage);
    await expect(
      server.executeOperation({ query: '{__typename}' }),
    ).rejects.toThrow(redactedMessage);
    expect(error).toHaveBeenCalledTimes(2);
    expect(error.mock.calls[0][0]).toMatch(
      /Apollo Server was started implicitly.*nope/,
    );
    expect(error.mock.calls[1][0]).toMatch(
      /Apollo Server was started implicitly.*nope/,
    );
  });
});

describe('ApolloServerBase executeOperation', () => {
  it('returns error information without details by default', async () => {
    const server = new ApolloServerBase({
      typeDefs,
      resolvers,
    });

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

    const result = await server.executeOperation({ query: 'query { error }' });

    expect(result.errors).toHaveLength(1);
    expect(result.errors?.[0].extensions?.code).toBe('INTERNAL_SERVER_ERROR');
    expect(result.errors?.[0].extensions?.exception?.stacktrace).toBeDefined();
  });
});
