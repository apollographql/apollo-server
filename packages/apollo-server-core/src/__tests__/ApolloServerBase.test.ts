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

  it('throws when a GraphQLSchema is not provided to the schema configuration option', () => {
    expect(() => {
      new ApolloServerBase({
        schema: {},
      });
    }).toThrowErrorMatchingInlineSnapshot(
      `"ApolloServer encountered a programming error. For some reason, we were unable to resolve a valid GraphQLSchema. Please open an issue on the apollo-server repo with a reproduction of this error if possible."`,
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
