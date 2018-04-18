import { GraphQLError } from 'graphql';
export interface ExceptionDetails {
  type?: string;
  code?: string;
  address?: string;
}
export interface ErrorInfo {
  code?: string;
  stack?: string;
  exception?: ExceptionDetails;
}

export class ApolloServerError extends Error {
  extensions: ErrorInfo;
  locations: any;
  path: any;
  constructor(err: GraphQLError, code: string) {
    super(err.message);
    this.locations = err.locations;
    this.path = err.path;
    this.extensions = { code, stack: this.stack };
  }
}

export class MalformedQuery extends ApolloServerError {
  constructor(err: GraphQLError) {
    super(err, 'MALFORMED_QUERY');
  }
}

export const formatError = (err: GraphQLError) => {
  let errorType = err;
  if (err.path === undefined) {
    return new MalformedQuery(err);
  }

  return errorType;
};
