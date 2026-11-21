import { ApolloServer, HeaderMap } from '..';
import { describe, it, expect } from '@jest/globals';
import assert from 'assert';

describe('hideSchemaDetailsFromClientErrors', () => {
  async function firstErrorMessage({
    hide,
    query,
    variables,
  }: {
    hide: boolean;
    query: string;
    variables?: Record<string, unknown>;
  }) {
    const server = new ApolloServer({
      typeDefs: `#graphql
        enum Color {
          RED
          GREEN
        }
        input UserFilter {
          name: String
        }
        type Query {
          hello: String
          color(c: Color): String
          users(filter: UserFilter): String
        }
      `,
      resolvers: {
        Query: {
          hello() {
            return 'asdf';
          },
        },
      },
      hideSchemaDetailsFromClientErrors: hide,
    });

    await server.start();

    try {
      const response = await server.executeHTTPGraphQLRequest({
        httpGraphQLRequest: {
          method: 'POST',
          headers: new HeaderMap([['apollo-require-preflight', 't']]),
          search: '',
          body: variables ? { query, variables } : { query },
        },
        context: async () => ({}),
      });
      assert(response.body.kind === 'complete');
      return JSON.parse(response.body.string).errors[0].message as string;
    } finally {
      await server.stop();
    }
  }

  describe('validation errors', () => {
    const query = '{ help }';
    it('includes suggestions by default', async () => {
      expect(await firstErrorMessage({ hide: false, query })).toBe(
        'Cannot query field "help" on type "Query". Did you mean "hello"?',
      );
    });
    it('hides suggestions', async () => {
      expect(await firstErrorMessage({ hide: true, query })).toBe(
        'Cannot query field "help" on type "Query".',
      );
    });

    const enumQuery = '{ color(c: RAD) }';
    it('includes enum value suggestions by default', async () => {
      expect(await firstErrorMessage({ hide: false, query: enumQuery })).toBe(
        'Value "RAD" does not exist in "Color" enum. Did you mean the enum value "RED"?',
      );
    });
    it('hides enum value suggestions', async () => {
      expect(await firstErrorMessage({ hide: true, query: enumQuery })).toBe(
        'Value "RAD" does not exist in "Color" enum.',
      );
    });
  });

  // See https://github.com/apollographql/apollo-server/issues/8086
  describe('variable coercion errors', () => {
    const query = 'query ($f: UserFilter) { users(filter: $f) }';
    const variables = { f: { nam: 'Bob' } };
    it('includes suggestions by default', async () => {
      expect(await firstErrorMessage({ hide: false, query, variables })).toBe(
        'Variable "$f" has invalid value: Expected value of type "UserFilter" not to include unknown field "nam". Did you mean "name"? Found: { nam: "Bob" }.',
      );
    });
    it('hides suggestions', async () => {
      expect(await firstErrorMessage({ hide: true, query, variables })).toBe(
        'Variable "$f" has invalid value: Expected value of type "UserFilter" not to include unknown field "nam", found: { nam: "Bob" }.',
      );
    });

    const enumQuery = 'query ($c: Color) { color(c: $c) }';
    const enumVariables = { c: 'RAD' };
    it('includes enum value suggestions by default', async () => {
      expect(
        await firstErrorMessage({
          hide: false,
          query: enumQuery,
          variables: enumVariables,
        }),
      ).toBe(
        'Variable "$c" has invalid value: Value "RAD" does not exist in "Color" enum. Did you mean the enum value "RED"?',
      );
    });
    it('hides enum value suggestions', async () => {
      expect(
        await firstErrorMessage({
          hide: true,
          query: enumQuery,
          variables: enumVariables,
        }),
      ).toBe(
        'Variable "$c" has invalid value: Value "RAD" does not exist in "Color" enum.',
      );
    });
  });
});
