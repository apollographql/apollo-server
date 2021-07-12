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

  public createHandler(
    options?: CreateHandlerOptions,
  ): express.Handler {
    let realHandler: express.Handler;
    return async (req, ...args) => {
      await this.ensureStarted();
      if (!realHandler) {
        const middleware = this.getMiddleware(
          options?.expressGetMiddlewareOptions,
        );
        realHandler = (
          options?.expressAppFromMiddleware ?? defaultExpressAppFromMiddleware
        )(middleware);
      }
      return realHandler(req, ...args);
    };
  }
}
