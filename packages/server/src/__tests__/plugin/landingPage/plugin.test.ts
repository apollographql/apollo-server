import { ApolloServer, HeaderMap } from '@apollo/server';
import { ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';
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

  test(`nonce exists in non-embedded landing page`, async () => {
    const plugin = ApolloServerPluginLandingPageProductionDefault({
      embed: false,
    });

    // @ts-ignore not passing things to `serverWillStart`
    const { renderLandingPage } = await plugin.serverWillStart?.({});
    const landingPageHtml = await (await renderLandingPage?.()).html();

    expect(landingPageHtml).toMatch(/<script nonce=".*">window\.landingPage/);
  });
});
