import lambda from 'aws-lambda';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
  FileUploadOptions,
} from 'apollo-server-core';
import { Headers } from 'apollo-server-env';
import { processRequest as processFileUploads } from '@apollographql/apollo-upload-server';
import stream from 'stream';

export interface LambdaGraphQLOptionsFunction {
  (event: lambda.APIGatewayProxyEvent, context: lambda.Context):
    | GraphQLOptions
    | Promise<GraphQLOptions>;
}

const fileUploadProcess = async (
  event: any,
  uploadsConfig?: FileUploadOptions,
) => {
  const contentType =
    event.headers['content-type'] || event.headers['Content-Type'];

  if (contentType && contentType.startsWith('multipart/form-data')) {
    const request = new stream.Readable() as any;
    request.push(
      Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'ascii'),
    );
    request.push(null);
    request.headers = event.headers;
    request.headers['content-type'] = contentType;

    return await processFileUploads(request, uploadsConfig || {});
  }

  return event.body;
};

export function graphqlLambda(
  options: GraphQLOptions | LambdaGraphQLOptionsFunction,
  uploadsConfig?: FileUploadOptions,
): lambda.APIGatewayProxyHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 2) {
    throw new Error(
      `Apollo Server expects one or two argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler: lambda.APIGatewayProxyHandler = (
    event,
    context,
    callback,
  ): void => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (event.httpMethod === 'POST' && !event.body) {
      return callback(null, {
        body: 'POST body missing.',
        statusCode: 500,
      });
    }

    let query: any = event.queryStringParameters;
    if (event.httpMethod === 'POST' && event.body) {
      if (typeof event.body === 'string') {
        query = JSON.parse(event.body);
      } else {
        query = event.body;
      }
    }

    runHttpQuery([event, context], {
      method: event.httpMethod,
      options: options,
      query,
      request: {
        url: event.path,
        method: event.httpMethod,
        headers: new Headers(event.headers),
      },
    }).then(
      ({ graphqlResponse, responseInit }) => {
        callback(null, {
          body: graphqlResponse,
          statusCode: 200,
          headers: responseInit.headers,
        });
      })
      .then(
        ({ graphqlResponse, responseInit }) => {
          callback(null, {
            body: graphqlResponse,
            statusCode: 200,
            headers: responseInit.headers,
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
