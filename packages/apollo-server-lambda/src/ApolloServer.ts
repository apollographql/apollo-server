import * as lambda from 'aws-lambda';
import { ApolloServerBase } from 'apollo-server-core';
export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';
import { GraphQLOptions } from 'apollo-server-core';
import {
  MiddlewareOptions as PlaygroundMiddlewareOptions,
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from 'graphql-playground-html';

import { graphqlLambda } from './lambdaApollo';

export interface CreateHandlerOptions {
  gui?: boolean | PlaygroundMiddlewareOptions;
  cors?: {
    origin?: boolean | string | string[];
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
  };
}

export class ApolloServer extends ApolloServerBase {
  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  createGraphQLServerOptions(
    event: lambda.APIGatewayProxyEvent,
    context: lambda.Context,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ event, context });
  }

  // Added "= { gui: undefined }" to fix "module initialization error: TypeError"
  public createHandler(
    { gui, cors }: CreateHandlerOptions = { gui: undefined, cors: undefined },
  ) {
    const guiEnabled =
      !!gui || (gui === undefined && process.env.NODE_ENV !== 'production');

    const corsHeaders = {};

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
      }

      if (guiEnabled && event.httpMethod === 'GET') {
        const acceptHeader = event.headers['Accept'] || event.headers['accept'];
        if (acceptHeader && acceptHeader.includes('text/html')) {
          const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
            endpoint: event.requestContext.path,
            ...(typeof gui === 'boolean' ? {} : gui),
            version: '1.7.0',
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

      const callbackFilter: lambda.APIGatewayProxyCallback = (
        error,
        result,
      ) => {
        callback(error, {
          ...result,
          headers: {
            ...result.headers,
            ...corsHeaders,
          },
        });
      };

      graphqlLambda(this.createGraphQLServerOptions.bind(this))(
        event,
        context,
        callbackFilter,
      );
    };
  }
}
