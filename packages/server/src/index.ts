// TODO(AS4): Evaluate the full exposed API.

export { HttpQueryError, isHttpQueryError } from './runHttpQuery';

export {
  ApolloError,
  toApolloError,
  SyntaxError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  UserInputError,
  formatApolloErrors,
} from './errors';

// ApolloServer Base class
export { ApolloServerBase } from './ApolloServer';
export * from './types';
export {
  GraphQLServiceContext,
  GraphQLRequest,
  VariableValues,
  GraphQLResponse,
  GraphQLRequestMetrics,
  GraphQLRequestContext,
  ValidationRule,
  GraphQLExecutor,
  GraphQLExecutionResult,
} from '@apollo/server-types';

// TODO(AS4): Why re-export graphql-tag?
export * from './gql';
export * from './plugin';
