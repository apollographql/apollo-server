import * as lambda from 'aws-lambda';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
} from 'apollo-server-core';

export interface LambdaGraphQLOptionsFunction {
  (event: lambda.APIGatewayProxyEvent, context: lambda.Context):
    | GraphQLOptions
    | Promise<GraphQLOptions>;
}

export function graphqlLambda(
  options: GraphQLOptions | LambdaGraphQLOptionsFunction,
): lambda.APIGatewayProxyHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler: lambda.APIGatewayProxyHandler = (
    event,
    context,
    callback,
  ): void => {
    if (event.httpMethod === 'POST' && !event.body) {
      return callback(null, {
        body: 'POST body missing.',
        statusCode: 500,
      });
    }
    runHttpQuery([event, context], {
      method: event.httpMethod,
      options: options,
      query:
        event.httpMethod === 'POST'
          ? JSON.parse(event.body)
          : (event.queryStringParameters as any),
      request: {
        url: event.path,
        method: event.httpMethod,
        headers: event.headers as any,
      },
    }).then(
      gqlResponse => {
        callback(null, {
          body: gqlResponse,
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      },
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) return callback(error);
        callback(null, {
          body: error.message,
          statusCode: error.statusCode,
          headers: error.headers,
        });
      },
    );
  };

  return graphqlHandler;
}
