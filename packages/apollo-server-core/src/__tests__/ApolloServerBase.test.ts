import { ApolloServerBase } from '../ApolloServer';
import { buildServiceDefinition } from '@apollographql/apollo-tools';
import gql from 'graphql-tag';

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello() {
      return 'world';
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
    let serverBase;
    expect(
      () =>
        new ApolloServerBase({
          typeDefs,
          resolvers,
          engine: {
            graphVariant: 'foo',
            apiKey: 'not:real:key',
          },
        }).stop()
    ).not.toThrow();
  });

  it('spits out a deprecation warning when passed a schemaTag in construction', () => {
    const spyConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    expect(
      () =>
        new ApolloServerBase({
          typeDefs,
          resolvers,
          engine: {
            schemaTag: 'foo',
            apiKey: 'not:real:key',
          },
        }).stop()
    ).not.toThrow();
    expect(spyConsoleWarn).toBeCalled();
    spyConsoleWarn.mockRestore();
  });

  it('throws when passed a schemaTag and graphVariant in construction', () => {
    expect(
      () =>
        new ApolloServerBase({
          schema: buildServiceDefinition([{ typeDefs, resolvers }]).schema,
          engine: {
            schemaTag: 'foo',
            graphVariant: 'heck',
            apiKey: 'not:real:key',
          },
        }),
    ).toThrow();
  });

  it('throws when a GraphQLSchema is not provided to the schema configuration option', () => {
    expect(() => {
      new ApolloServerBase({
        schema: {},
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `"Unexpected error: Unable to resolve a valid GraphQLSchema.  Please file an issue with a reproduction of this error, if possible."`,
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

describe('environment variables', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    delete process.env.ENGINE_API_KEY;
    delete process.env.APOLLO_KEY;
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  it('constructs a reporting agent with the ENGINE_API_KEY (deprecated) environment variable and warns', async () => {
    // set the variables
    process.env.ENGINE_API_KEY = 'just:fake:stuff';
    const spyConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

    const server = new ApolloServerBase({
      typeDefs,
      resolvers
    });

    await server.stop();
    expect(spyConsoleWarn).toHaveBeenCalledTimes(1);
    spyConsoleWarn.mockReset();
  });

  it('warns with both the legacy env var and new env var set', async () => {
    // set the variables
    process.env.ENGINE_API_KEY = 'just:fake:stuff';
    process.env.APOLLO_KEY = 'also:fake:stuff';
    const spyConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();

    const server = new ApolloServerBase({
      typeDefs,
      resolvers
    });

    await server.stop();
    // Once for deprecation, once for double-set
    expect(spyConsoleWarn).toHaveBeenCalledTimes(2);
    spyConsoleWarn.mockReset();
  });
});
