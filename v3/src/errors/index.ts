export {
  /* Interfaces */
  ErrorOptions, // { code?: string; errorClass?: typeof ApolloError; }

  /* ApolloErrors and its subclasses. */
  ApolloError,
  AuthenticationError,
  ForbiddenError,
  UserInputError,

  /* Still ApolloErrors but could possibly be internal. */
  PersistedQueryNotFoundError, // Internal?
  PersistedQueryNotSupportedError, // Internal?
  SyntaxError, // Internal?
  ValidationError, // Internal?

  hasPersistedQueryError,
  formatApolloErrors,
  fromGraphQLError,
  toApolloError,
} from 'apollo-server-errors';
