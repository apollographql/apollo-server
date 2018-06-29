import { ApolloServerBase, GraphQLOptions } from 'apollo-server-core';
import { IncomingMessage, ServerResponse } from 'http';

import { graphqlMicro } from './microApollo';

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
  public graphqlHandler() {
    return graphqlMicro(this.createGraphQLServerOptions.bind(this));
  }
}
