import type { Context, HttpRequest } from '@azure/functions';
import type { HttpResponse } from 'azure-functions-ts-essentials';
import { ApolloServerBase } from 'apollo-server-core';
import type { GraphQLOptions } from 'apollo-server-core';
import { graphqlAzureFunction } from './azureFunctionApollo';
import type { LandingPage } from 'apollo-server-plugin-base';

export interface CreateHandlerOptions {
  cors?: {
    origin?: boolean | string | string[];
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
  };
  disableHealthCheck?: boolean;
  onHealthCheck?: (req: HttpRequest) => Promise<any>;
}

export class ApolloServer extends ApolloServerBase {
  protected override serverlessFramework(): boolean {
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

  public createHandler({
    cors,
    onHealthCheck,
    disableHealthCheck,
  }: CreateHandlerOptions = {}) {
    const staticCorsHeaders: HttpResponse['headers'] = {};

    if (cors) {
      if (cors.methods) {
        if (typeof cors.methods === 'string') {
          staticCorsHeaders['Access-Control-Allow-Methods'] = cors.methods;
        } else if (Array.isArray(cors.methods)) {
          staticCorsHeaders['Access-Control-Allow-Methods'] =
            cors.methods.join(',');
        }
      }

      if (cors.allowedHeaders) {
        if (typeof cors.allowedHeaders === 'string') {
          staticCorsHeaders['Access-Control-Allow-Headers'] =
            cors.allowedHeaders;
        } else if (Array.isArray(cors.allowedHeaders)) {
          staticCorsHeaders['Access-Control-Allow-Headers'] =
            cors.allowedHeaders.join(',');
        }
      }

      if (cors.exposedHeaders) {
        if (typeof cors.exposedHeaders === 'string') {
          staticCorsHeaders['Access-Control-Expose-Headers'] =
            cors.exposedHeaders;
        } else if (Array.isArray(cors.exposedHeaders)) {
          staticCorsHeaders['Access-Control-Expose-Headers'] =
            cors.exposedHeaders.join(',');
        }
      }

      if (cors.credentials) {
        staticCorsHeaders['Access-Control-Allow-Credentials'] = 'true';
      }
      if (cors.maxAge) {
        staticCorsHeaders['Access-Control-Max-Age'] = cors.maxAge;
      }
    }

    // undefined before load, null if loaded but there is none.
    let landingPage: LandingPage | null | undefined;

    return (context: Context, req: HttpRequest) => {
      this.ensureStarted()
        .then(() => {
          if (landingPage === undefined) {
            landingPage = this.getLandingPage();
          }

          // HTTP header names are case-insensitive. It seems like most of the
          // time, Azure Functions gives us headers lower-cased, but it's not
          // explicitly documented. Let's be conservative and change to
          // lower-case for our own use.
          // https://github.com/apollographql/apollo-server/issues/4178#issuecomment-812093050
          const requestHeaders = Object.create(null);
          for (const [name, value] of Object.entries(req.headers)) {
            requestHeaders[name.toLowerCase()] = value;
          }

          const corsHeaders: HttpResponse['headers'] = { ...staticCorsHeaders };
          const originHeader = requestHeaders['origin'];
          if (cors === undefined) {
            corsHeaders['Access-Control-Allow-Origin'] = '*';
          } else if (cors?.origin) {
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
          }

          if (
            !disableHealthCheck &&
            req.url?.endsWith('/.well-known/apollo/server-health')
          ) {
            const successfulResponse = {
              body: JSON.stringify({ status: 'pass' }),
              status: 200,
              headers: {
                'Content-Type': 'application/health+json',
                ...corsHeaders,
              },
            };
            if (onHealthCheck) {
              onHealthCheck(req)
                .then(() => {
                  return context.done(null, successfulResponse);
                })
                .catch(() => {
                  return context.done(null, {
                    body: JSON.stringify({ status: 'fail' }),
                    status: 503,
                    headers: {
                      'Content-Type': 'application/health+json',
                      ...corsHeaders,
                    },
                  });
                });
              return;
            } else {
              return context.done(null, successfulResponse);
            }
          }

          if (req.method === 'OPTIONS') {
            if (
              requestHeaders['access-control-request-headers'] &&
              (cors === undefined || (cors && !cors.allowedHeaders))
            ) {
              corsHeaders['Access-Control-Allow-Headers'] =
                requestHeaders['access-control-request-headers'];
              corsHeaders['Vary'] = 'Access-Control-Request-Headers';
            }

            if (
              requestHeaders['access-control-request-method'] &&
              (cors === undefined || (cors && !cors.methods))
            ) {
              corsHeaders['Access-Control-Allow-Methods'] =
                requestHeaders['access-control-request-method'];
            }

            context.done(null, {
              body: '',
              status: 204,
              headers: corsHeaders,
            });
            return;
          }

          if (
            landingPage &&
            req.method === 'GET' &&
            requestHeaders['accept']?.includes('text/html')
          ) {
            context.done(null, {
              body: landingPage.html,
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
