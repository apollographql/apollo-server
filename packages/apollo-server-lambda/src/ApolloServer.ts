import {
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda';
import { ApolloServerBase, GraphQLOptions, Config } from 'apollo-server-core';
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html';

import { graphqlLambda } from './lambdaApollo';
import { Headers } from 'apollo-server-env';

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
    event: APIGatewayProxyEvent,
    context: LambdaContext,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ event, context });
  }

  public createHandler({ cors }: CreateHandlerOptions = { cors: undefined }) {
    // We will kick off the `willStart` event once for the server, and then
    // await it before processing any requests by incorporating its `await` into
    // the GraphQLServerOptions function which is called before each request.
    const promiseWillStart = this.willStart();

    const corsHeaders = new Headers();

    if (cors) {
      if (cors.methods) {
        if (typeof cors.methods === 'string') {
          corsHeaders.set('access-control-allow-methods', cors.methods);
        } else if (Array.isArray(cors.methods)) {
          corsHeaders.set(
            'access-control-allow-methods',
            cors.methods.join(','),
          );
        }
      }

      if (cors.allowedHeaders) {
        if (typeof cors.allowedHeaders === 'string') {
          corsHeaders.set('access-control-allow-headers', cors.allowedHeaders);
        } else if (Array.isArray(cors.allowedHeaders)) {
          corsHeaders.set(
            'access-control-allow-headers',
            cors.allowedHeaders.join(','),
          );
        }
      }

      if (cors.exposedHeaders) {
        if (typeof cors.exposedHeaders === 'string') {
          corsHeaders.set('access-control-expose-headers', cors.exposedHeaders);
        } else if (Array.isArray(cors.exposedHeaders)) {
          corsHeaders.set(
            'access-control-expose-headers',
            cors.exposedHeaders.join(','),
          );
        }
      }

      if (cors.credentials) {
        corsHeaders.set('access-control-allow-credentials', 'true');
      }
      if (typeof cors.maxAge === 'number') {
        corsHeaders.set('access-control-max-age', cors.maxAge.toString());
      }
    }

    return (
      event: APIGatewayProxyEvent,
      context: LambdaContext,
      callback: APIGatewayProxyCallback,
    ) => {
      // We re-load the headers into a Fetch API-compatible `Headers`
      // interface within `graphqlLambda`, but we still need to respect the
      // case-insensitivity within this logic here, so we'll need to do it
      // twice since it's not accessible to us otherwise, right now.
      const eventHeaders = new Headers(event.headers);

      // Make a request-specific copy of the CORS headers, based on the server
      // global CORS headers we've set above.
      const requestCorsHeaders = new Headers(corsHeaders);

      if (cors && cors.origin) {
        const requestOrigin = eventHeaders.get('origin');
        if (typeof cors.origin === 'string') {
          requestCorsHeaders.set('access-control-allow-origin', cors.origin);
        } else if (
          requestOrigin &&
          (typeof cors.origin === 'boolean' ||
            (Array.isArray(cors.origin) &&
              requestOrigin &&
              cors.origin.includes(requestOrigin)))
        ) {
          requestCorsHeaders.set('access-control-allow-origin', requestOrigin);
        }

        const requestAccessControlRequestHeaders = eventHeaders.get(
          'access-control-request-headers',
        );
        if (!cors.allowedHeaders && requestAccessControlRequestHeaders) {
          requestCorsHeaders.set(
            'access-control-allow-headers',
            requestAccessControlRequestHeaders,
          );
        }
      }

      // Convert the `Headers` into an object which can be spread into the
      // various headers objects below.
      // Note: while Object.fromEntries simplifies this code, it's only currently
      //       supported in Node 12 (we support >=6)
      const requestCorsHeadersObject = Array.from(requestCorsHeaders).reduce<
        Record<string, string>
      >((headersObject, [key, value]) => {
        headersObject[key] = value;
        return headersObject;
      }, {});

      if (event.httpMethod === 'OPTIONS') {
        context.callbackWaitsForEmptyEventLoop = false;
        return callback(null, {
          body: '',
          statusCode: 204,
          headers: {
            ...requestCorsHeadersObject,
          },
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
              ...requestCorsHeadersObject,
            },
          });
        }
      }

      const callbackFilter: APIGatewayProxyCallback = (error, result) => {
        callback(
          error,
          result && {
            ...result,
            headers: {
              ...result.headers,
              ...requestCorsHeadersObject,
            },
          },
        );
      };

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
      })(event, context, callbackFilter);
    };
  }
}
