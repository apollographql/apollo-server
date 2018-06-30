import { ApolloServerBase, GraphQLOptions } from 'apollo-server-core';
import { IncomingMessage, ServerResponse } from 'http';
import { send } from 'micro';
import {
  renderPlaygroundPage,
  MiddlewareOptions as PlaygroundMiddlewareOptions,
} from 'graphql-playground-html';
import { parseAll } from 'accept';

import { graphqlMicro } from './microApollo';

export interface ServerRegistration {
  path?: string;
  disableHealthCheck?: boolean;
  onHealthCheck?: (req: IncomingMessage) => Promise<any>;
  gui?: boolean | PlaygroundMiddlewareOptions;
}

export class ApolloServer extends ApolloServerBase {
  // Extract Apollo Server options from the request.
  async createGraphQLServerOptions(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req, res });
  }

  // Prepares and returns an async function that can be used by Micro to handle
  // GraphQL requests.
  public graphqlHandler({
    path,
    disableHealthCheck,
    onHealthCheck,
    gui,
  }: ServerRegistration = {}) {
    return async (req, res) => {
      (await this.handleHealthCheck({
        req,
        res,
        disableHealthCheck,
        onHealthCheck,
      })) ||
        this.handleGraphqlRequestsWithPlayground({ req, res, path, gui }) ||
        (await this.handleGraphqlRequestsWithServer({ req, res, path })) ||
        send(res, 404, null);
    };
  }

  // If health checking is enabled trigger the `onHealthCheck`
  // function, when the health check URL is requested.
  private async handleHealthCheck({
    req,
    res,
    disableHealthCheck,
    onHealthCheck,
  }: {
    req: IncomingMessage;
    res: ServerResponse;
    disableHealthCheck?: boolean;
    onHealthCheck?: (req: IncomingMessage) => Promise<any>;
  }): Promise<boolean> {
    let handled = false;

    if (
      !disableHealthCheck &&
      req.url === '/.well-known/apollo/server-health'
    ) {
      // Response follows
      // https://tools.ietf.org/html/draft-inadarei-api-health-check-01
      res.setHeader('Content-Type', 'application/health+json');

      if (onHealthCheck) {
        try {
          await onHealthCheck(req);
        } catch (error) {
          send(res, 503, { status: 'fail' });
        }
      }

      send(res, 200, { status: 'pass' });
      handled = true;
    }

    return handled;
  }

  // If the `gui` option is set, register a `graphql-playground` instance
  // (not available in production) that is then used to handle all
  // incoming GraphQL requests.
  private handleGraphqlRequestsWithPlayground({
    req,
    res,
    path,
    gui,
  }: {
    req: IncomingMessage;
    res: ServerResponse;
    path?: string;
    gui?: boolean | PlaygroundMiddlewareOptions;
  }): boolean {
    let handled = false;
    const guiEnabled =
      !!gui || (gui === undefined && process.env.NODE_ENV !== 'production');

    if (guiEnabled && req.method === 'GET') {
      const accept = parseAll(req.headers);
      const types = accept.mediaTypes as string[];
      const prefersHTML =
        types.find(
          (x: string) => x === 'text/html' || x === 'application/json',
        ) === 'text/html';

      if (prefersHTML) {
        const middlewareOptions = {
          endpoint: path || '/graphql',
          version: '1.7.0',
          ...(typeof gui === 'boolean' ? {} : gui),
        };
        send(res, 200, renderPlaygroundPage(middlewareOptions));
        handled = true;
      }
    }

    return handled;
  }

  // Handle incoming GraphQL requests using Apollo Server.
  private async handleGraphqlRequestsWithServer({
    req,
    res,
    path,
  }: {
    req: IncomingMessage;
    res: ServerResponse;
    path?: string;
  }): Promise<boolean> {
    let handled = false;
    const pathWithFallback = path || '/graphql';
    if (req.url === pathWithFallback) {
      const graphqlHandler = graphqlMicro(
        this.createGraphQLServerOptions.bind(this),
      );
      const responseData = await graphqlHandler(req, res);
      send(res, 200, responseData);
      handled = true;
    }
    return handled;
  }
}
