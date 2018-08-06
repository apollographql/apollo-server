import * as Koa from 'koa';
import {
  GraphQLOptions,
  HttpQueryError,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import { forAwaitEach } from 'iterall';

export interface KoaGraphQLOptionsFunction {
  (ctx: Koa.Context): GraphQLOptions | Promise<GraphQLOptions>;
}

export interface KoaHandler {
  (ctx: Koa.Context, next): void;
}

export function graphqlKoa(
  options: GraphQLOptions | KoaGraphQLOptionsFunction,
): KoaHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 1) {
    // TODO: test this
    throw new Error(
      `Apollo Server expects exactly one argument, got ${arguments.length}`,
    );
  }

  const graphqlHandler = (ctx: Koa.Context): Promise<void> => {
    return runHttpQuery([ctx], {
      method: ctx.request.method,
      options: options,
      query:
        ctx.request.method === 'POST'
          ? // fallback to ctx.req.body for koa-multer support
            ctx.request.body || (ctx.req as any).body
          : ctx.request.query,
      request: convertNodeHttpToRequest(ctx.req),
      enableDefer: true,
    }).then(
      async ({ graphqlResponse, graphqlResponses, responseInit }) => {
        Object.keys(responseInit.headers).forEach(key =>
          ctx.set(key, responseInit.headers[key]),
        );

        if (graphqlResponse) {
          ctx.body = graphqlResponse;
        } else if (graphqlResponses) {
          // This is a deferred response, so send it as patches become ready.
          // Update the content type to be able to send multipart data
          // See: https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
          // Note that we are sending JSON strings, so we can use a simple
          // "-" as the boundary delimiter.

          // According to the Koa docs: https://koajs.com/#response,
          // bypassing Koa's response handling is not supported, so res.write()
          // may not be working as expected.

          ctx.set('Content-Type', 'multipart/mixed; boundary="-"');
          const contentTypeHeader = 'Content-Type: application/json\r\n';
          const boundary = '\r\n---\r\n';
          const terminatingBoundary = '\r\n-----\r\n';

          ctx.res.writeHead(200);

          await forAwaitEach(graphqlResponses, data => {
            const contentLengthHeader = `Content-Length: ${Buffer.byteLength(
              data as string,
              'utf8',
            ).toString()}\r\n\r\n`;

            ctx.res.write(
              boundary + contentTypeHeader + contentLengthHeader + data,
            );
          });

          // Finish up multipart with the last encapsulation boundary
          ctx.res.write(terminatingBoundary);
          ctx.res.end();
        }
      },
      (error: HttpQueryError) => {
        if ('HttpQueryError' !== error.name) {
          throw error;
        }

        if (error.headers) {
          Object.keys(error.headers).forEach(header => {
            ctx.set(header, error.headers[header]);
          });
        }

        ctx.status = error.statusCode;
        ctx.body = error.message;
      },
    );
  };

  return graphqlHandler;
}
