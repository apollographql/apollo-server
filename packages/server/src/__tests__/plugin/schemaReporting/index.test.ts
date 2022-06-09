import {
  ApolloServer,
  ApolloServerPluginUsageReportingDisabled,
} from '../../..';
import { ApolloServerPluginSchemaReporting } from '../../../plugin/schemaReporting';

describe('end-to-end', () => {
  it('fails for unparsable overrideReportedSchema', async () => {
    await expect(
      new ApolloServer({
        typeDefs: 'type Query { foo: Int }',
        apollo: { key: 'foo', graphRef: 'bar' },
        plugins: [
          ApolloServerPluginUsageReportingDisabled(),
          ApolloServerPluginSchemaReporting({
            overrideReportedSchema: 'type Query {',
          }),
        ],
      }).start(),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"The schema provided to overrideReportedSchema failed to parse or validate: Syntax Error: Expected Name, found <EOF>."`,
    );
  });

  it('fails for invalid overrideReportedSchema', async () => {
    await expect(
      new ApolloServer({
        typeDefs: 'type Query { foo: Int }',
        apollo: { key: 'foo', graphRef: 'bar' },
        plugins: [
          ApolloServerPluginUsageReportingDisabled(),
          ApolloServerPluginSchemaReporting({
            overrideReportedSchema: 'type Query',
          }),
        ],
      }).start(),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"The schema provided to overrideReportedSchema failed to parse or validate: Type Query must define one or more fields."`,
    );
  });
});
