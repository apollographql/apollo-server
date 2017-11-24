import { GraphQLOptions, HttpQueryError, runHttpQuery } from 'apollo-server-core';
import * as GraphiQL from 'apollo-server-module-graphiql';
import { processRequest } from 'apollo-upload-server';
import { createError, json, RequestHandler } from 'micro';
import * as url from 'url';
import {IncomingMessage, ServerResponse} from 'http';

export interface MicroGraphQLOptionsFunction {
  (req?: IncomingMessage): GraphQLOptions | Promise<GraphQLOptions>;
}

export interface MicroGraphQLUploadOptions {
  uploadDir: string;
}

export function microGraphql(
  options: GraphQLOptions | MicroGraphQLOptionsFunction,
  uploadOptions: MicroGraphQLUploadOptions = null): RequestHandler {
  if (!options) {
    throw new Error('Apollo Server requires options.');
  }

  if (arguments.length > 2) {
    throw new Error(`Apollo Server expects one or two arguments, got ${arguments.length}`);
  }

  return async function (req: IncomingMessage, res: ServerResponse) {
    let query;
    if (req.method === 'POST') {
      try {
        query = await json(req);

        const { headers: {'content-type': contentType }} = req;

        // Skip if there are no uploads
        if (!contentType || contentType.indexOf('multipart/form-data') === -1) {
          query = await json(req);
        } else {
          query = await processRequest(req, uploadOptions);
        }
      } catch (err) {
        query = undefined;
      }
    } else {
      query = url.parse(req.url, true).query;
    }

    try {
      const gqlResponse = await runHttpQuery([req, res], {
        method: req.method,
        options: options,
        query: query,
      });

      res.setHeader('Content-Type', 'application/json');
      return gqlResponse;
    } catch (error) {
      if ('HttpQueryError' === error.name) {
        if (error.headers) {
          Object.keys(error.headers).forEach((header) => {
            res.setHeader(header, error.headers[header]);
          });
        }
      }

      if (!error.statusCode) {
        error.statusCode = 500;
      }

      throw error;
    }
  };
}

export interface MicroGraphiQLOptionsFunction {
  (req?: IncomingMessage): GraphiQL.GraphiQLData | Promise<GraphiQL.GraphiQLData>;
}

export function microGraphiql(options: GraphiQL.GraphiQLData | MicroGraphiQLOptionsFunction): RequestHandler {
  return (req: IncomingMessage, res: ServerResponse) => {
    const query = req.url && url.parse(req.url, true).query || {};
    return GraphiQL.resolveGraphiQLString(query, options, req).then(graphiqlString => {
      res.setHeader('Content-Type', 'text/html');
      res.write(graphiqlString);
      res.end();
    }, error => {
      res.statusCode = 500;
      res.write(error.message);
      res.end();
    });
  };
}
