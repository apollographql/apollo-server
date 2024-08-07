import { ApolloServer, HeaderMap } from '../../..';
import { describe, it, expect } from '@jest/globals';
import assert from 'assert';

describe('ApolloServerPluginDisableSuggestions', () => {
  async function makeServer({
    withPlugin,
    query,
  }: {
    withPlugin: boolean;
    query: string;
  }) {
    const server = new ApolloServer({
      typeDefs: 'type Query {hello: String}',
      resolvers: {
        Query: {
          hello() {
            return 'asdf';
          },
        },
      },
      hideSchemaDetailsFromClientErrors: withPlugin,
    });

    await server.start();

    try {
      return await server.executeHTTPGraphQLRequest({
        httpGraphQLRequest: {
          method: 'POST',
          headers: new HeaderMap([['apollo-require-preflight', 't']]),
          search: '',
          body: {
            query,
          },
        },
        context: async () => ({}),
      });
    } finally {
      await server.stop();
    }
  }

  it('should not hide suggestions when plugin is not enabled', async () => {
    const response = await makeServer({
      withPlugin: false,
      // cSpell:disable
      query: `#graphql
            query {
              helloo
            }
          `,
      // cSpell:enable
    });

    assert(response.body.kind === 'complete');
    expect(JSON.parse(response.body.string).errors[0].message).toBe(
      // cspell:disable-next-line
      'Cannot query field "helloo" on type "Query". Did you mean "hello"?',
    );
  });

  it('should hide suggestions when plugin is enabled', async () => {
    const response = await makeServer({
      withPlugin: true,
      // cSpell:disable
      query: `#graphql
            query {
              helloo
            }
          `,
      // cSpell:enable
    });

    assert(response.body.kind === 'complete');
    expect(JSON.parse(response.body.string).errors[0].message).toBe(
      // cspell:disable-next-line
      'Cannot query field "helloo" on type "Query".',
    );
  });
});
