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
  constructor(message, code) {
    super(message);
    this.locations = message.locations;
    this.path = message.path;
    this.extensions = { code, stack: this.stack };
  }
}

export class MalformedQuery extends ApolloServerError {
  constructor(message) {
    super(message, 'MALFORMED_QUERY');
  }
}

export const formatError = err => {
  let errorType = err;
  if (err.path === undefined) {
    return new MalformedQuery(err);
  }

  return errorType;
};
