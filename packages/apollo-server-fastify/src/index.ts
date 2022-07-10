export {
  GraphQLOptions,
  Config,
  gql,
  Context,
  ContextFunction,
  PluginDefinition,
  CSRFPreventionOptions,
  // Errors
  ApolloError,
  toApolloError,
  SyntaxError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from 'apollo-server-core';

export {
  ApolloServer,
  ServerRegistration,
  FastifyPluginOptions,
  ApolloServerFastifyConfig,
  FastifyContext,
} from './ApolloServer';

export { FastifyCorsOptions } from '@fastify/cors';
