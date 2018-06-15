import 'apollo-server-env';
export { runQuery } from './runQuery';
export { LogFunction, LogMessage, LogStep, LogAction } from './logging';
export { runHttpQuery, HttpQueryRequest, HttpQueryError } from './runHttpQuery';
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
  BadUserInputError,
  formatApolloErrors,
} from './errors';

export { convertNodeHttpToRequest } from './nodeHttpToRequest';

// ApolloServer Base class
export { ApolloServerBase } from './ApolloServer';
export * from './types';

export * from 'graphql-tools';
export * from 'graphql-subscriptions';

//This currently provides the ability to have syntax highlighting as well as
//consistency between client and server gql tags
import { DocumentNode } from 'graphql';
import gqlTag from 'graphql-tag';
export const gql: (
  template: TemplateStringsArray,
  ...substitutions: any[]
) => DocumentNode = gqlTag;
