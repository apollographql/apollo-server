import { ApolloServerBase, GraphQLOptions } from 'apollo-server-core';
import { IncomingMessage, ServerResponse } from 'http';
import { send } from 'micro';

import { graphqlMicro } from './microApollo';

export interface ServerRegistration {
  disableHealthCheck?: boolean;
  onHealthCheck?: (req: IncomingMessage) => Promise<any>;
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
    disableHealthCheck,
    onHealthCheck,
  }: ServerRegistration = {}) {
    const graphqlHandler = graphqlMicro(
      this.createGraphQLServerOptions.bind(this),
    );
    return async (req, res) => {
      let statusCode: number = 200;
      let data;

      if (
        !disableHealthCheck &&
        req.url === '/.well-known/apollo/server-health'
      ) {
        let statusLabel: string = 'pass';

        // Response follows
        // https://tools.ietf.org/html/draft-inadarei-api-health-check-01
        res.setHeader('Content-Type', 'application/health+json');

        if (onHealthCheck) {
          onHealthCheck(req).catch(() => {
            statusCode = 503;
            statusLabel = 'fail';
          });
        }

        data = { status: statusLabel };
      } else {
        data = await graphqlHandler(req, res);
      }

      send(res, statusCode, data);
    };
  }
}
