import { graphqlCloudflare } from './cloudflareApollo';

import { ApolloServerBase } from 'apollo-server-core';
export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';
import { GraphQLOptions } from 'apollo-server-core';

export class ApolloServer extends ApolloServerBase {
  async createGraphQLServerOptions(req: Request): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req });
  }

  public async listen() {
    const graphql = this.createGraphQLServerOptions.bind(this);
    addEventListener('fetch', (event: FetchEvent) => {
      event.respondWith(graphqlCloudflare(graphql)(event.request));
    });
    return await { url: '', port: null };
  }
}
