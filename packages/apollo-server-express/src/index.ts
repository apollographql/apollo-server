// Expose types which can be used by both middleware flavors.
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

// ApolloServer integration
export {
  ApolloServer,
  registerServer,
  ServerRegistration,
} from './ApolloServer';
