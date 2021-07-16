import {
  ApolloServer as ApolloServerExpress,
  GetMiddlewareOptions,
} from 'apollo-server-express';
import express from 'express';

export interface CreateHandlerOptions {
  expressAppFromMiddleware?: (
    middleware: express.RequestHandler,
  ) => express.Application;
  expressGetMiddlewareOptions?: GetMiddlewareOptions;
}

function defaultExpressAppFromMiddleware(
  middleware: express.RequestHandler,
): express.Handler {
  const app = express();
  app.use(middleware);
  return app;
}

export class ApolloServer extends ApolloServerExpress {
  protected override serverlessFramework(): boolean {
    return true;
  }

  public createHandler(options?: CreateHandlerOptions): express.Handler {
    let realHandler: express.Handler;
    return async (req, ...args) => {
      await this.ensureStarted();
      if (!realHandler) {
        const middleware = this.getMiddleware(
          // By default, serverless integrations serve on root rather than
          // /graphql, since serverless handlers tend to just do one thing and
          // paths are generally configured as part of deploying the app.
          {
            path: '/',
            ...options?.expressGetMiddlewareOptions,
          },
        );
        realHandler = (
          options?.expressAppFromMiddleware ?? defaultExpressAppFromMiddleware
        )(middleware);
      }
      return realHandler(req, ...args);
    };
  }
}
