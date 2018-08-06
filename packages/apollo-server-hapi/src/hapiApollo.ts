import * as Boom from 'boom';
import { Server, Request, RouteOptions } from 'hapi';
import {
  GraphQLOptions,
  runHttpQuery,
  convertNodeHttpToRequest,
} from 'apollo-server-core';
import { PassThrough } from 'stream';
import { forAwaitEach } from 'iterall';

export interface IRegister {
  (server: Server, options: any, next?: Function): void;
}

export interface IPlugin {
  name: string;
  version?: string;
  register: IRegister;
}

export interface HapiOptionsFunction {
  (request?: Request): GraphQLOptions | Promise<GraphQLOptions>;
}

export interface HapiPluginOptions {
  path: string;
  vhost?: string;
  route?: RouteOptions;
  graphqlOptions: GraphQLOptions | HapiOptionsFunction;
}

const graphqlHapi: IPlugin = {
  name: 'graphql',
  register: (server: Server, options: HapiPluginOptions, next?: Function) => {
    if (!options || !options.graphqlOptions) {
      throw new Error('Apollo Server requires options.');
    }
    server.route({
      method: ['GET', 'POST'],
      path: options.path || '/graphql',
      vhost: options.vhost || undefined,
      options: options.route || {},
      handler: async (request, h) => {
        try {
          const {
            graphqlResponse,
            graphqlResponses,
            responseInit,
          } = await runHttpQuery([request, h], {
            method: request.method.toUpperCase(),
            options: options.graphqlOptions,
            query:
              request.method === 'post'
                ? // TODO type payload as string or Record
                  (request.payload as any)
                : request.query,
            request: convertNodeHttpToRequest(request.raw.req),
            enableDefer: true,
          });

          if (graphqlResponse) {
            const response = h.response(graphqlResponse);
            Object.keys(responseInit.headers).forEach(key =>
              response.header(key, responseInit.headers[key]),
            );
            return response;
          } else if (graphqlResponses) {
            // This is a deferred response, so send it as patches become ready.
            // Update the content type to be able to send multipart data
            // See: https://www.w3.org/Protocols/rfc1341/7_2_Multipart.html
            // Note that we are sending JSON strings, so we can use a simple
            // "-" as the boundary delimiter.
            const contentTypeHeader = 'Content-Type: application/json\r\n';
            const boundary = '\r\n---\r\n';
            const terminatingBoundary = '\r\n-----\r\n';

            const responseStream = new PassThrough();
            const response = h
              .response(responseStream)
              .header('Content-Type', 'multipart/mixed; boundary="-"');

            forAwaitEach(graphqlResponses, data => {
              const contentLengthHeader = `Content-Length: ${Buffer.byteLength(
                data as string,
                'utf8',
              ).toString()}\r\n\r\n`;
              responseStream.write(
                boundary + contentTypeHeader + contentLengthHeader + data,
              );
            }).then(() => {
              // Finish up multipart with the last encapsulation boundary
              responseStream.write(terminatingBoundary);
              responseStream.end();
            });

            return response;
          }
        } catch (error) {
          if ('HttpQueryError' !== error.name) {
            throw Boom.boomify(error);
          }

          if (true === error.isGraphQLError) {
            const response = h.response(error.message);
            response.code(error.statusCode);
            response.type('application/json');
            return response;
          }

          const err = new Boom(error.message, { statusCode: error.statusCode });
          if (error.headers) {
            Object.keys(error.headers).forEach(header => {
              err.output.headers[header] = error.headers[header];
            });
          }
          // Boom hides the error when status code is 500
          err.output.payload.message = error.message;
          throw err;
        }
      },
    });

    if (next) {
      next();
    }
  },
};

export { graphqlHapi };
