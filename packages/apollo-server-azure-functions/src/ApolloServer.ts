import { Context, HttpRequest } from '@azure/functions';
import { HttpResponse } from 'azure-functions-ts-essentials';
import { ApolloServerBase } from 'apollo-server-core';
import { GraphQLOptions } from 'apollo-server-core';
import { graphqlAzureFunction } from './azureFunctionApollo';
import { UIPage } from 'apollo-server-plugin-base';

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
  protected serverlessFramework(): boolean {
    return true;
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

    // undefined before load, null if loaded but there is none.
    let uiPage: UIPage | null | undefined;

    return (context: Context, req: HttpRequest) => {
      this.ensureStarted()
        .then(() => {
          if (uiPage === undefined) {
            // FIXME graphqlPath might be wrong. This package doesn't really
            // use graphqlPath. Need some other way to find its mount point
            // to get tests to pass...
            uiPage = this.getUIPage({ graphqlPath: this.graphqlPath });
          }

          const originHeader = req.headers['Origin'] || req.headers['origin'];
          if (cors && cors.origin) {
            if (typeof cors.origin === 'string') {
              corsHeaders['Access-Control-Allow-Origin'] = cors.origin;
            } else if (
              typeof cors.origin === 'boolean' ||
              (Array.isArray(cors.origin) &&
                originHeader !== undefined &&
                cors.origin.includes(originHeader))
            ) {
              corsHeaders['Access-Control-Allow-Origin'] = originHeader;
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

          if (
            uiPage &&
            req.method === 'GET' &&
            (req.headers['Accept'] || req.headers['accept'])?.includes(
              'text/html',
            )
          ) {
            context.done(null, {
              body: uiPage.html,
              status: 200,
              headers: {
                'Content-Type': 'text/html',
                ...corsHeaders,
              },
            });
            return;
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
            return this.createGraphQLServerOptions(req, context);
          })(context, req, callbackFilter);
        })
        .catch((err) => context.done(err));
    };
  }
}
