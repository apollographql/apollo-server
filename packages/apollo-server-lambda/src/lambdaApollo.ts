import * as lambda from 'aws-lambda';
import { GraphQLOptions, runHttpQuery } from 'apollo-server-core';
import * as GraphiQL from 'apollo-server-module-graphiql';

export interface LambdaGraphQLOptionsFunction {
  (event: any, context: lambda.Context):
    | GraphQLOptions
    | Promise<GraphQLOptions>;
}

// Design principles:
// - there is just one way allowed: POST request with JSON body. Nothing else.
// - simple, fast and secure
//

export interface LambdaHandler {
  (event: any, context: lambda.Context, callback: lambda.Callback): void;
}

export interface IHeaders {
  [header: string]: string | number;
}

export function graphqlLambda(
  options: GraphQLOptions | LambdaGraphQLOptionsFunction,
): LambdaHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler = async (
    event,
    lambdaContext: lambda.Context,
    callback: lambda.Callback,
  ) => {
    let query =
        event.httpMethod === 'POST' ? event.body : event.queryStringParameters,
      statusCode: number = null,
      gqlResponse = null,
      headers: { [headerName: string]: string } = {};

    if (query && typeof query === 'string') {
      query = JSON.parse(query);
    }

    try {
      gqlResponse = await runHttpQuery([event, lambdaContext], {
        method: event.httpMethod,
        options: options,
        query: query,
      });
      headers['Content-Type'] = 'application/json';
      statusCode = 200;
    } catch (error) {
      if ('HttpQueryError' !== error.name) {
        throw error;
      }

      headers = error.headers;
      statusCode = error.statusCode;
      gqlResponse = error.message;
    } finally {
      callback(null, {
        statusCode: statusCode,
        headers: headers,
        body: gqlResponse,
      });
    }
  };

  return graphqlHandler;
}

export interface LambdaGraphiQLOptionsFunction {
  (event: any, context: lambda.Context):
    | GraphiQL.GraphiQLData
    | Promise<GraphiQL.GraphiQLData>;
}

/* This Lambda Function Handler returns the html for the GraphiQL interactive query UI
 *
 * GraphiQLData arguments
 *
 * - endpointURL: the relative or absolute URL for the endpoint which GraphiQL will make queries to
 * - (optional) query: the GraphQL query to pre-fill in the GraphiQL UI
 * - (optional) variables: a JS object of variables to pre-fill in the GraphiQL UI
 * - (optional) operationName: the operationName to pre-fill in the GraphiQL UI
 * - (optional) result: the result of the query to pre-fill in the GraphiQL UI
 */

export function graphiqlLambda(
  options: GraphiQL.GraphiQLData | LambdaGraphiQLOptionsFunction,
) {
  const graphiqlHandler = (
    event,
    lambdaContext: lambda.Context,
    callback: lambda.Callback,
  ) => {
    const query = event.queryStringParameters;
    GraphiQL.resolveGraphiQLString(query, options, event, lambdaContext).then(
      graphiqlString => {
        callback(null, {
          statusCode: 200,
          headers: {
            'Content-Type': 'text/html',
          },
          body: graphiqlString,
        });
      },
      error => {
        callback(null, {
          statusCode: 500,
          body: error.message,
        });
      },
    );
  };

  return graphiqlHandler;
}
