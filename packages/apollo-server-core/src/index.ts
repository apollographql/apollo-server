import 'apollo-server-env';

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
export * from './requestPipelineAPI';

// This currently provides the ability to have syntax highlighting as well as
// consistency between client and server gql tags
import { DocumentNode } from 'graphql';
import gqlTag from 'graphql-tag';
export const gql: (
  template: TemplateStringsArray | string,
  ...substitutions: any[]
) => DocumentNode = gqlTag;

import runtimeSupportsUploads from './utils/runtimeSupportsUploads';
import { GraphQLScalarType } from 'graphql';
export { default as processFileUploads } from './processFileUploads';

// This is a conditional export intended to avoid traversing the
// entire module tree of `graphql-upload`.  This only defined if the
// version of Node.js is >= 8.5.0 since those are the only Node.js versions
// which are supported by `graphql-upload@8`.  Since the source of
// `graphql-upload` is not transpiled for older targets (in fact, it includes
// experimental ECMAScript modules), this conditional export is necessary
// to avoid modern ECMAScript from failing to parse by versions of Node.js
// which don't support it (yet — eg. Node.js 6 and async/await).
export const GraphQLUpload = runtimeSupportsUploads
  ? (require('graphql-upload').GraphQLUpload as GraphQLScalarType)
  : undefined;
