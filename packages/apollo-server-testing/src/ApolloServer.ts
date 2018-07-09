import { graphqlTesting } from './testingApollo';

import { ApolloServerBase } from 'apollo-server-core';
export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';
import { GraphQLOptions } from 'apollo-server-core';
import { Request } from 'apollo-server-env';
// import { eventNames } from 'cluster';

export class ApolloServer extends ApolloServerBase {
  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(request: Request): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ request });
  }

  // public async listen() {
  //   const graphql = this.createGraphQLServerOptions.bind(this);
  //   addEventListener('fetch', (event: FetchEvent) => {
  //     event.respondWith(graphqlTesting(graphql)(event.request));
  //   });
  //   return await { url: '', port: null };
  // }

  public async execute(options) {
    const graphql = this.createGraphQLServerOptions.bind(this);
    return await graphqlTesting(graphql)(options.request);
  }
}
