import { ApolloServer, HeaderMap } from '@apollo/server';
import { gql } from 'graphql-tag';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { describe, it, expect } from '@jest/globals';
import assert from 'assert';
import { Trace } from '@apollo/usage-reporting-protobuf';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';

describe('ApolloServerPluginInlineTrace', () => {
  it('Adds errors within lists to the correct path rather than the root', async () => {
    const server = new ApolloServer({
      schema: buildSubgraphSchema({
        typeDefs: gql`
          type Query {
            a: A!
          }
          type A {
            brokenList: [String!]!
          }
        `,
        resolvers: {
          Query: {
            a: () => ({}),
          },
          A: {
            brokenList() {
              return ['hello world!', null];
            },
          },
        },
      }),
      plugins: [
        // silence logs about the plugin being enabled
        ApolloServerPluginInlineTrace(),
      ],
    });
    await server.start();
    const result = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        body: { query: '{a{brokenList}}' },
        headers: new HeaderMap([
          ['content-type', 'application/json'],
          ['apollo-federation-include-trace', 'ftv1'],
        ]),
        method: 'POST',
        search: '',
      },
      context: async () => ({}),
    });
    assert(result.body.kind === 'complete');
    const trace = Trace.decode(
      Buffer.from(JSON.parse(result.body.string).extensions?.ftv1, 'base64'),
    );
    expect(trace.root?.error).toHaveLength(0);
    // error is found at path a.brokenList.1
    expect(trace.root?.child?.[0].child?.[0].child?.[0].error)
      .toMatchInlineSnapshot(`
      [
        {
          "json": "{"message":"<masked>","locations":[{"line":1,"column":4}],"path":["a","brokenList",1],"extensions":{"maskedBy":"ApolloServerPluginInlineTrace"}}",
          "location": [
            {
              "column": 4,
              "line": 1,
            },
          ],
          "message": "<masked>",
        },
      ]
    `);

    await server.stop();
  });
});
