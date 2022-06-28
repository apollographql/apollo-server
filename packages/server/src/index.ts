export { ApolloServer } from './ApolloServer.js';
// Note that this is purely a type export.
export * from './externalTypes/index.js';

// TODO(AS4): consider moving to `@apollo/server/errors`
export {
  SyntaxError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  UserInputError,
  PersistedQueryNotFoundError,
} from './errors.js';
