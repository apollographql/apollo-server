import {
  ApolloServerPluginSchemaReporting,
  ApolloServerPluginSchemaReportingOptions,
} from '..';
import pluginTestHarness from 'apollo-server-core/dist/utils/pluginTestHarness';
import { makeExecutableSchema } from 'graphql-tools';
import { graphql } from 'graphql';

describe('end-to-end', () => {
  async function runTest({
    pluginOptions = {},
  }: {
    pluginOptions?: ApolloServerPluginSchemaReportingOptions;
  }) {
    return await pluginTestHarness({
      pluginInstance: ApolloServerPluginSchemaReporting(pluginOptions),
      graphqlRequest: {
        query: 'query { __typename }',
      },
      executor: async ({ request: { query }, context }) => {
        return await graphql({
          schema: makeExecutableSchema({ typeDefs: 'type Query { foo: Int }' }),
          source: query,
          // context is needed for schema instrumentation to find plugins.
          contextValue: context,
        });
      },
    });
  }

  it('fails for unparsable overrideReportedSchema', async () => {
    await expect(
      runTest({
        pluginOptions: {
          overrideReportedSchema: 'type Query {',
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"The schema provided to overrideReportedSchema failed to parse or validate: Syntax Error: Expected Name, found <EOF>"`,
    );
  });

  it('fails for invalid overrideReportedSchema', async () => {
    await expect(
      runTest({
        pluginOptions: {
          overrideReportedSchema: 'type Query',
        },
      }),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"The schema provided to overrideReportedSchema failed to parse or validate: Type Query must define one or more fields."`,
    );
  });
});
