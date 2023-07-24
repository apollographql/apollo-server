import { ApolloServer, HeaderMap } from '@apollo/server';
import { describe, expect, test } from '@jest/globals';
import assert from 'assert';

describe('ApolloServerPluginLandingPageDefault', () => {
  test(`nonce isn't reused between requests`, async () => {
    const server = new ApolloServer({
      typeDefs: `#graphql
        type Query {
          hello: String!
        }
      `,
    });
    await server.start();

    async function requestLandingPage() {
      return server.executeHTTPGraphQLRequest({
        httpGraphQLRequest: {
          headers: new HeaderMap([['accept', 'text/html']]),
          method: 'GET',
          body: undefined,
          search: '',
        },
        context: async () => ({}),
      });
    }

    const { body: request1 } = await requestLandingPage();
    const { body: request2 } = await requestLandingPage();

    assert(request1.kind === 'complete' && request2.kind === 'complete');

    const nonce1 = request1.string.match(/nonce="([^"]+)"/)?.[1];
    const nonce2 = request2.string.match(/nonce="([^"]+)"/)?.[1];

    expect(nonce1).not.toEqual(nonce2);
    await server.stop();
  });
});
