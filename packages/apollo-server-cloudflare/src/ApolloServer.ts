import { graphqlCloudflare } from './cloudflareApollo';

import { ApolloServerBase } from 'apollo-server-core';
export { GraphQLOptions } from 'apollo-server-core';
import { GraphQLOptions } from 'apollo-server-core';
import { Request } from 'apollo-server-env';

export class ApolloServer extends ApolloServerBase {
  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(request: Request): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ request });
  }

  public async listen() {
    this.assertStarted('listen');

    addEventListener('fetch', (event: FetchEvent) => {
      // Note that this package doesn't support htmlPages plugins (it also has
      // never supported Playground).
      event.respondWith(
        graphqlCloudflare(() => {
          return this.createGraphQLServerOptions(event.request);
        })(event.request),
      );
    });
    return await { url: '', port: null };
  }
}
