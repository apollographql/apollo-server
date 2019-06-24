import lambda from 'aws-lambda';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
} from 'apollo-server-core';
import { Headers } from 'apollo-server-env';

export interface APIGatewayProxyAsyncHandler {
  (event: lambda.APIGatewayProxyEvent, context: lambda.Context): Promise<
    lambda.APIGatewayProxyResult
  >;
}

export function graphqlLambda(
  options: GraphQLOptions,
): APIGatewayProxyAsyncHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler: APIGatewayProxyAsyncHandler = async (
    event,
    context,
  ) => {
    if (event.httpMethod === 'POST' && !event.body) {
      return {
        body: 'POST body missing.',
        statusCode: 500,
      };
    }

    try {
      const { graphqlResponse, responseInit } = await runHttpQuery(
        [event, context],
        {
          method: event.httpMethod,
          options: options,
          query:
            event.httpMethod === 'POST' && event.body
              ? JSON.parse(event.body)
              : event.queryStringParameters,
          request: {
            url: event.path,
            method: event.httpMethod,
            headers: new Headers(event.headers),
          },
        },
      );

      return {
        body: graphqlResponse,
        statusCode: 200,
        headers: responseInit.headers,
      };
    } catch (error) {
      if (error instanceof HttpQueryError) {
        return {
          body: error.message,
          statusCode: error.statusCode,
          headers: error.headers,
        };
      }

      throw error;
    }
  };

  return graphqlHandler;
}
