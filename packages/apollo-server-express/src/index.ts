// Expose types which can be used by both middleware flavors.
export { GraphQLOptions, gql } from 'apollo-server-core';
export {
  ApolloError,
  toApolloError,
  SyntaxError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
} from 'apollo-server-core';

// Express Middleware
export {
  ExpressGraphQLOptionsFunction,
  ExpressHandler,
  ExpressGraphiQLOptionsFunction,
  graphqlExpress,
  graphiqlExpress,
} from './expressApollo';

// Connect Middleware
export { graphqlConnect, graphiqlConnect } from './connectApollo';

// ApolloServer integration
export { registerServer, ServerRegistration } from './ApolloServer';
