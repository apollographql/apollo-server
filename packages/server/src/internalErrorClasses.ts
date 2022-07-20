import { GraphQLError, GraphQLErrorOptions } from 'graphql';
import { ApolloServerErrorCode } from './errors/index.js';

// These error classes are not part of Apollo Server's external API; the
// ApolloServerErrorCode enum is (exported from `@apollo/server/errors`).

class GraphQLErrorWithCode extends GraphQLError {
  constructor(
    message: string,
    code: ApolloServerErrorCode,
    options?: GraphQLErrorOptions,
  ) {
    super(message, {
      ...options,
      extensions: { ...options?.extensions, code },
    });
    this.name = this.constructor.name;
  }
}

export class SyntaxError extends GraphQLErrorWithCode {
  constructor(graphqlError: GraphQLError) {
    super(graphqlError.message, ApolloServerErrorCode.GRAPHQL_PARSE_FAILED, {
      source: graphqlError.source,
      positions: graphqlError.positions,
      extensions: graphqlError.extensions,
      originalError: graphqlError,
    });
  }
}

export class ValidationError extends GraphQLErrorWithCode {
  constructor(graphqlError: GraphQLError) {
    super(
      graphqlError.message,
      ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
      {
        nodes: graphqlError.nodes,
        extensions: graphqlError.extensions,
        originalError: graphqlError.originalError ?? graphqlError,
      },
    );
  }
}

export class PersistedQueryNotFoundError extends GraphQLErrorWithCode {
  constructor() {
    super(
      'PersistedQueryNotFound',
      ApolloServerErrorCode.PERSISTED_QUERY_NOT_FOUND,
    );
  }
}

export class PersistedQueryNotSupportedError extends GraphQLErrorWithCode {
  constructor() {
    super(
      'PersistedQueryNotSupported',
      ApolloServerErrorCode.PERSISTED_QUERY_NOT_SUPPORTED,
    );
  }
}

export class UserInputError extends GraphQLErrorWithCode {
  constructor(graphqlError: GraphQLError) {
    super(graphqlError.message, ApolloServerErrorCode.BAD_USER_INPUT, {
      nodes: graphqlError.nodes,
      originalError: graphqlError.originalError ?? graphqlError,
      extensions: graphqlError.extensions,
    });
  }
}

export class OperationResolutionError extends GraphQLErrorWithCode {
  constructor(graphqlError: GraphQLError) {
    super(
      graphqlError.message,
      ApolloServerErrorCode.OPERATION_RESOLUTION_FAILURE,
      {
        nodes: graphqlError.nodes,
        originalError: graphqlError.originalError ?? graphqlError,
        extensions: graphqlError.extensions,
      },
    );
  }
}

export class BadRequestError extends GraphQLErrorWithCode {
  constructor(message: string) {
    super(message, ApolloServerErrorCode.BAD_REQUEST);
  }
}
