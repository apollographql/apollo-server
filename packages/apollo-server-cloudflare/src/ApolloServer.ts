import { graphqlCloudflare } from './cloudflareApollo';

import { ApolloServerBase } from 'apollo-server-core';

export class ApolloServer extends ApolloServerBase {
  public async listen() {
    const graphql = this.graphQLServerOptionsForRequest.bind(this);
    addEventListener('fetch', (event: FetchEvent) => {
      event.respondWith(graphqlCloudflare(graphql)(event.request));
    });
    return await { url: '', port: null };
  }
}
