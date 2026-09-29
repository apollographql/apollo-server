import { ApolloServer, HeaderMap } from '../../..';
import { describe, it, expect } from '@jest/globals';
import assert from 'assert';

describe('ApolloServerPluginDisableSuggestions', () => {
  async function makeServer({
    withPlugin,
    query,
    variables,
  }: {
    withPlugin: boolean;
    query: string;
    variables?: Record<string, unknown>;
  }) {
    const server = new ApolloServer({
      typeDefs: `#graphql
        type Query {
          hello: String
          users(filter: UserFilter!): String
          enumField(enumType: ExampleEnum): String
        }

        input UserFilter {
          name: String
        }

        enum ExampleEnum {
          RealEnumValue
        }
      `,
      resolvers: {
        Query: {
          hello() {
            return 'asdf';
          },
          users() {
            return 'ok';
          },
          enumField() {
            return 'ok';
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
            ...(variables ? { variables } : {}),
          },
        },
        context: async () => ({}),
      });
    } finally {
      await server.stop();
    }
  }

  async function errorMessage(
    response: Awaited<ReturnType<typeof makeServer>>,
  ) {
    assert(response.body.kind === 'complete');
    return JSON.parse(response.body.string).errors[0].message as string;
  }

  it('should not hide suggestions when plugin is not enabled', async () => {
    const response = await makeServer({
      withPlugin: false,
      query: `#graphql
            query {
              help
            }
          `,
    });

    expect(await errorMessage(response)).toBe(
      'Cannot query field "help" on type "Query". Did you mean "hello"?',
    );
  });

  it('should hide suggestions when plugin is enabled', async () => {
    const response = await makeServer({
      withPlugin: true,
      query: `#graphql
            query {
              help
            }
          `,
    });

    expect(await errorMessage(response)).toBe(
      'Cannot query field "help" on type "Query".',
    );
  });

  it('should not hide suggestions from variable coercion when plugin is not enabled', async () => {
    const response = await makeServer({
      withPlugin: false,
      query: `#graphql
        query GetUser($filter: UserFilter!) {
          users(filter: $filter)
        }
      `,
      variables: { filter: { nam: 'Bob' } },
    });

    expect(await errorMessage(response)).toBe(
      'Variable "$filter" got invalid value { nam: "Bob" }; Field "nam" is not defined by type "UserFilter". Did you mean "name"?',
    );
  });

  it('should hide suggestions from variable coercion when plugin is enabled', async () => {
    const response = await makeServer({
      withPlugin: true,
      query: `#graphql
        query GetUser($filter: UserFilter!) {
          users(filter: $filter)
        }
      `,
      variables: { filter: { nam: 'Bob' } },
    });

    const message = await errorMessage(response);
    expect(message).not.toMatch(/Did you mean/);
    expect(message).toBe(
      'Variable "$filter" got invalid value { nam: "Bob" }; Field "nam" is not defined by type "UserFilter".',
    );
  });

  it('should hide suggestions from invalid enum variable values when plugin is enabled', async () => {
    const response = await makeServer({
      withPlugin: true,
      query: `#graphql
        query GetEnum($enumType: ExampleEnum) {
          enumField(enumType: $enumType)
        }
      `,
      variables: { enumType: 'FakeEnumValue' },
    });

    const message = await errorMessage(response);
    expect(message).not.toMatch(/Did you mean/);
    expect(message).toBe(
      'Variable "$enumType" got invalid value "FakeEnumValue"; Value "FakeEnumValue" does not exist in "ExampleEnum" enum.',
    );
  });
});
