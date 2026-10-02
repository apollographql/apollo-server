import { ApolloServer, HeaderMap } from '../../..';
import { describe, it, expect } from '@jest/globals';
import assert from 'assert';
import { GraphQLError } from 'graphql';

describe('ApolloServerPluginDisableSuggestions', () => {
  async function makeServer({
    withPlugin,
    query,
    variables,
    resolverError,
    includeStacktraceInErrorResponses,
    onError,
  }: {
    withPlugin: boolean;
    query: string;
    variables?: Record<string, unknown>;
    resolverError?: Error;
    includeStacktraceInErrorResponses?: boolean;
    onError?: (error: GraphQLError) => void;
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
            if (resolverError) {
              throw resolverError;
            }
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
      includeStacktraceInErrorResponses,
      plugins: onError
        ? [
            {
              async requestDidStart() {
                return {
                  async didEncounterErrors({ errors }) {
                    onError(errors[0]);
                  },
                };
              },
            },
          ]
        : [],
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

    expect([
      // graphql 16
      'Variable "$filter" got invalid value { nam: "Bob" }; Field "nam" is not defined by type "UserFilter". Did you mean "name"?',
      // graphql 17
      'Variable "$filter" has invalid value: Expected value of type "UserFilter" not to include unknown field "nam". Did you mean "name"? Found: { nam: "Bob" }.',
    ]).toContain(await errorMessage(response));
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
    expect([
      // graphql 16
      'Variable "$filter" got invalid value { nam: "Bob" }; Field "nam" is not defined by type "UserFilter".',
      // graphql 17
      'Variable "$filter" has invalid value: Expected value of type "UserFilter" not to include unknown field "nam". Found: { nam: "Bob" }.',
    ]).toContain(message);
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
    expect([
      // graphql 16
      'Variable "$enumType" got invalid value "FakeEnumValue"; Value "FakeEnumValue" does not exist in "ExampleEnum" enum.',
      // graphql 17
      'Variable "$enumType" has invalid value: Value "FakeEnumValue" does not exist in "ExampleEnum" enum.',
    ]).toContain(message);
  });

  it.each([
    new Error('Action failed. Did you mean to retry?'),
    new GraphQLError('Action failed. Did you mean to retry?', {
      extensions: { code: 'BAD_USER_INPUT' },
    }),
  ])(
    'should preserve resolver messages and stacks for %s',
    async (resolverError) => {
      const response = await makeServer({
        withPlugin: true,
        query: '{ hello }',
        resolverError,
        includeStacktraceInErrorResponses: true,
      });

      assert(response.body.kind === 'complete');
      const error = JSON.parse(response.body.string).errors[0];
      expect(error.message).toBe(resolverError.message);
      expect(error.extensions.stacktrace).toEqual(
        resolverError.stack?.split('\n'),
      );
    },
  );

  it.each([
    {
      query: 'query ($filter: UserFilter!) { users(filter: $filter) }',
      variables: { filter: { nam: 'Bob' } },
    },
    {
      query:
        'query ($enumType: ExampleEnum) { enumField(enumType: $enumType) }',
      variables: { enumType: 'FakeEnumValue' },
    },
  ])(
    'should hide variable suggestions from stacktraces for $query',
    async ({ query, variables }) => {
      let originalStackFrames: string[] | undefined;
      const response = await makeServer({
        withPlugin: true,
        query,
        variables,
        includeStacktraceInErrorResponses: true,
        onError(error) {
          assert(error.stack);
          error.stack += '\n    at Did you mean "name"? (caller.ts:1:1)';
          originalStackFrames = error.stack.split('\n').slice(1);
        },
      });

      assert(response.body.kind === 'complete');
      const error = JSON.parse(response.body.string).errors[0];
      expect(error.message).not.toContain('Did you mean');
      expect(error.extensions.stacktrace[0]).not.toContain('Did you mean');
      expect(error.extensions.stacktrace.slice(1)).toEqual(originalStackFrames);
    },
  );
});
