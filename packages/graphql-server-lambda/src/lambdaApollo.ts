import * as lambda from 'aws-lambda';
import { GraphQLOptions, runHttpQuery } from 'graphql-server-core';
import * as GraphiQL from 'graphql-server-module-graphiql';

export interface LambdaGraphQLOptionsFunction {
  (event: any, context: lambda.Context): GraphQLOptions | Promise<GraphQLOptions>;
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

export function graphqlLambda( options: GraphQLOptions | LambdaGraphQLOptionsFunction ): LambdaHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    throw new Error(`Apollo Server expects exactly one argument, got ${arguments.length}`);
  }

  return async (event, lambdaContext: lambda.Context, callback: lambda.Callback) => {
    let query = (event.httpMethod === 'POST') ? event.body : event.queryStringParameters,
      statusCode: number = null,
      gqlResponse = null,
      headers: {[headerName: string]: string} = {};

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
      if ( 'HttpQueryError' !== error.name ) {
        throw error;
      }

      headers = error.headers;
      statusCode = error.statusCode;
      gqlResponse = error.message;
    } finally {
      callback(
        null,
        {
          'statusCode': statusCode,
          'headers': headers,
          'body': gqlResponse,
        },
      );
    }
  };
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

export function graphiqlLambda(options: GraphiQL.GraphiQLData) {
  return (event, lambdaContext: lambda.Context, callback: lambda.Callback) => {
    const q = event.queryStringParameters || {};
    const query = q.query || '';
    const variables = q.variables || '{}';
    const operationName = q.operationName || '';

    const graphiQLString = GraphiQL.renderGraphiQL({
      endpointURL: options.endpointURL,
      query: query || options.query,
      variables: q.variables && JSON.parse(variables) || options.variables,
      operationName: operationName || options.operationName,
      passHeader: options.passHeader,
    });
    callback(
      null,
      {
        'statusCode': 200,
        'headers': {
          'Content-Type': 'text/html',
        },
        'body': graphiQLString,
      },
    );
  };
}
