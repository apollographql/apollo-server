import 'apollo-server-env';

export { runQuery } from './runQuery';
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
  UserInputError,
  formatApolloErrors,
} from 'apollo-server-errors';

export { convertNodeHttpToRequest } from './nodeHttpToRequest';

export {
  createPlaygroundOptions,
  PlaygroundConfig,
  defaultPlaygroundOptions,
  PlaygroundRenderPageOptions,
} from './playground';

// ApolloServer Base class
export { ApolloServerBase } from './ApolloServer';
export * from './types';

// This currently provides the ability to have syntax highlighting as well as
// consistency between client and server gql tags
import { DocumentNode } from 'graphql';
import gqlTag from 'graphql-tag';
export const gql: (
  template: TemplateStringsArray | string,
  ...substitutions: any[]
) => DocumentNode = gqlTag;

import { GraphQLScalarType } from 'graphql';
import { GraphQLUpload as UploadScalar } from 'apollo-upload-server';
export const GraphQLUpload = UploadScalar as GraphQLScalarType;
