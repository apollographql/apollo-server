export * from 'graphql-tools';
export * from 'graphql-subscriptions';
// this makes it easy to get inline formatting and highlighting without
// actually doing any work
export const gql = String.raw;

export {
  ApolloError,
  toApolloError,
  SyntaxError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-core';
