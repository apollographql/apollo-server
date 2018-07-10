import { graphqlTesting } from './testingApollo';

import { ApolloServerBase } from 'apollo-server-core';
export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';
import { GraphQLOptions } from 'apollo-server-core';
import { Request, Headers, HeadersInit } from 'apollo-server-env';

export class ApolloServer extends ApolloServerBase {
  // This translates the arguments from the middleware into graphQL options It
  // provides typings for the integration specific behavior, ideally this would
  // be propagated with a generic to the super class
  async createGraphQLServerOptions(request: Request): Promise<GraphQLOptions> {
    return super.graphQLServerOptions({ req: request });
  }

  public async execute(
    operation: string,
    variables?: { [name: string]: string },
    additionalHeaders?: object,
  ) {
    const body = {
      query: operation,
      variables,
    };
    const headers = new Headers({ 'Content-Type': 'application/json' });

    if (additionalHeaders) {
      for (const [name, value] of new Headers(additionalHeaders)) {
        headers.append(name, value);
      }
    }
    const request = new Request('http://localhost', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    // create the options and run the operation
    const options = this.createGraphQLServerOptions.bind(this);
    const response = await graphqlTesting(options)(request);

    // parse response and return
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.startsWith('application/json')) {
      return response.json();
    } else {
      return response.text();
    }
  }
}
