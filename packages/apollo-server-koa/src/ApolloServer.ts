import type Koa from 'koa';
import type { ParameterizedContext, Middleware } from 'koa';
import corsMiddleware from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import compose from 'koa-compose';
import {
  ApolloServerBase,
  convertNodeHttpToRequest,
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
} from 'apollo-server-core';
import accepts from 'accepts';

export { GraphQLOptions } from 'apollo-server-core';

export interface GetMiddlewareOptions {
  path?: string;
  cors?: corsMiddleware.Options | boolean;
  bodyParserConfig?: bodyParser.Options | boolean;
  onHealthCheck?: (ctx: Koa.Context) => Promise<any>;
  disableHealthCheck?: boolean;
}

export interface ServerRegistration extends GetMiddlewareOptions {
  app: Koa;
}

const middlewareFromPath =
  <StateT, CustomT>(
    path: string,
    middleware: compose.Middleware<ParameterizedContext<StateT, CustomT>>,
  ) =>
  (ctx: ParameterizedContext<StateT, CustomT>, next: () => Promise<any>) => {
    if (ctx.path === path || ctx.path === `${path}/`) {
      return middleware(ctx, next);
    } else {
      return next();
    }
  };

export class ApolloServer extends ApolloServerBase {
  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(ctx: Koa.Context): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ ctx });
  }

  public applyMiddleware({ app, ...rest }: ServerRegistration) {
    // getMiddleware calls this too, but we want the right method name in the error
    this.assertStarted('applyMiddleware');

    app.use(this.getMiddleware(rest));
  }

  // TODO: While Koa is Promise-aware, this API hasn't been historically, even
  // though other integration's (e.g. Hapi) implementations of this method
  // are `async`.  Therefore, this should become `async` in a major release in
  // order to align the API with other integrations.
  public getMiddleware({
    path,
    cors,
    bodyParserConfig,
    disableHealthCheck,
    onHealthCheck,
  }: GetMiddlewareOptions = {}): Middleware {
    if (!path) path = '/graphql';

    this.assertStarted('getMiddleware');

    const middlewares = [];

    if (!disableHealthCheck) {
      middlewares.push(
        middlewareFromPath(
          '/.well-known/apollo/server-health',
          async (ctx: Koa.Context) => {
            // Response follows https://tools.ietf.org/html/draft-inadarei-api-health-check-01
            ctx.set('Content-Type', 'application/health+json');

            if (onHealthCheck) {
              try {
                await onHealthCheck(ctx);
                ctx.body = { status: 'pass' };
              } catch (e) {
                ctx.status = 503;
                ctx.body = { status: 'fail' };
              }
            } else {
              ctx.body = { status: 'pass' };
            }
          },
        ),
      );
    }

    this.graphqlPath = path;

    if (cors === true || cors === undefined) {
      // Unlike the express `cors` package, `fastify-cors`, or Hapi, Koa's cors
      // handling defaults to reflecting the incoming origin instead of '*'.
      // Let's make it match.
      middlewares.push(
        middlewareFromPath(path, corsMiddleware({ origin: '*' })),
      );
    } else if (cors !== false) {
      middlewares.push(middlewareFromPath(path, corsMiddleware(cors)));
    }

    if (bodyParserConfig === true) {
      middlewares.push(middlewareFromPath(path, bodyParser()));
    } else if (bodyParserConfig !== false) {
      middlewares.push(middlewareFromPath(path, bodyParser(bodyParserConfig)));
    }

    const landingPage = this.getLandingPage();

    middlewares.push(
      middlewareFromPath(path, async (ctx: Koa.Context) => {
        if (ctx.request.method === 'OPTIONS') {
          ctx.status = 204;
          ctx.body = '';
          return;
        }

        if (landingPage && ctx.request.method === 'GET') {
          // perform more expensive content-type check only if necessary
          const accept = accepts(ctx.req);
          const types = accept.types() as string[];
          const prefersHtml =
            types.find(
              (x: string) => x === 'text/html' || x === 'application/json',
            ) === 'text/html';

          if (prefersHtml) {
            ctx.set('Content-Type', 'text/html');
            ctx.body = landingPage.html;
            return;
          }
        }

        try {
          const { graphqlResponse, responseInit } = await runHttpQuery([ctx], {
            method: ctx.request.method,
            options: () => this.createGraphQLServerOptions(ctx),
            query:
              ctx.request.method === 'POST'
                ? // fallback to ctx.req.body for koa-multer support
                  (ctx.request as any).body || (ctx.req as any).body
                : ctx.request.query,
            request: convertNodeHttpToRequest(ctx.req),
          });
          if (responseInit.headers) {
            Object.entries(responseInit.headers).forEach(
              ([headerName, value]) => ctx.set(headerName, value),
            );
          }
          ctx.body = graphqlResponse;
          ctx.status = responseInit.status || 200;
        } catch (e: unknown) {
          const error = e as HttpQueryError;
          if ('HttpQueryError' !== error.name) {
            throw error;
          }

          if (error.headers) {
            Object.entries(error.headers).forEach(([headerName, value]) =>
              ctx.set(headerName, value),
            );
          }

          ctx.status = error.statusCode;
          ctx.body = error.message;
        }
      }),
    );
    return compose(middlewares);
  }
}
