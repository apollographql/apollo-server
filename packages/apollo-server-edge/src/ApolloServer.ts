import { graphqlEdge } from './edgeApollo';

import { ApolloServerBase } from 'apollo-server-core';

export class ApolloServer extends ApolloServerBase {
  public async listen() {
    const graphql = this.request.bind(this);
    addEventListener('fetch', (event: FetchEvent) => {
      event.respondWith(graphqlEdge(graphql)(event.request));
    });
    return { url: '', port: null };
  }
}
