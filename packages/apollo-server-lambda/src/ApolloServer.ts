import lambda from 'aws-lambda';
import { ApolloServerBase, formatApolloErrors } from 'apollo-server-core';
import {
  GraphQLOptions,
  Config,
  FileUploadOptions,
  processFileUploads,
} from 'apollo-server-core';
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html';
import stream, { Stream } from 'stream';

import { graphqlLambda } from './lambdaApollo';

export interface CreateHandlerOptions {
  cors?: {
    origin?: boolean | string | string[];
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
  };
  uploadsConfig?: FileUploadOptions;
}

export class ApolloServer extends ApolloServerBase {
  // If you feel tempted to add an option to this constructor. Please consider
  // another place, since the documentation becomes much more complicated when
  // the constructor is not longer shared between all integration
  constructor(options: Config) {
    if (process.env.ENGINE_API_KEY || options.engine) {
      options.engine = {
        sendReportsImmediately: true,
        ...(typeof options.engine !== 'boolean' ? options.engine : {}),
      };
    }
    super(options);
  }

  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  createGraphQLServerOptions(
    event: lambda.APIGatewayProxyEvent,
    context: lambda.Context,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ event, context });
  }

  public createHandler({ cors }: CreateHandlerOptions = { cors: undefined }) {
    // We will kick off the `willStart` event once for the server, and then
    // await it before processing any requests by incorporating its `await` into
    // the GraphQLServerOptions function which is called before each request.
    const promiseWillStart = this.willStart();

    const corsHeaders: lambda.APIGatewayProxyResult['headers'] = {};

    if (cors) {
      if (cors.methods) {
        if (typeof cors.methods === 'string') {
          corsHeaders['Access-Control-Allow-Methods'] = cors.methods;
        } else if (Array.isArray(cors.methods)) {
          corsHeaders['Access-Control-Allow-Methods'] = cors.methods.join(',');
        }
      }

      if (cors.allowedHeaders) {
        if (typeof cors.allowedHeaders === 'string') {
          corsHeaders['Access-Control-Allow-Headers'] = cors.allowedHeaders;
        } else if (Array.isArray(cors.allowedHeaders)) {
          corsHeaders[
            'Access-Control-Allow-Headers'
          ] = cors.allowedHeaders.join(',');
        }
      }

      if (cors.exposedHeaders) {
        if (typeof cors.exposedHeaders === 'string') {
          corsHeaders['Access-Control-Expose-Headers'] = cors.exposedHeaders;
        } else if (Array.isArray(cors.exposedHeaders)) {
          corsHeaders[
            'Access-Control-Expose-Headers'
          ] = cors.exposedHeaders.join(',');
        }
      }

      if (cors.credentials) {
        corsHeaders['Access-Control-Allow-Credentials'] = 'true';
      }
      if (cors.maxAge) {
        corsHeaders['Access-Control-Max-Age'] = cors.maxAge;
      }
    }

    return (
      event: lambda.APIGatewayProxyEvent,
      context: lambda.Context,
      callback: lambda.APIGatewayProxyCallback,
    ) => {
      if (cors && cors.origin) {
        if (typeof cors.origin === 'string') {
          corsHeaders['Access-Control-Allow-Origin'] = cors.origin;
        } else if (
          typeof cors.origin === 'boolean' ||
          (Array.isArray(cors.origin) &&
            cors.origin.includes(
              event.headers['Origin'] || event.headers['origin'],
            ))
        ) {
          corsHeaders['Access-Control-Allow-Origin'] =
            event.headers['Origin'] || event.headers['origin'];
        }

        if (!cors.allowedHeaders) {
          corsHeaders['Access-Control-Allow-Headers'] =
            event.headers['Access-Control-Request-Headers'];
        }
      }

      if (event.httpMethod === 'OPTIONS') {
        return callback(null, {
          body: '',
          statusCode: 204,
          headers: corsHeaders,
        });
      }

      if (this.playgroundOptions && event.httpMethod === 'GET') {
        const acceptHeader = event.headers['Accept'] || event.headers['accept'];
        if (acceptHeader && acceptHeader.includes('text/html')) {
          const path =
            event.path ||
            (event.requestContext && event.requestContext.path) ||
            '/';

          const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
            endpoint: path,
            ...this.playgroundOptions,
          };

          return callback(null, {
            body: renderPlaygroundPage(playgroundRenderPageOptions),
            statusCode: 200,
            headers: {
              'Content-Type': 'text/html',
              ...corsHeaders,
            },
          });
        }
      }

      const makeCallbackFilter = (
        doneFn: any,
      ): lambda.APIGatewayProxyCallback => {
        return (error, result) => {
          doneFn();
          callback(
            error,
            result && {
              ...result,
              headers: {
                ...result.headers,
                ...corsHeaders,
              },
            },
          );
        };
      };

      const response = new Stream.Writable();

      fileUploadProcess(event, response, this.uploadsConfig || {})
        .then((body: any) => {
          event.body = body;
          graphqlLambda(async () => {
            // In a world where this `createHandler` was async, we might avoid this
            // but since we don't want to introduce a breaking change to this API
            // (by switching it to `async`), we'll leverage the
            // `GraphQLServerOptions`, which are dynamically built on each request,
            // to `await` the `promiseWillStart` which we kicked off at the top of
            // this method to ensure that it runs to completion (which is part of
            // its contract) prior to processing the request.
            await promiseWillStart;
            return this.createGraphQLServerOptions(event, context);
          })(
            event,
            context,
            makeCallbackFilter(() => {
              response.end();
            }),
          );
        })
        .catch(error => {
          throw formatApolloErrors([error], {
            formatter: this.requestOptions.formatError,
            debug: this.requestOptions.debug,
          });
        });
    };
  }
}

const fileUploadProcess = (
  event: any,
  response: any,
  uploadsConfig: FileUploadOptions,
) => {
  return new Promise((resolve, reject) => {
    const contentType =
      event.headers['content-type'] || event.headers['Content-Type'];

    if (
      typeof processFileUploads === 'function' &&
      contentType &&
      contentType.startsWith('multipart/form-data')
    ) {
      const request = new stream.Readable() as any;
      request.push(
        Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'ascii'),
      );
      request.push(null);
      request.headers = event.headers;
      request.headers['content-type'] = contentType;

      processFileUploads(request, response, uploadsConfig)
        .then(body => {
          resolve(body);
        })
        .catch(error => {
          reject(error);
        });
    } else {
      resolve(event.body);
    }
  });
};
