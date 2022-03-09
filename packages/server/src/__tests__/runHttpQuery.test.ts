import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';

import { HeaderMap } from '../runHttpQuery';
import { runPotentiallyBatchedHttpQuery } from '../httpBatching';

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  fields: {
    testString: {
      type: GraphQLString,
      resolve() {
        return 'it works';
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: queryType,
});

const serverOptions = {
  debug: false,
  schema,
};

describe('runHttpQuery', () => {
  describe('handling a GET query', () => {
    it('raises a 400 error if the query is missing', async () => {
      expect(
        await runPotentiallyBatchedHttpQuery(
          {
            method: 'GET',
            headers: new HeaderMap(),
            searchParams: {},
            body: {},
          },
          {},
          { ...serverOptions, allowBatchedHttpRequests: false },
        ),
      ).toMatchInlineSnapshot(`
        Object {
          "bodyChunks": null,
          "completeBody": "{\\"errors\\":[{\\"message\\":\\"GraphQL operations must contain a non-empty \`query\` or a \`persistedQuery\` extension.\\",\\"extensions\\":{\\"code\\":\\"BAD_REQUEST\\"}}]}
        ",
          "headers": Map {
            "content-type" => "application/json",
          },
          "statusCode": 400,
        }
      `);
    });
  });

  describe('when allowBatchedHttpRequests is false', () => {
    it('succeeds when there are no batched queries in the request', async () => {
      expect(
        await runPotentiallyBatchedHttpQuery(
          {
            method: 'POST',
            headers: new HeaderMap([['content-type', 'application/json']]),
            searchParams: {},
            body: {
              query: '{ testString }',
            },
          },
          {},
          { ...serverOptions, allowBatchedHttpRequests: false },
        ),
      ).toMatchInlineSnapshot(`
        Object {
          "bodyChunks": null,
          "completeBody": "{\\"data\\":{\\"testString\\":\\"it works\\"}}
        ",
          "headers": Map {
            "content-type" => "application/json",
            "content-length" => "35",
          },
          "statusCode": undefined,
        }
      `);
    });

    it('error when there are batched queries in the request', async () => {
      expect(
        await runPotentiallyBatchedHttpQuery(
          {
            method: 'POST',
            headers: new HeaderMap([['content-type', 'application/json']]),
            searchParams: {},
            body: [
              {
                query: '{ testString }',
              },

              {
                query: '{ testString }',
              },
            ],
          },

          {},
          { ...serverOptions, allowBatchedHttpRequests: false },
        ),
      ).toMatchInlineSnapshot(`
        Object {
          "bodyChunks": null,
          "completeBody": "Operation batching disabled.",
          "headers": Map {
            "content-type" => "text/plain",
          },
          "statusCode": 400,
        }
      `);
    });
  });

  describe('when allowBatchedHttpRequests is true', () => {
    it('succeeds when there are no batched queries in the request', async () => {
      expect(
        await runPotentiallyBatchedHttpQuery(
          {
            method: 'POST',
            headers: new HeaderMap([['content-type', 'application/json']]),
            searchParams: {},
            body: {
              query: '{ testString }',
            },
          },

          {},
          { ...serverOptions, allowBatchedHttpRequests: true },
        ),
      ).toMatchInlineSnapshot(`
        Object {
          "bodyChunks": null,
          "completeBody": "{\\"data\\":{\\"testString\\":\\"it works\\"}}
        ",
          "headers": Map {
            "content-type" => "application/json",
            "content-length" => "35",
          },
          "statusCode": undefined,
        }
      `);
    });
    it('succeeds when there are multiple queries in the request', async () => {
      expect(
        await runPotentiallyBatchedHttpQuery(
          {
            method: 'POST',
            headers: new HeaderMap([['content-type', 'application/json']]),
            searchParams: {},
            body: [
              {
                query: '{ testString }',
              },

              {
                query: '{ testString }',
              },
            ],
          },

          {},
          { ...serverOptions, allowBatchedHttpRequests: true },
        ),
      ).toMatchInlineSnapshot(`
        Object {
          "bodyChunks": null,
          "completeBody": "[{\\"data\\":{\\"testString\\":\\"it works\\"}}
        ,{\\"data\\":{\\"testString\\":\\"it works\\"}}
        ]",
          "headers": Map {
            "content-type" => "application/json",
            "content-length" => "35",
          },
        }
      `);
      // TODO(AS4): decide if we want to strip the newline in batching
    });
  });
});
