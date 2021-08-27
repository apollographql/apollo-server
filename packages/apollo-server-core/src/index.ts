export {
  runHttpQuery,
  HttpQueryRequest,
  HttpQueryError,
  isHttpQueryError,
} from './runHttpQuery';

export {
  default as GraphQLOptions,
  resolveGraphqlOptions,
  PersistedQueryOptions,
} from './graphqlOptions';

export {
  ApolloError,
  toApolloError,
  SyntaxError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  UserInputError,
  formatApolloErrors,
} from 'apollo-server-errors';

export { convertNodeHttpToRequest } from './nodeHttpToRequest';

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
} from 'apollo-server-types';

// This currently provides the ability to have syntax highlighting as well as
// consistency between client and server gql tags
import type { DocumentNode } from 'graphql';
import gqlTag from 'graphql-tag';
export const gql: (
  template: TemplateStringsArray | string,
  ...substitutions: any[]
) => DocumentNode = gqlTag;

export * from './plugin';
