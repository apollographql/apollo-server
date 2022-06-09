import type { WithRequired } from '@apollo/utils.withrequired';
import type express from 'express';
import type {
  ApolloServer,
  BaseContext,
  ContextFunction,
  HTTPGraphQLRequest,
} from '..';

export interface ExpressContextFunctionArgument {
  req: express.Request;
  res: express.Response;
}

export interface ExpressMiddlewareOptions<TContext extends BaseContext> {
  context?: ContextFunction<[ExpressContextFunctionArgument], TContext>;
}

// TODO(AS4): Figure out exact naming (eg is this Express-specific or just Node
// HTTP?)
// TODO(AS4): Write compilation tests about the context optionality stuff.
export function expressMiddleware(
  server: ApolloServer<BaseContext>,
  options?: ExpressMiddlewareOptions<BaseContext>,
): express.RequestHandler;
export function expressMiddleware<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options: WithRequired<ExpressMiddlewareOptions<TContext>, 'context'>,
): express.RequestHandler;
export function expressMiddleware<TContext extends BaseContext>(
  server: ApolloServer<TContext>,
  options?: ExpressMiddlewareOptions<TContext>,
): express.RequestHandler {
  server.assertStarted('expressMiddleware()');

  // This `any` is safe because the overload above shows that context can
  // only be left out if you're using BaseContext as your context, and {} is a
  // valid BaseContext.
  const defaultContext: ContextFunction<
    [ExpressContextFunctionArgument],
    any
  > = async () => ({});

  const context: ContextFunction<[ExpressContextFunctionArgument], TContext> =
    options?.context ?? defaultContext;

  return (req, res, next) => {
    if (!req.body) {
      // The json body-parser *always* sets req.body to {} if it's unset (even
      // if the Content-Type doesn't match), so if it isn't set, you probably
      // forgot to set up body-parser. (Note that this may change in the future
      // body-parser@2.)
      res.status(500);
      res.send(
        '`req.body` is not set; this probably means you forgot to set up the ' +
          '`body-parser` middleware before the Apollo Server middleware.',
      );
      return;
    }

    const headers = new Map<string, string>();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        // Node/Express headers can be an array or a single value. We join
        // multi-valued headers with `, ` just like the Fetch API's `Headers`
        // does. We assume that keys are already lower-cased (as per the Node
        // docs on IncomingMessage.headers) and so we don't bother to lower-case
        // them or combine across multiple keys that would lower-case to the
        // same value.
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    }

    const httpGraphQLRequest: HTTPGraphQLRequest = {
      method: req.method.toUpperCase(),
      headers,
      searchParams: req.query,
      body: req.body,
    };

    server
      .executeHTTPGraphQLRequest({
        httpGraphQLRequest,
        context: () => context({ req, res }),
      })
      .then((httpGraphQLResponse) => {
        if (httpGraphQLResponse.completeBody === null) {
          // TODO(AS4): Implement incremental delivery or improve error handling.
          throw Error('Incremental delivery not implemented');
        }

        for (const [key, value] of httpGraphQLResponse.headers) {
          res.setHeader(key, value);
        }
        res.statusCode = httpGraphQLResponse.statusCode || 200;
        res.send(httpGraphQLResponse.completeBody);
      })
      .catch(next);
  };
}
