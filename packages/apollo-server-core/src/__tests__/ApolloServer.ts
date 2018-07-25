import { ApolloServerBase, gql } from '../';

const typeDefs = gql`
  type Query {
    hello(world: String): String
    usingContext: String
    usingDataSource: String
  }
`;

const resolvers = {
  Query: {
    hello: (_, { world }) => `Hello, ${world}`,
    usingContext: (_, __, { foo }) => foo,
    usingDataSource: (_, __, { dataSources: { foo } }) => foo.bar(),
  },
};

describe('ApolloServerBase > execute', () => {
  const server = new ApolloServerBase({
    typeDefs,
    resolvers,
    context: () => ({ foo: 'bar' }),
    dataSources: () => ({
      foo: { bar: () => 'baz' },
    }),
  });

  it('allows execution of query', async () => {
    const query = gql`
      query test($world: String) {
        hello(world: $world)
        usingContext
        usingDataSource
      }
    `;

    const res = await server.execute({
      query,
      variables: { world: 'Apollo' },
    });

    // expect(res).toEqual({ data: { hello: 'Hello, Apollo' } });
    expect(res).toEqual({
      data: {
        hello: 'Hello, Apollo',
        usingContext: 'bar',
        usingDataSource: 'baz',
      },
    });
  });
});
