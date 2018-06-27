export { GraphQLOptions, gql } from 'apollo-server-core';

export {
  ApolloError,
  toApolloError,
  SyntaxError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from 'apollo-server-core';

export * from 'graphql-tools';

// ApolloServer integration.
export { ApolloServer, CreateHandlerOptions } from './ApolloServer';
