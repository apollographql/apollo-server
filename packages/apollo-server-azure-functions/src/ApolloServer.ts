import { Context, HttpRequest } from '@azure/functions';
import { HttpResponse } from 'azure-functions-ts-essentials';
import { ApolloServerBase } from 'apollo-server-core';
import { GraphQLOptions, Config } from 'apollo-server-core';
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html';

import { graphqlAzureFunction } from './azureFunctionApollo';

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
    request: HttpRequest,
    context: Context,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ request, context });
  }

  public createHandler({ cors }: CreateHandlerOptions = { cors: undefined }) {
    // We will kick off the `willStart` event once for the server, and then
    // await it before processing any requests by incorporating its `await` into
    // the GraphQLServerOptions function which is called before each request.
    const promiseWillStart = this.willStart();

    const corsHeaders: HttpResponse['headers'] = {};

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

    return (context: Context, req: HttpRequest) => {
      if (cors && cors.origin) {
        if (typeof cors.origin === 'string') {
          corsHeaders['Access-Control-Allow-Origin'] = cors.origin;
        } else if (
          typeof cors.origin === 'boolean' ||
          (Array.isArray(cors.origin) &&
            cors.origin.includes(
              req.headers['Origin'] || req.headers['origin'],
            ))
        ) {
          corsHeaders['Access-Control-Allow-Origin'] =
            req.headers['Origin'] || req.headers['origin'];
        }

        if (!cors.allowedHeaders) {
          corsHeaders['Access-Control-Allow-Headers'] =
            req.headers['Access-Control-Request-Headers'];
        }
      }

      if (req.method === 'OPTIONS') {
        context.done(null, {
          body: '',
          status: 204,
          headers: corsHeaders,
        });
        return;
      }

      if (this.playgroundOptions && req.method === 'GET') {
        const acceptHeader = req.headers['Accept'] || req.headers['accept'];
        if (acceptHeader && acceptHeader.includes('text/html')) {
          const path = req.url || '/';

          const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
            endpoint: path,
            ...this.playgroundOptions,
          };
          const body = renderPlaygroundPage(playgroundRenderPageOptions);
          context.done(null, {
            body: body,
            status: 200,
            headers: {
              'Content-Type': 'text/html',
              ...corsHeaders,
            },
          });
          return;
        }
      }

      const callbackFilter = (error?: any, output?: HttpResponse) => {
        context.done(
          error,
          output && {
            ...output,
            headers: {
              ...output.headers,
              ...corsHeaders,
            },
          },
        );
      };
      graphqlAzureFunction(async () => {
        await promiseWillStart;
        return this.createGraphQLServerOptions(req, context);
      })(context, req, callbackFilter);
    };
  }
}
