import lambda from 'aws-lambda';
import {
  formatApolloErrors,
  GraphQLOptions,
  HttpQueryError,
  processFileUploads,
  runHttpQuery
} from 'apollo-server-core';
import { Headers } from 'apollo-server-env';
import { ValueOrPromise } from 'apollo-server-types';
import stream from 'stream'

export interface LambdaGraphQLOptionsFunction {
  (event: lambda.APIGatewayProxyEvent, context: lambda.Context): ValueOrPromise<
    GraphQLOptions
  >;
}

export function graphqlLambda(
  options: GraphQLOptions | LambdaGraphQLOptionsFunction,
  serverParams: any
): lambda.APIGatewayProxyHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 2) {
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
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

    const runQuery = (query:any) => {
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

    const contentType =
    event.headers["content-type"] || event.headers["Content-Type"];
    if (event.httpMethod === 'POST' && event.body){
      const request = new stream.Readable() as any;
      if (
        typeof processFileUploads === "function" &&
        contentType &&
        contentType.startsWith("multipart/form-data")
      ){
        request.push(
          Buffer.from(
            <any>event.body,
            event.isBase64Encoded ? "base64" : "ascii"
          )
        );
        request.push(null);
        request.headers = event.headers;
        request.headers["content-type"] = contentType;

        processFileUploads(request, serverParams.response, serverParams.uploadsConfig)
        .then((body: any) => {
          runQuery(body);
        })
        .catch(error => {
          throw formatApolloErrors([error], {
            formatter: serverParams.requestOptions.formatError,
            debug: serverParams.requestOptions.debug,
          });
        });
      } else {
        runQuery(JSON.parse(event.body));
      }
    } else {
      runQuery(event.queryStringParameters);
    }
  };
  return graphqlHandler;
}
