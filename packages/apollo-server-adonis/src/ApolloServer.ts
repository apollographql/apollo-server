import Context from '@adonisjs/framework/src/Context';
import Route from '@adonisjs/framework/src/Route/Manager';
import {
  renderPlaygroundPage,
  RenderPageOptions as PlaygroundRenderPageOptions,
} from '@apollographql/graphql-playground-html';
import { ApolloServerBase, formatApolloErrors } from 'apollo-server-core';

import { graphqlAdonis } from './adonisApollo';

import { processRequest as processFileUploads } from '@apollographql/apollo-upload-server';

export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';
import { GraphQLOptions } from 'apollo-server-core';

export interface ServerRegistration {
  router?: Route;
  path?: string;
  disableHealthCheck?: boolean;
  onHealthCheck?: (ctx: Context) => Promise<any>;
}

export class ApolloServer extends ApolloServerBase {
  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(ctx: Context): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ ctx });
  }

  protected supportsSubscriptions(): boolean {
    return true;
  }

  protected supportsUploads(): boolean {
    return true;
  }

  public registerRoutes({
    router,
    path,
    disableHealthCheck,
    onHealthCheck,
  }: ServerRegistration = {}) {
    if (!path) path = '/graphql';

    if (!router) router = Route;

    const promiseWillStart = this.willStart();

    if (!disableHealthCheck) {
      router.route(
        '/.well-known/apollo/server-health',
        async (ctx: Context) => {
          await promiseWillStart;

          // Response follows https://tools.ietf.org/html/draft-inadarei-api-health-check-01
          ctx.response.type('application/health+json');

          if (onHealthCheck) {
            return onHealthCheck(ctx)
              .then(() => {
                ctx.response.send({ status: 'pass' });
              })
              .catch(() => {
                ctx.response.status(503).send({ status: 'fail' });
              });
          } else {
            ctx.response.send({ status: 'pass' });
          }
        },
        ['GET', 'POST'],
      );
    }

    this.graphqlPath = path;

    router.any(
      path,
      async (ctx: Context) => {
        await promiseWillStart;

        if (this.uploadsConfig && ctx.request.is(['multipart/form-data'])) {
          try {
            ctx.request._body = await processFileUploads(
              ctx.request.request,
              this.uploadsConfig,
            );
          } catch (error) {
            if (error.status && error.expose) {
              ctx.response.status(error.status);
            }

            throw formatApolloErrors([error], {
              formatter: this.requestOptions.formatError,
              debug: this.requestOptions.debug,
            });
          }
        }

        if (this.playgroundOptions && ctx.request.method() === 'GET') {
          // perform more expensive content-type check only if necessary
          const prefersHTML =
            ctx.request
              .types()
              .find(
                (x: string) => x === 'text/html' || x === 'application/json',
              ) === 'text/html';

          if (prefersHTML) {
            const playgroundRenderPageOptions: PlaygroundRenderPageOptions = {
              endpoint: path,
              subscriptionEndpoint: this.subscriptionsPath,
              ...this.playgroundOptions,
            };
            const playground = renderPlaygroundPage(
              playgroundRenderPageOptions,
            );
            ctx.response.type('text/html').send(playground);
            return;
          }
        }
        return graphqlAdonis(() => {
          return this.createGraphQLServerOptions(ctx);
        })(ctx);
      },
      ['GET', 'POST'],
    );
  }
}
