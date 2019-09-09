import Boom from 'boom';
import { Server, Request, RouteOptions, ServerRoute } from 'hapi';
import Subtext from 'subtext';
import {
  FileUploadOptions,
  GraphQLOptions,
  HttpQueryRequest,
  convertNodeHttpToRequest,
  processFileUploads,
  runHttpQuery,
} from 'apollo-server-core';
import { ValueOrPromise } from 'apollo-server-types';

export interface IRegister {
  (server: Server, options: any, next?: Function): void;
}

export interface IPlugin {
  name: string;
  version?: string;
  register: IRegister;
}

export interface HapiOptionsFunction {
  (request?: Request): ValueOrPromise<GraphQLOptions>;
}

export interface HapiPluginOptions {
  path: string;
  vhost?: string;
  route?: RouteOptions;
  graphqlOptions: GraphQLOptions | HapiOptionsFunction;
  uploadsConfig?: FileUploadOptions;
}

const graphqlHapi: IPlugin = {
  name: 'graphql',
  register: (server: Server, options: HapiPluginOptions, next?: Function) => {
    if (!options || !options.graphqlOptions) {
      throw new Error('Apollo Server requires options.');
    }

    const isUploadEnabled =
      options.uploadsConfig && typeof processFileUploads === 'function';
    const path = options.path || '/graphql';

    const handler: ServerRoute['handler'] = async (request, h) => {
      try {
        let query: HttpQueryRequest;

        if (request.method === 'get') {
          query = request.query as any;
        } else if (isUploadEnabled && request.mime === 'multipart/form-data') {
          query = (await processFileUploads(
            request.raw.req,
            request.raw.res,
            options.uploadsConfig,
          )) as any;
        } else {
          // The request is unparsed due to the 'POST' route's config. Use
          // Subtext, hapi's default parser, to parse the request.
          // https://github.com/hapijs/subtext
          const { payload } = await Subtext.parse(request.raw.req, null, {
            parse: true,
            output: 'data',
          });
          query = payload;
        }

        const { graphqlResponse, responseInit } = await runHttpQuery(
          [request, h],
          {
            method: request.method.toUpperCase(),
            options: options.graphqlOptions,
            query,
            request: convertNodeHttpToRequest(request.raw.req),
          },
        );

        const response = h.response(graphqlResponse);
        Object.keys(responseInit.headers).forEach(key =>
          response.header(key, responseInit.headers[key]),
        );
        return response;
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
    };

    // hapi doesn't allow `options.payload` configuration to non-POST routes.
    // Register two routes to apply the necessary `options.payload`
    // configuration to the POST handler.
    server.route([
      {
        method: 'GET',
        path,
        vhost: options.vhost || undefined,
        options: options.route || {},
        handler,
      },
      {
        method: 'POST',
        path,
        vhost: options.vhost || undefined,
        handler,
        options: {
          ...options.route,
          // Don't parse the incoming `http.IncomingMessage` to permit passing the
          // un-parsed request to graphql-upload for upload parsing
          payload: {
            output: 'stream',
            parse: false,
          },
        },
      },
    ]);

    if (next) {
      next();
    }
  },
};

export { graphqlHapi };
