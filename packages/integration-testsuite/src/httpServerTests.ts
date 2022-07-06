// This file contains the original integration test suite dating back to the
// Apollo Server 1 days where there wasn't even an ApolloServer object. The
// individual tests just talk to the http.Server returned from their createApp
// function. Newer tests have generally been added to the apolloServerTests.ts
// file.
import { createHash } from '@apollo/utils.createhash';
import resolvable from '@josephg/resolvable';
import {
  BREAK,
  DocumentNode,
  getIntrospectionQuery,
  getOperationAST,
  GraphQLError,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  ValidationContext,
} from 'graphql';
import gql from 'graphql-tag';
import { InMemoryLRUCache, KeyValueCache } from '@apollo/utils.keyvaluecache';
import type { HTTPError } from 'superagent';
import request from 'supertest';
import type {
  CreateServerForIntegrationTests,
  CreateServerForIntegrationTestsOptions,
} from './index.js';
import type {
  ApolloServer,
  ApolloServerOptions,
  BaseContext,
  GraphQLRequestContext,
  GraphQLRequestListener,
  PersistedQueryOptions,
} from '@apollo/server';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import { ApolloServerPluginCacheControlDisabled } from '@apollo/server/plugin/disabled';
import {
  jest,
  it,
  describe,
  expect,
  beforeEach,
  afterEach,
} from '@jest/globals';
import type { Mock, SpyInstance } from 'jest-mock';

const QueryRootType = new GraphQLObjectType({
  name: 'QueryRoot',
  fields: {
    test: {
      type: GraphQLString,
      args: {
        who: {
          type: GraphQLString,
        },
      },
      resolve: (_, args) => 'Hello ' + (args['who'] || 'World'),
    },
    thrower: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: () => {
        throw new Error('Throws!');
      },
    },
    custom: {
      type: GraphQLString,
      args: {
        foo: {
          type: new GraphQLScalarType({
            name: 'Foo',
            serialize: (v) => v,
            parseValue: () => {
              throw new Error('Something bad happened');
            },
            parseLiteral: () => {
              throw new Error('Something bad happened');
            },
          }),
        },
      },
    },
    context: {
      type: GraphQLString,
      resolve: (_obj, _args, context) => context,
    },
  },
});

const TestSchema = new GraphQLSchema({
  query: QueryRootType,
  mutation: new GraphQLObjectType({
    name: 'MutationRoot',
    fields: {
      writeTest: {
        type: QueryRootType,
        resolve: () => ({}),
      },
    },
  }),
});

const personType = new GraphQLObjectType({
  name: 'PersonType',
  fields: {
    firstName: {
      type: GraphQLString,
    },
    lastName: {
      type: GraphQLString,
    },
  },
});

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  fields: {
    testString: {
      type: GraphQLString,
      resolve() {
        return 'it works';
      },
    },
    testPerson: {
      type: personType,
      resolve() {
        return { firstName: 'Jane', lastName: 'Doe' };
      },
    },
    testPersonWithCacheControl: {
      type: personType,
      resolve(_source, _args, _context, info) {
        info.cacheControl.setCacheHint({ maxAge: 11 });
        return { firstName: 'Jane', lastName: 'Doe' };
      },
    },
    testStringWithDelay: {
      type: GraphQLString,
      args: {
        delay: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(_, args) {
        return new Promise((resolve) => {
          setTimeout(() => resolve('it works'), args['delay']);
        });
      },
    },
    testContext: {
      type: GraphQLString,
      resolve(_parent, _args, context) {
        if (context.otherField) {
          return 'unexpected';
        }
        context.otherField = true;
        return context.testField;
      },
    },
    testRootValue: {
      type: GraphQLString,
      resolve(rootValue) {
        return rootValue;
      },
    },
    testArgument: {
      type: GraphQLString,
      args: { echo: { type: GraphQLString } },
      resolve(_, { echo }) {
        return `hello ${echo}`;
      },
    },
    testError: {
      type: GraphQLString,
      resolve() {
        throw new Error('Secret error message');
      },
    },
  },
});

const mutationType = new GraphQLObjectType({
  name: 'MutationType',
  fields: {
    testMutation: {
      type: GraphQLString,
      args: { echo: { type: GraphQLString } },
      resolve(_, { echo }) {
        return `not really a mutation, but who cares: ${echo}`;
      },
    },
    testPerson: {
      type: personType,
      args: {
        firstName: {
          type: new GraphQLNonNull(GraphQLString),
        },
        lastName: {
          type: new GraphQLNonNull(GraphQLString),
        },
      },
      resolve(_, args) {
        return args;
      },
    },
    testRootValue: {
      type: GraphQLString,
      resolve(rootValue) {
        return rootValue;
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

export function defineIntegrationTestSuiteHttpServerTests(
  createServer: CreateServerForIntegrationTests,
  options: {
    serverIsStartedInBackground?: boolean;
  } = {},
) {
  describe('httpServerTests.ts', () => {
    let didEncounterErrors: Mock<
      NonNullable<GraphQLRequestListener<BaseContext>['didEncounterErrors']>
    >;

    let serverToCleanUp: ApolloServer | null = null;
    let extraCleanup: (() => Promise<void>) | null = null;

    async function createApp(
      config?: ApolloServerOptions<BaseContext>,
      options?: CreateServerForIntegrationTestsOptions,
    ): Promise<string> {
      const serverInfo = await createServer(config ?? { schema }, options);
      serverToCleanUp = serverInfo.server;
      extraCleanup = serverInfo.extraCleanup ?? null;
      return serverInfo.url;
    }

    // This will get called at the end of each test, and also tests
    // which want to test stop() behavior can call it themselves (so it's OK to call
    // it more than once).
    async function stopServer() {
      try {
        await serverToCleanUp?.stop();
        await extraCleanup?.();
      } finally {
        serverToCleanUp = null;
        extraCleanup = null;
      }
    }
    afterEach(stopServer);

    describe('graphqlHTTP', () => {
      it('rejects the request if the method is not POST or GET', async () => {
        const app = await createApp();
        const req = request(app)
          .head('/')
          // Make sure we get the error we're looking for, not the CSRF
          // prevention error :)
          .set('apollo-require-preflight', 't')
          .send();
        return req.then((res) => {
          expect(res.status).toEqual(405);
          expect(res.headers['allow']).toEqual('GET, POST');
        });
      });

      it('throws an error if POST body is empty', async () => {
        const app = await createApp();
        const req = request(app)
          .post('/')
          .type('text/plain')
          .set('apollo-require-preflight', 't')
          .send('  ');
        return req.then((res) => {
          expect(res.status).toEqual(400);
          expect((res.error as HTTPError).text).toMatch('POST body missing');
        });
      });

      it('throws an error if POST body is missing even with content-type', async () => {
        const app = await createApp();
        const req = request(app).post('/').type('application/json').send();
        return req.then((res) => {
          expect(res.status).toEqual(400);
          expect((res.error as HTTPError).text).toMatch('POST body missing');
        });
      });

      it('throws an error if invalid content-type', async () => {
        const app = await createApp();
        const req = request(app)
          .post('/')
          .type('text/plain')
          .set('apollo-require-preflight', 't')
          .send(
            JSON.stringify({
              query: 'query test{ testString }',
            }),
          );
        return req.then((res) => {
          expect(res.status).toEqual(400);
          expect((res.error as HTTPError).text).toMatch('invalid Content-Type');
        });
      });

      it('throws an error if POST operation is missing', async () => {
        const app = await createApp();
        const req = request(app).post('/').send({});
        return req.then((res) => {
          expect(res.status).toEqual(400);
          expect((res.error as HTTPError).text).toMatch('has no keys');
        });
      });

      it('throws an error if POST operation is empty', async () => {
        const app = await createApp();
        const req = request(app).post('/').send({ query: '' });
        return req.then((res) => {
          expect(res.status).toEqual(400);
          expect((res.error as HTTPError).text).toMatch('non-empty `query`');
        });
      });

      it('throws an error if POST JSON is malformed', async () => {
        const app = await createApp();
        const req = request(app)
          .post('/')
          .type('application/json')
          .send('{foo');
        return req.then((res) => {
          expect(res.status).toEqual(400);
          expect((res.error as HTTPError).text).toMatch('Unexpected token f');
        });
      });

      it('returns an error on parse failure', async () => {
        const app = await createApp();
        const res = await request(app).post('/').send({
          query: `{`,
        });

        expect(res.status).toEqual(400);
        expect(res.body).toMatchInlineSnapshot(`
          Object {
            "errors": Array [
              Object {
                "extensions": Object {
                  "code": "GRAPHQL_PARSE_FAILED",
                },
                "locations": Array [
                  Object {
                    "column": 2,
                    "line": 1,
                  },
                ],
                "message": "Syntax Error: Expected Name, found <EOF>.",
              },
            ],
          }
        `);
      });

      it('returns an error on validation failure', async () => {
        const app = await createApp();
        const res = await request(app).post('/').send({
          query: `{ hello }`,
        });

        expect(res.status).toEqual(400);
        expect(res.body).toMatchInlineSnapshot(`
          Object {
            "errors": Array [
              Object {
                "extensions": Object {
                  "code": "GRAPHQL_VALIDATION_FAILED",
                },
                "locations": Array [
                  Object {
                    "column": 3,
                    "line": 1,
                  },
                ],
                "message": "Cannot query field \\"hello\\" on type \\"QueryType\\".",
              },
            ],
          }
        `);
      });

      it('FIXME', async () => {
        const app = await createApp();
        const res = await request(app).post('/').send({
          query: `query BadName { testString }`,
          operationName: 'NotBadName',
        });

        expect(res.status).toEqual(400);
        expect(res.body).toMatchInlineSnapshot();
      });

      it('throws an error if GET query is missing', async () => {
        const app = await createApp();
        const res = await request(app)
          .get(`/`)
          .set('apollo-require-preflight', 't');
        expect(res.status).toEqual(400);
        expect(JSON.parse((res.error as HTTPError).text))
          .toMatchInlineSnapshot(`
          Object {
            "errors": Array [
              Object {
                "extensions": Object {
                  "code": "BAD_REQUEST",
                },
                "message": "GraphQL operations must contain a non-empty \`query\` or a \`persistedQuery\` extension.",
              },
            ],
          }
        `);
      });

      it('can handle a basic GET request', async () => {
        const app = await createApp();
        const expected = {
          testString: 'it works',
        };
        const query = {
          query: 'query test{ testString }',
        };
        const req = request(app)
          .get('/')
          .set('apollo-require-preflight', 't')
          .query(query);
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual(expected);
        });
      });

      it('can handle a basic implicit GET request', async () => {
        const app = await createApp();
        const expected = {
          testString: 'it works',
        };
        const query = {
          query: '{ testString }',
        };
        const req = request(app)
          .get('/')
          .set('apollo-require-preflight', 't')
          .query(query);
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual(expected);
        });
      });

      it('throws error if trying to use mutation using GET request', async () => {
        didEncounterErrors = jest.fn();
        const app = await createApp({
          schema,
          plugins: [
            {
              async requestDidStart() {
                return { didEncounterErrors };
              },
            },
          ],
        });
        const query = {
          query: 'mutation test{ testMutation(echo: "ping") }',
        };
        const req = request(app)
          .get('/')
          .set('apollo-require-preflight', 't')
          .query(query);

        await req.then((res) => {
          expect(res.status).toEqual(405);
          expect(res.headers['allow']).toEqual('POST');
          expect(res.body).toMatchInlineSnapshot(`
            Object {
              "errors": Array [
                Object {
                  "extensions": Object {
                    "code": "BAD_REQUEST",
                  },
                  "message": "GET requests only support query operations, not mutation operations",
                },
              ],
            }
          `);
        });

        expect(didEncounterErrors).toBeCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining([
              expect.objectContaining({
                message:
                  'GET requests only support query operations, not mutation operations',
              }),
            ]),
          }),
        );
      });

      it('throws error if trying to use mutation with fragment using GET request', async () => {
        didEncounterErrors = jest.fn();
        const app = await createApp({
          schema,
          plugins: [
            {
              async requestDidStart() {
                return { didEncounterErrors };
              },
            },
          ],
        });
        const query = {
          query: `fragment PersonDetails on PersonType {
              firstName
            }

            mutation test {
              testPerson(firstName: "Test", lastName: "Me") {
                ...PersonDetails
              }
            }`,
        };
        const req = request(app)
          .get('/')
          .set('apollo-require-preflight', 't')
          .query(query);
        await req.then((res) => {
          expect(res.status).toEqual(405);
          expect(res.headers['allow']).toEqual('POST');
          expect(res.body).toMatchInlineSnapshot(`
            Object {
              "errors": Array [
                Object {
                  "extensions": Object {
                    "code": "BAD_REQUEST",
                  },
                  "message": "GET requests only support query operations, not mutation operations",
                },
              ],
            }
          `);
        });

        expect(didEncounterErrors).toBeCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining([
              expect.objectContaining({
                message:
                  'GET requests only support query operations, not mutation operations',
              }),
            ]),
          }),
        );
      });

      it('can handle a GET request with variables', async () => {
        const app = await createApp();
        const query = {
          query: 'query test($echo: String){ testArgument(echo: $echo) }',
          variables: JSON.stringify({ echo: 'world' }),
        };
        const expected = {
          testArgument: 'hello world',
        };
        const req = request(app)
          .get('/')
          .set('apollo-require-preflight', 't')
          .query(query);
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual(expected);
        });
      });

      it('can handle a basic request', async () => {
        const app = await createApp();
        const expected = {
          testString: 'it works',
        };
        const req = request(app).post('/').send({
          query: 'query test{ testString }',
        });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual(expected);
        });
      });

      describe('cache-control', () => {
        const books = [
          {
            title: 'H',
            author: 'J',
          },
        ];

        const typeDefs = gql`
          type Book {
            title: String
            author: String
          }

          type Cook @cacheControl(maxAge: 200) {
            title: String
            author: String
          }

          type Pook @cacheControl(maxAge: 200) {
            title: String
            books: [Book] @cacheControl(maxAge: 20, scope: PRIVATE)
          }

          type Query {
            books: [Book]
            cooks: [Cook]
            pooks: [Pook]
          }

          enum CacheControlScope {
            PUBLIC
            PRIVATE
          }

          directive @cacheControl(
            maxAge: Int
            scope: CacheControlScope
          ) on FIELD_DEFINITION | OBJECT | INTERFACE
        `;

        const resolvers = {
          Query: {
            books: () => books,
            cooks: () => books,
            pooks: () => [{ title: 'pook', books }],
          },
        };

        it('applies cacheControl Headers', async () => {
          const app = await createApp({ typeDefs, resolvers });
          const res = await request(app).post('/').send({
            query: `{ cooks { title author } }`,
          });
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual({ cooks: books });
          expect(res.headers['cache-control']).toEqual('max-age=200, public');
        });

        it('contains no cacheControl Headers when uncacheable', async () => {
          const app = await createApp({ typeDefs, resolvers });
          const res = await request(app).post('/').send({
            query: `{ books { title author } }`,
          });
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual({ books });
          expect(res.headers['cache-control']).toBeUndefined;
        });

        it('contains private cacheControl Headers when scoped', async () => {
          const app = await createApp({ typeDefs, resolvers });
          const res = await request(app).post('/').send({
            query: `{ pooks { title books { title author } } }`,
          });
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual({
            pooks: [{ title: 'pook', books }],
          });
          expect(res.headers['cache-control']).toEqual('max-age=20, private');
        });

        it('runs when cache-control is disabled', async () => {
          const app = await createApp({
            typeDefs,
            resolvers,
            plugins: [ApolloServerPluginCacheControlDisabled()],
          });
          const res = await request(app).post('/').send({
            query: `{ pooks { title books { title author } } }`,
          });
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual({
            pooks: [{ title: 'pook', books }],
          });
          expect(res.headers['cache-control']).toBeUndefined;
        });
      });

      it('cache-control not set without any hints', async () => {
        const app = await createApp({
          schema,
        });
        const expected = {
          testPerson: { firstName: 'Jane' },
        };
        const req = request(app).post('/').send({
          query: 'query test{ testPerson { firstName } }',
        });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual(expected);
          expect(res.headers['cache-control']).toBeUndefined();
        });
      });

      it('cache-control set with dynamic hint', async () => {
        const app = await createApp({
          schema,
        });
        const expected = {
          testPersonWithCacheControl: { firstName: 'Jane' },
        };
        const req = request(app).post('/').send({
          query: 'query test{ testPersonWithCacheControl { firstName } }',
        });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual(expected);
          expect(res.headers['cache-control']).toBe('max-age=11, public');
        });
      });

      it('cache-control set with defaultMaxAge', async () => {
        const app = await createApp({
          schema,
          plugins: [ApolloServerPluginCacheControl({ defaultMaxAge: 5 })],
        });
        const expected = {
          testPerson: { firstName: 'Jane' },
        };
        const req = request(app).post('/').send({
          query: 'query test{ testPerson { firstName } }',
        });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual(expected);
          expect(res.headers['cache-control']).toBe('max-age=5, public');
        });
      });

      it('returns PersistedQueryNotSupported to a GET request if PQs disabled', async () => {
        const app = await createApp({
          schema,
          persistedQueries: false,
        });
        const req = request(app)
          .get('/')
          .set('apollo-require-preflight', 't')
          .query({
            extensions: JSON.stringify({
              persistedQuery: {
                version: 1,
                sha256Hash:
                  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              },
            }),
          });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toEqual(
            'PersistedQueryNotSupported',
          );
          expect(res.headers['cache-control']).toBe(
            'private, no-cache, must-revalidate',
          );
        });
      });

      it('returns PersistedQueryNotSupported to a POST request if PQs disabled', async () => {
        const app = await createApp({
          schema,
          persistedQueries: false,
        });
        const req = request(app)
          .post('/')
          .send({
            extensions: {
              persistedQuery: {
                version: 1,
                sha256Hash:
                  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              },
            },
          });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors.length).toEqual(1);
          expect(res.body.errors[0].message).toEqual(
            'PersistedQueryNotSupported',
          );
          expect(res.headers['cache-control']).toBe(
            'private, no-cache, must-revalidate',
          );
        });
      });

      it('returns PersistedQueryNotFound to a GET request', async () => {
        const app = await createApp();
        const req = request(app)
          .get('/')
          .set('apollo-require-preflight', 't')
          .query({
            extensions: JSON.stringify({
              persistedQuery: {
                version: 1,
                sha256Hash:
                  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              },
            }),
          });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors.length).toEqual(1);
          expect(res.body.errors[0].message).toEqual('PersistedQueryNotFound');
          expect(res.headers['cache-control']).toBe(
            'private, no-cache, must-revalidate',
          );
        });
      });

      it('returns PersistedQueryNotFound to a POST request', async () => {
        const app = await createApp();
        const req = request(app)
          .post('/')
          .send({
            extensions: {
              persistedQuery: {
                version: 1,
                sha256Hash:
                  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              },
            },
          });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors.length).toEqual(1);
          expect(res.body.errors[0].message).toEqual('PersistedQueryNotFound');
          expect(res.headers['cache-control']).toBe(
            'private, no-cache, must-revalidate',
          );
        });
      });

      it('can handle a request with variables', async () => {
        const app = await createApp();
        const expected = {
          testArgument: 'hello world',
        };
        const req = request(app)
          .post('/')
          .send({
            query: 'query test($echo: String){ testArgument(echo: $echo) }',
            variables: { echo: 'world' },
          });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual(expected);
        });
      });

      it('POST does not handle a request with variables as string', async () => {
        const app = await createApp();
        const res = await request(app).post('/').send({
          query: 'query test($echo: String!){ testArgument(echo: $echo) }',
          variables: '{ "echo": "world" }',
        });
        expect(res.status).toEqual(400);
        expect(res.body).toMatchInlineSnapshot(`
          Object {
            "errors": Array [
              Object {
                "extensions": Object {
                  "code": "BAD_REQUEST",
                },
                "message": "\`variables\` in a POST body should be provided as an object, not a recursively JSON-encoded string.",
              },
            ],
          }
        `);
      });

      it('POST does not handle a request with extensions as string', async () => {
        const app = await createApp();
        const res = await request(app).post('/').send({
          query: 'query test($echo: String!){ testArgument(echo: $echo) }',
          extensions: '{ "echo": "world" }',
        });
        expect(res.status).toEqual(400);
        expect(res.body).toMatchInlineSnapshot(`
          Object {
            "errors": Array [
              Object {
                "extensions": Object {
                  "code": "BAD_REQUEST",
                },
                "message": "\`extensions\` in a POST body should be provided as an object, not a recursively JSON-encoded string.",
              },
            ],
          }
        `);
      });

      it('can handle a request with operationName', async () => {
        const app = await createApp();
        const expected = {
          testString: 'it works',
        };
        const req = request(app)
          .post('/')
          .send({
            query: `
                      query test($echo: String){ testArgument(echo: $echo) }
                      query test2{ testString }`,
            variables: { echo: 'world' },
            operationName: 'test2',
          });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual(expected);
        });
      });

      it('can handle introspection request', async () => {
        const app = await createApp();
        const req = request(app)
          .post('/')
          .send({ query: getIntrospectionQuery() });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data.__schema.types[0].fields[0].name).toEqual(
            'testString',
          );
        });
      });

      it('does not accept a query AST', async () => {
        const app = await createApp();
        const req = request(app)
          .post('/')
          .send({
            query: gql`
              query test {
                testString
              }
            `,
          });
        return req.then((res) => {
          expect(res.status).toEqual(400);
          expect(res.text).toMatch('GraphQL queries must be strings');
        });
      });

      it('can handle batch requests', async () => {
        const app = await createApp({ schema, allowBatchedHttpRequests: true });
        const expected = [
          {
            data: {
              testString: 'it works',
            },
          },
          {
            data: {
              testArgument: 'hello yellow',
            },
          },
        ];
        const req = request(app)
          .post('/')
          .send([
            {
              query: `
                      query test($echo: String){ testArgument(echo: $echo) }
                      query test2{ testString }`,
              variables: { echo: 'world' },
              operationName: 'test2',
            },
            {
              query: `
                      query testX($echo: String){ testArgument(echo: $echo) }`,
              variables: { echo: 'yellow' },
              operationName: 'testX',
            },
          ]);
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toEqual(expected);
        });
      });

      it('can handle non-batch requests when allowBatchedHttpRequests is true', async () => {
        const app = await createApp({ schema, allowBatchedHttpRequests: true });
        const expected = {
          data: {
            testString: 'it works',
          },
        };
        const req = request(app)
          .post('/')
          .send({
            query: `
                      query test($echo: String){ testArgument(echo: $echo) }
                      query test2{ testString }`,
            variables: { echo: 'world' },
            operationName: 'test2',
          });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toEqual(expected);
        });
      });

      it('can handle batch requests with one element', async () => {
        const app = await createApp({ schema, allowBatchedHttpRequests: true });
        const expected = [
          {
            data: {
              testString: 'it works',
            },
          },
        ];
        const req = request(app)
          .post('/')
          .send([
            {
              query: `
                      query test($echo: String){ testArgument(echo: $echo) }
                      query test2{ testString }`,
              variables: { echo: 'world' },
              operationName: 'test2',
            },
          ]);
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toEqual(expected);
        });
      });

      it('can handle batch requests in parallel', async function () {
        const parallels = 100;
        const delayPerReq = 40;

        const app = await createApp({ schema, allowBatchedHttpRequests: true });
        const expected = Array(parallels).fill({
          data: { testStringWithDelay: 'it works' },
        });
        const req = request(app)
          .post('/')
          .send(
            Array(parallels).fill({
              query: `query test($delay: Int!) { testStringWithDelay(delay: $delay) }`,
              operationName: 'test',
              variables: { delay: delayPerReq },
            }),
          );
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toEqual(expected);
        });
      }, 3000); // this test will fail due to timeout if running serially.

      it('disables batch requests by default', async () => {
        const app = await createApp();

        const res = await request(app)
          .post('/')
          .send([
            {
              query: `
                      query test($echo: String){ testArgument(echo: $echo) }
                      query test2{ testString }`,
              variables: { echo: 'world' },
              operationName: 'test2',
            },
            {
              query: `
                      query testX($echo: String){ testArgument(echo: $echo) }`,
              variables: { echo: 'yellow' },
              operationName: 'testX',
            },
          ]);

        expect(res.status).toEqual(400);
        expect(res.body).toMatchInlineSnapshot(`
          Object {
            "errors": Array [
              Object {
                "extensions": Object {
                  "code": "BAD_REQUEST",
                },
                "message": "Operation batching disabled.",
              },
            ],
          }
        `);
      });

      it('clones batch context', async () => {
        const app = await createApp(
          {
            schema,
            allowBatchedHttpRequests: true,
          },
          { context: async () => ({ testField: 'expected' }) },
        );
        const expected = [
          {
            data: {
              testContext: 'expected',
            },
          },
          {
            data: {
              testContext: 'expected',
            },
          },
        ];
        const req = request(app)
          .post('/')
          .send([
            {
              query: 'query test{ testContext }',
            },
            {
              query: 'query test{ testContext }',
            },
          ]);
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body).toEqual(expected);
        });
      });

      it('executes batch context if it is a function', async () => {
        let callCount = 0;
        const app = await createApp(
          {
            schema,
            allowBatchedHttpRequests: true,
          },
          {
            context: async () => {
              callCount++;
              return { testField: 'expected' };
            },
          },
        );
        const expected = [
          {
            data: {
              testContext: 'expected',
            },
          },
          {
            data: {
              testContext: 'expected',
            },
          },
        ];
        const req = request(app)
          .post('/')
          .send([
            {
              query: 'query test{ testContext }',
            },
            {
              query: 'query test{ testContext }',
            },
          ]);
        return req.then((res) => {
          // XXX In AS 1.0 we ran context once per GraphQL operation (so this
          // was 2) rather than once per HTTP request. Was this actually
          // helpful? Honestly we're not sure why you'd use a function in the
          // 1.0 API anyway since the function didn't actually get any useful
          // arguments. Right now there's some weirdness where a context
          // function is actually evaluated both inside ApolloServer and in
          // runHttpQuery.
          expect(callCount).toEqual(1);
          expect(res.status).toEqual(200);
          expect(res.body).toEqual(expected);
        });
      });

      it('can handle a request with a mutation', async () => {
        const app = await createApp();
        const expected = {
          testMutation: 'not really a mutation, but who cares: world',
        };
        const req = request(app)
          .post('/')
          .send({
            query: 'mutation test($echo: String){ testMutation(echo: $echo) }',
            variables: { echo: 'world' },
          });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data).toEqual(expected);
        });
      });

      it('willSendResponse can be equivalent to the old formatResponse function', async () => {
        const app = await createApp({
          schema,
          plugins: [
            {
              async requestDidStart() {
                return {
                  async willSendResponse(
                    requestContext: GraphQLRequestContext<BaseContext>,
                  ) {
                    requestContext.response.result.extensions = { it: 'works' };
                  },
                };
              },
            },
          ],
        });
        const expected = { it: 'works' };
        const req = request(app)
          .post('/')
          .send({
            query: 'mutation test($echo: String){ testMutation(echo: $echo) }',
            variables: { echo: 'world' },
          });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.extensions).toEqual(expected);
        });
      });

      it('passes the context to the resolver', async () => {
        const expected = 'context works';
        const app = await createApp(
          {
            schema,
          },
          { context: async () => ({ testField: expected }) },
        );
        const req = request(app).post('/').send({
          query: 'query test{ testContext }',
        });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data.testContext).toEqual(expected);
        });
      });

      it('passes the rootValue to the resolver', async () => {
        const expected = 'it passes rootValue';
        const app = await createApp({
          schema,
          rootValue: expected,
        });
        const req = request(app).post('/').send({
          query: 'query test{ testRootValue }',
        });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.data.testRootValue).toEqual(expected);
        });
      });

      it('passes the rootValue function result to the resolver', async () => {
        const expectedQuery = 'query: it passes rootValue';
        const expectedMutation = 'mutation: it passes rootValue';
        const app = await createApp({
          schema,
          rootValue: (documentNode: DocumentNode) => {
            const op = getOperationAST(documentNode, undefined);
            return op!.operation === 'query' ? expectedQuery : expectedMutation;
          },
        });
        const queryRes = await request(app).post('/').send({
          query: 'query test{ testRootValue }',
        });
        expect(queryRes.status).toEqual(200);
        expect(queryRes.body.data.testRootValue).toEqual(expectedQuery);

        const mutationRes = await request(app).post('/').send({
          query: 'mutation test{ testRootValue }',
        });
        expect(mutationRes.status).toEqual(200);
        expect(mutationRes.body.data.testRootValue).toEqual(expectedMutation);
      });

      it('returns errors', async () => {
        const expected = 'Secret error message';
        const app = await createApp({
          schema,
        });
        const req = request(app).post('/').send({
          query: 'query test{ testError }',
        });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.errors[0].message).toEqual(expected);
        });
      });

      it('applies formatError if provided', async () => {
        const expected = '--blank--';
        const app = await createApp({
          schema,
          formatError: (_, error) => {
            expect(error instanceof Error).toBe(true);
            return { message: expected };
          },
        });
        const req = request(app).post('/').send({
          query: 'query test{ testError }',
        });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.errors[0].message).toEqual(expected);
        });
      });

      it('formatError receives error that passes instanceof checks', async () => {
        const expected = '--blank--';
        const app = await createApp({
          schema,
          formatError: (_, error) => {
            expect(error instanceof Error).toBe(true);
            expect(error instanceof GraphQLError).toBe(true);
            return { message: expected };
          },
        });
        const req = request(app).post('/').send({
          query: 'query test{ testError }',
        });
        return req.then((res) => {
          expect(res.status).toEqual(200);
          expect(res.body.errors[0].message).toEqual(expected);
        });
      });

      it('allows for custom error formatting to sanitize', async () => {
        const app = await createApp({
          schema: TestSchema,
          formatError(error) {
            return { message: 'Custom error format: ' + error.message };
          },
        });

        const response = await request(app).post('/').send({
          query: '{thrower}',
        });

        expect(response.status).toEqual(200);
        expect(JSON.parse(response.text)).toEqual({
          data: null,
          errors: [
            {
              message: 'Custom error format: Throws!',
            },
          ],
        });
      });

      it('allows for custom error formatting to elaborate', async () => {
        const app = await createApp({
          schema: TestSchema,
          formatError(error) {
            return {
              message: error.message,
              locations: error.locations,
              stack: 'Stack trace',
            };
          },
        });

        const response = await request(app).post('/').send({
          query: '{thrower}',
        });

        expect(response.status).toEqual(200);
        expect(JSON.parse(response.text)).toEqual({
          data: null,
          errors: [
            {
              message: 'Throws!',
              locations: [{ line: 1, column: 2 }],
              stack: 'Stack trace',
            },
          ],
        });
      });

      it('sends internal server error when formatError fails', async () => {
        const app = await createApp({
          schema,
          formatError: () => {
            throw new Error('I should be caught');
          },
        });
        const req = request(app).post('/').send({
          query: 'query test{ testError }',
        });
        return req.then((res) => {
          const error = res.body.errors[0];
          expect(error).toEqual({
            message: 'Internal server error',
            extensions: { code: 'INTERNAL_SERVER_ERROR' },
          });
        });
      });

      it('applies additional validationRules', async () => {
        const expected = 'alwaysInvalidRule was really invalid!';
        const alwaysInvalidRule = function (context: ValidationContext) {
          return {
            enter() {
              context.reportError(new GraphQLError(expected));
              return BREAK;
            },
          };
        };
        const app = await createApp({
          schema,
          validationRules: [alwaysInvalidRule],
        });
        const req = request(app).post('/').send({
          query: 'query test{ testString }',
        });
        return req.then((res) => {
          expect(res.status).toEqual(400);
          expect(res.body.errors[0].message).toEqual(expected);
        });
      });
    });

    if (options.serverIsStartedInBackground) {
      // This tests the behavior designed for serverless frameworks that ensures
      // that startup finishes before serving a request. We don't have to worry
      // about this for non-serverless frameworks because you should have
      // already done `await server.start()` before calling (eg)
      // `expressMiddleware`.
      it('calls serverWillStart before serving a request', async () => {
        // We'll use this to determine the order in which
        // the events we're expecting to happen actually occur and validate
        // those expectations in various stages of this test.
        const calls: string[] = [];

        const pluginStartedBarrier = resolvable();
        const letPluginFinishBarrier = resolvable();

        // Create the server. This test only runs when
        // serverIsStartedInBackground, so this serverWillStart plugin will run
        // "in the background".
        const url = await createApp({
          schema,
          plugins: [
            {
              async serverWillStart() {
                calls.push('zero');
                pluginStartedBarrier.resolve();
                await letPluginFinishBarrier;
                calls.push('one');
              },
            },
          ],
        });

        // Intentionally fire off the request asynchronously, without await.
        const res = request(url)
          .get('/')
          .set('apollo-require-preflight', 't')
          .query({
            query: 'query test{ testString }',
          })
          .then((res) => {
            calls.push('two');
            return res;
          });

        // At this point calls might be [] or ['zero'] because we are starting
        // in the background. We can safely wait on the plugin's serverWillStart
        // to begin.
        await pluginStartedBarrier;
        expect(calls).toEqual(['zero']);
        letPluginFinishBarrier.resolve();

        // Now, wait for the request to finish.
        await res;

        // Finally, ensure that the order we expected was achieved.
        expect(calls).toEqual(['zero', 'one', 'two']);
      });
    }

    describe('status code', () => {
      it('allows setting a custom status code', async () => {
        const app = await createApp({
          schema,
          plugins: [
            {
              async requestDidStart() {
                return {
                  async willSendResponse({ response: { http } }) {
                    http!.statusCode = 403;
                  },
                };
              },
            },
          ],
        });

        const req = request(app).post('/').send({
          query: 'query test{ testString }',
        });
        return req.then((res) => {
          expect(res.status).toEqual(403);
          expect(res.body.data).toEqual({
            testString: 'it works',
          });
        });
      });
    });

    describe('Persisted Queries', () => {
      const query = '{testString}';
      const query2 = '{ testString }';

      const hash = createHash('sha256').update(query).digest('hex');
      const extensions = {
        persistedQuery: {
          version: 1,
          sha256Hash: hash,
        },
      };

      const extensions2 = {
        persistedQuery: {
          version: 1,
          sha256Hash: createHash('sha256').update(query2).digest('hex'),
        },
      };

      let didEncounterErrors: Mock<
        NonNullable<GraphQLRequestListener<BaseContext>['didEncounterErrors']>
      >;

      let didResolveSource: Mock<
        NonNullable<GraphQLRequestListener<BaseContext>['didResolveSource']>
      >;

      function createApqApp(
        apqOptions: PersistedQueryOptions = {},
        allowBatchedHttpRequests = false,
      ) {
        return createApp({
          schema,
          plugins: [
            {
              async requestDidStart() {
                return {
                  didResolveSource,
                  didEncounterErrors,
                };
              },
            },
          ],
          persistedQueries: {
            cache,
            ...apqOptions,
          },
          allowBatchedHttpRequests,
        });
      }

      let cache: KeyValueCache<string>;
      let setSpy: SpyInstance<typeof cache.set>;
      beforeEach(async () => {
        cache = new InMemoryLRUCache();
        setSpy = jest.spyOn(cache, 'set');
        didResolveSource = jest.fn();
        didEncounterErrors = jest.fn();
      });

      it('when ttlSeconds is set, passes ttl to the apq cache set call', async () => {
        const app = await createApqApp({ ttl: 900 });

        await request(app).post('/').send({
          extensions,
          query,
        });

        expect(setSpy).toHaveBeenCalledWith(`apq:${hash}`, query, { ttl: 900 });
        expect(didResolveSource.mock.calls[0][0]).toHaveProperty(
          'source',
          query,
        );
      });

      it('when ttlSeconds is unset, ttl is not passed to apq cache', async () => {
        const app = await createApqApp();

        await request(app).post('/').send({
          extensions,
          query,
        });

        expect(setSpy).toHaveBeenCalledWith(
          `apq:${hash}`,
          '{testString}',
          undefined,
        );
        expect(didResolveSource.mock.calls[0][0]).toHaveProperty(
          'source',
          query,
        );
      });

      it('errors when version is not specified', async () => {
        const app = await createApqApp();

        const result = await request(app)
          .get('/')
          .set('apollo-require-preflight', 't')
          .query({
            query,
            extensions: JSON.stringify({
              persistedQuery: {
                // Version intentionally omitted.
                sha256Hash: extensions.persistedQuery.sha256Hash,
              },
            }),
          });

        expect(result).toMatchObject({
          status: 400,
          // Different integrations' response text varies in format.
          text: expect.stringContaining('Unsupported persisted query version'),
          req: expect.objectContaining({
            method: 'GET',
          }),
        });

        expect(didEncounterErrors).toBeCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: 'Unsupported persisted query version',
              }),
            ]),
          }),
        );
      });

      it('errors when version is unsupported', async () => {
        const app = await createApqApp();

        const result = await request(app)
          .get('/')
          .set('apollo-require-preflight', 't')
          .query({
            query,
            extensions: JSON.stringify({
              persistedQuery: {
                // Version intentionally wrong.
                version: 2,
                sha256Hash: extensions.persistedQuery.sha256Hash,
              },
            }),
          });

        expect(result).toMatchObject({
          status: 400,
          // Different integrations' response text varies in format.
          text: expect.stringContaining('Unsupported persisted query version'),
          req: expect.objectContaining({
            method: 'GET',
          }),
        });

        expect(didEncounterErrors).toBeCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: 'Unsupported persisted query version',
              }),
            ]),
          }),
        );
      });

      it('errors when hash is mismatched', async () => {
        const app = await createApqApp();

        const result = await request(app)
          .get('/')
          .set('apollo-require-preflight', 't')
          .query({
            query,
            extensions: JSON.stringify({
              persistedQuery: {
                version: 1,
                // Sha intentionally wrong.
                sha256Hash: extensions.persistedQuery.sha256Hash.substr(0, 5),
              },
            }),
          });

        expect(result).toMatchObject({
          status: 400,
          // Different integrations' response text varies in format.
          text: expect.stringContaining('provided sha does not match query'),
          req: expect.objectContaining({
            method: 'GET',
          }),
        });

        expect(didEncounterErrors).toBeCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining([
              expect.objectContaining({
                message: 'provided sha does not match query',
              }),
            ]),
          }),
        );

        expect(didResolveSource).not.toHaveBeenCalled();
      });

      it('returns PersistedQueryNotFound on the first try', async () => {
        const app = await createApqApp();

        const result = await request(app).post('/').send({
          extensions,
        });

        expect(result.body.data).toBeUndefined();
        expect(result.body.errors.length).toEqual(1);
        expect(result.body.errors[0].message).toEqual('PersistedQueryNotFound');
        expect(result.body.errors[0].extensions.code).toEqual(
          'PERSISTED_QUERY_NOT_FOUND',
        );

        expect(didEncounterErrors).toBeCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining([
              expect.objectContaining({
                name: 'PersistedQueryNotFoundError',
                message: 'PersistedQueryNotFound',
              }),
            ]),
          }),
        );

        expect(didResolveSource).not.toHaveBeenCalled();
      });
      it('returns result on the second try', async () => {
        const app = await createApqApp();

        await request(app).post('/').send({
          extensions,
        });

        // Only the first request should result in an error.
        expect(didEncounterErrors).toHaveBeenCalledTimes(1);
        expect(didEncounterErrors).toBeCalledWith(
          expect.objectContaining({
            errors: expect.arrayContaining([
              expect.objectContaining({
                name: 'PersistedQueryNotFoundError',
                message: 'PersistedQueryNotFound',
              }),
            ]),
          }),
        );

        expect(didResolveSource).not.toHaveBeenCalled();

        const result = await request(app).post('/').send({
          extensions,
          query,
        });

        // There should be no additional errors now.  In other words, we'll
        // re-assert that we've been called the same single time that we
        // asserted above.
        expect(didEncounterErrors).toHaveBeenCalledTimes(1);

        expect(didResolveSource.mock.calls[0][0]).toHaveProperty(
          'source',
          query,
        );

        expect(result.body.data).toEqual({ testString: 'it works' });
        expect(result.body.errors).toBeUndefined();
      });

      it('returns with batched persisted queries', async () => {
        const app = await createApqApp({}, true); // allow batching

        const errors = await request(app)
          .post('/')
          .send([
            {
              extensions,
            },
            {
              extensions: extensions2,
            },
          ]);

        expect(errors.body[0].data).toBeUndefined();
        expect(errors.body[1].data).toBeUndefined();
        expect(errors.body[0].errors[0].message).toEqual(
          'PersistedQueryNotFound',
        );
        expect(errors.body[0].errors[0].extensions.code).toEqual(
          'PERSISTED_QUERY_NOT_FOUND',
        );
        expect(errors.body[1].errors[0].message).toEqual(
          'PersistedQueryNotFound',
        );
        expect(errors.body[1].errors[0].extensions.code).toEqual(
          'PERSISTED_QUERY_NOT_FOUND',
        );

        const result = await request(app)
          .post('/')
          .send([
            {
              extensions,
              query,
            },
            {
              extensions: extensions2,
              query: query2,
            },
          ]);

        expect(result.body[0].data).toEqual({ testString: 'it works' });
        expect(result.body[0].data).toEqual({ testString: 'it works' });
        expect(result.body.errors).toBeUndefined();
      });

      it('returns result on the persisted query', async () => {
        const app = await createApqApp();

        await request(app).post('/').send({
          extensions,
        });

        expect(didResolveSource).not.toHaveBeenCalled();

        await request(app).post('/').send({
          extensions,
          query,
        });
        const result = await request(app).post('/').send({
          extensions,
        });

        expect(didResolveSource.mock.calls[0][0]).toHaveProperty(
          'source',
          query,
        );

        expect(result.body.data).toEqual({ testString: 'it works' });
        expect(result.body.errors).toBeUndefined();
      });

      it('returns error when hash does not match', async () => {
        const app = await createApqApp();

        const response = await request(app)
          .post('/')
          .send({
            extensions: {
              persistedQuery: {
                version: 1,
                sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              },
            },
            query,
          });
        expect(response.status).toEqual(400);
        expect((response.error as HTTPError).text).toMatch(
          /does not match query/,
        );
        expect(didResolveSource).not.toHaveBeenCalled();
      });

      it('returns correct result using get request', async () => {
        const app = await createApqApp();

        await request(app).post('/').send({
          extensions,
          query,
        });
        const result = await request(app)
          .get('/')
          .set('apollo-require-preflight', 't')
          .query({
            extensions: JSON.stringify(extensions),
          });
        expect(result.body.data).toEqual({ testString: 'it works' });
        expect(didResolveSource.mock.calls[0][0]).toHaveProperty(
          'source',
          query,
        );
      });
    });
  });
}
