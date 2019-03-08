import {
  HttpContext,
  FunctionRequest,
  FunctionResponse,
} from './azureFunctions';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
} from 'apollo-server-core';
import { Headers, ValueOrPromise } from 'apollo-server-env';

export interface AzureFunctionGraphQLOptionsFunction {
  (request: FunctionRequest, context: HttpContext): ValueOrPromise<
    GraphQLOptions
  >;
}

export interface AzureFunctionHandler {
  (
    context: HttpContext,
    request: FunctionRequest,
    callback: (err?: any, output?: FunctionResponse) => void,
  ): void;
}

export function graphqlAzureFunction(
  options: GraphQLOptions | AzureFunctionGraphQLOptionsFunction,
): AzureFunctionHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler: AzureFunctionHandler = (
    context,
    request,
    callback,
  ): void => {
    if (request.method === 'POST' && !request.body) {
      callback(null, {
        body: 'POST body missing.',
        status: 500,
      });
      return;
    }
    runHttpQuery([request, context], {
      method: request.method,
      options: options,
      query:
        request.method === 'POST' && request.body
          ? request.body
          : request.query,
      request: {
        url: request.originalUrl,
        method: request.method,
        headers: new Headers(request.headers),
      },
    }).then(
      ({ graphqlResponse, responseInit }) => {
        callback(null, {
          body: graphqlResponse,
          status: 200,
          headers: responseInit.headers,
        });
      },
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) {
          callback(error);
        } else {
          callback(null, {
            body: error.message,
            status: error.statusCode,
            headers: error.headers,
          });
        }
      },
    );
  };

  return graphqlHandler;
}
