import type { Context, HttpRequest, AzureFunction } from '@azure/functions';
import {
  GraphQLOptions,
  isHttpQueryError,
  runHttpQuery,
} from 'apollo-server-core';
import { Headers } from 'apollo-server-env';
import type { ValueOrPromise } from 'apollo-server-types';

export interface AzureFunctionGraphQLOptionsFunction {
  (request: HttpRequest, context: Context): ValueOrPromise<GraphQLOptions>;
}

export function graphqlAzureFunction(
  options: GraphQLOptions | AzureFunctionGraphQLOptionsFunction,
): AzureFunction {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler: AzureFunction = (context, request, callback): void => {
    if (request.method === 'POST' && !request.body) {
      callback(null, {
        body: 'POST body missing.',
        status: 400,
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
        url: request.url,
        method: request.method,
        headers: new Headers(request.headers),
      },
    }).then(
      ({ graphqlResponse, responseInit }) => {
        callback(null, {
          body: graphqlResponse,
          status: responseInit.status || 200,
          headers: responseInit.headers,
        });
      },
      (error: Error) => {
        if (isHttpQueryError(error)) {
          callback(null, {
            body: error.message,
            status: error.statusCode,
            headers: error.headers,
          });
        } else {
          callback(error);
        }
      },
    );
  };

  return graphqlHandler;
}
