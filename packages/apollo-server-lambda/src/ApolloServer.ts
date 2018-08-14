import * as lambda from 'aws-lambda';
import { ApolloServerBase } from 'apollo-server-core';
import { GraphQLOptions, Config } from 'apollo-server-core';
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html';

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

      const callbackFilter: lambda.APIGatewayProxyCallback = (
        error,
        result,
      ) => {
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

      graphqlLambda(this.createGraphQLServerOptions.bind(this))(
        event,
        context,
        callbackFilter,
      );
    };
  }
}
