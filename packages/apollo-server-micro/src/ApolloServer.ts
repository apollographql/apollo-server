import { ApolloServerBase, GraphQLOptions } from 'apollo-server-core';
import type { ServerResponse } from 'http';
import { send } from 'micro';
import { parseAll } from '@hapi/accept';

import { graphqlMicro } from './microApollo';
import type { MicroRequest } from './types';
import type { LandingPage } from 'apollo-server-plugin-base';

export interface ServerRegistration {
  path?: string;
  disableHealthCheck?: boolean;
  onHealthCheck?: (req: MicroRequest) => Promise<any>;
  __testing__microSuppressErrorLog?: boolean;
}

export class ApolloServer extends ApolloServerBase {
  // Extract Apollo Server options from the request.
  async createGraphQLServerOptions(
    req: MicroRequest,
    res: ServerResponse,
  ): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req, res });
  }

  // Prepares and returns an async function that can be used by Micro to handle
  // GraphQL requests.
  public createHandler({
    path,
    disableHealthCheck,
    onHealthCheck,
    __testing__microSuppressErrorLog,
  }: ServerRegistration = {}) {
    this.assertStarted('createHandler');

    this.graphqlPath = path || '/graphql';

    const landingPage = this.getLandingPage();

    return async (req: MicroRequest, res: ServerResponse) => {
      try {
        if (
          await this.handleHealthCheck({
            req,
            res,
            disableHealthCheck,
            onHealthCheck,
          })
        ) {
          return;
        }
        if (
          landingPage &&
          this.handleGraphqlRequestsWithLandingPage({ req, res, landingPage })
        ) {
          return;
        }
        if (await this.handleGraphqlRequestsWithServer({ req, res })) {
          return;
        }
        send(res, 404, null);
      } catch (errorObj: any) {
        if (!__testing__microSuppressErrorLog) {
          throw errorObj;
        }
        // Like Micro's sendError but without the logging.
        const statusCode = errorObj.statusCode || errorObj.status;
        send(res, statusCode || 500, errorObj.stack);
      }
    };
  }

  // If health checking is enabled, trigger the `onHealthCheck`
  // function when the health check URL is requested.
  private async handleHealthCheck({
    req,
    res,
    disableHealthCheck,
    onHealthCheck,
  }: {
    req: MicroRequest;
    res: ServerResponse;
    disableHealthCheck?: boolean;
    onHealthCheck?: (req: MicroRequest) => Promise<any>;
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
          handled = true;
        }
      }

      if (!handled) {
        send(res, 200, { status: 'pass' });
        handled = true;
      }
    }

    return handled;
  }

  private handleGraphqlRequestsWithLandingPage({
    req,
    res,
    landingPage,
  }: {
    req: MicroRequest;
    res: ServerResponse;
    landingPage: LandingPage;
  }): boolean {
    let handled = false;

    const url = req.url!.split('?')[0];
    if (req.method === 'GET' && url === this.graphqlPath) {
      const accept = parseAll(req.headers);
      const types = accept.mediaTypes as string[];
      const prefersHtml =
        types.find(
          (x: string) => x === 'text/html' || x === 'application/json',
        ) === 'text/html';

      if (prefersHtml) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        send(res, 200, landingPage.html);
        handled = true;
      }
    }

    return handled;
  }

  // Handle incoming GraphQL requests using Apollo Server.
  private async handleGraphqlRequestsWithServer({
    req,
    res,
  }: {
    req: MicroRequest;
    res: ServerResponse;
  }): Promise<boolean> {
    let handled = false;
    const url = req.url!.split('?')[0];
    if (url === this.graphqlPath) {
      const graphqlHandler = graphqlMicro(() => {
        return this.createGraphQLServerOptions(req, res);
      }, this.csrfPreventionRequestHeaders);
      const responseData = await graphqlHandler(req, res);
      send(res, 200, responseData);
      handled = true;
    }
    return handled;
  }
}
