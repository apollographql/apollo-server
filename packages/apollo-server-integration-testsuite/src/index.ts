// persisted query tests
import { sha256 } from 'js-sha256';
import { VERSION } from 'apollo-link-persisted-queries';

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLError,
  GraphQLNonNull,
  GraphQLScalarType,
  introspectionQuery,
  BREAK,
} from 'graphql';

import request = require('supertest');

import { GraphQLOptions, Config } from 'apollo-server-core';
import gql from 'graphql-tag';

export * from './ApolloServer';

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
            serialize: v => v,
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
    testStringWithDelay: {
      type: GraphQLString,
      args: {
        delay: { type: new GraphQLNonNull(GraphQLInt) },
      },
      resolve(_, args) {
        return new Promise(resolve => {
          setTimeout(() => resolve('it works'), args['delay']);
        });
      },
    },
    testContext: {
      type: GraphQLString,
      resolve(_root, _args, context) {
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
  },
});

export const schema = new GraphQLSchema({
  query: queryType,
  mutation: mutationType,
});

export interface CreateAppOptions {
  excludeParser?: boolean;
  graphqlOptions?:
    | GraphQLOptions
    | { (): GraphQLOptions | Promise<GraphQLOptions> }
    | Config;
}

export interface CreateAppFunc {
  (options?: CreateAppOptions): any | Promise<any>;
}

export interface DestroyAppFunc {
  (app: any): void | Promise<void>;
}

export default (createApp: CreateAppFunc, destroyApp?: DestroyAppFunc) => {
  describe('apolloServer', () => {
    let app;

    afterEach(async () => {
      if (app) {
        if (destroyApp) {
          await destroyApp(app);
          app = null;
        } else {
          app = null;
        }
      }
    });

    describe('graphqlHTTP', () => {
      it('rejects the request if the method is not POST or GET', async () => {
        app = await createApp();
        const req = request(app)
          .head('/graphql')
          .send();
        return req.then(res => {
          expect(res.status).to.equal(405);
          expect(res.headers['allow']).to.equal('GET, POST');
        });
      });

      it('throws an error if POST body is missing', async () => {
        app = await createApp();
        const req = request(app)
          .post('/graphql')
          .send();
        return req.then(res => {
          expect(res.status).to.equal(500);
          expect(res.error.text).to.contain('POST body missing.');
        });
      });

      it('throws an error if GET query is missing', async () => {
        app = await createApp();
        const req = request(app).get(`/graphql`);
        return req.then(res => {
          expect(res.status).to.equal(400);
          expect(res.error.text).to.contain('GET query missing.');
        });
      });

      it('can handle a basic GET request', async () => {
        app = await createApp();
        const expected = {
          testString: 'it works',
        };
        const query = {
          query: 'query test{ testString }',
        };
        const req = request(app)
          .get('/graphql')
          .query(query);
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data).to.deep.equal(expected);
        });
      });

      it('can handle a basic implicit GET request', async () => {
        app = await createApp();
        const expected = {
          testString: 'it works',
        };
        const query = {
          query: '{ testString }',
        };
        const req = request(app)
          .get('/graphql')
          .query(query);
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data).to.deep.equal(expected);
        });
      });

      it('throws error if trying to use mutation using GET request', async () => {
        app = await createApp();
        const query = {
          query: 'mutation test{ testMutation(echo: "ping") }',
        };
        const req = request(app)
          .get('/graphql')
          .query(query);
        return req.then(res => {
          expect(res.status).to.equal(405);
          expect(res.headers['allow']).to.equal('POST');
          expect(res.error.text).to.contain(
            'GET supports only query operation',
          );
        });
      });

      it('throws error if trying to use mutation with fragment using GET request', async () => {
        app = await createApp();
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
          .get('/graphql')
          .query(query);
        return req.then(res => {
          expect(res.status).to.equal(405);
          expect(res.headers['allow']).to.equal('POST');
          expect(res.error.text).to.contain(
            'GET supports only query operation',
          );
        });
      });

      it('can handle a GET request with variables', async () => {
        app = await createApp();
        const query = {
          query: 'query test($echo: String){ testArgument(echo: $echo) }',
          variables: JSON.stringify({ echo: 'world' }),
        };
        const expected = {
          testArgument: 'hello world',
        };
        const req = request(app)
          .get('/graphql')
          .query(query);
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data).to.deep.equal(expected);
        });
      });

      it('can handle a basic request', async () => {
        app = await createApp();
        const expected = {
          testString: 'it works',
        };
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test{ testString }',
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data).to.deep.equal(expected);
        });
      });

      it('can handle a basic request with cacheControl', async () => {
        app = await createApp({
          graphqlOptions: { schema, cacheControl: true },
        });
        const expected = {
          testPerson: { firstName: 'Jane' },
        };
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test{ testPerson { firstName } }',
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data).to.deep.equal(expected);
          expect(res.body.extensions).to.deep.equal({
            cacheControl: {
              version: 1,
              hints: [{ maxAge: 0, path: ['testPerson'] }],
            },
          });
        });
      });

      it('can handle a basic request with cacheControl and defaultMaxAge', async () => {
        app = await createApp({
          graphqlOptions: {
            schema,
            cacheControl: {
              defaultMaxAge: 5,
              stripFormattedExtensions: false,
              calculateCacheControlHeaders: false,
            },
          },
        });
        const expected = {
          testPerson: { firstName: 'Jane' },
        };
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test{ testPerson { firstName } }',
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data).to.deep.equal(expected);
          expect(res.body.extensions).to.deep.equal({
            cacheControl: {
              version: 1,
              hints: [{ maxAge: 5, path: ['testPerson'] }],
            },
          });
        });
      });

      it('returns PersistedQueryNotSupported to a GET request if PQs disabled', async () => {
        app = await createApp({
          graphqlOptions: { schema, persistedQueries: false },
        });
        const req = request(app)
          .get('/graphql')
          .query({
            extensions: JSON.stringify({
              persistedQuery: {
                version: 1,
                sha256Hash:
                  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              },
            }),
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.errors).to.exist;
          expect(res.body.errors.length).to.equal(1);
          expect(res.body.errors[0].message).to.equal(
            'PersistedQueryNotSupported',
          );
        });
      });

      it('returns PersistedQueryNotSupported to a POST request if PQs disabled', async () => {
        app = await createApp({
          graphqlOptions: { schema, persistedQueries: false },
        });
        const req = request(app)
          .post('/graphql')
          .send({
            extensions: {
              persistedQuery: {
                version: 1,
                sha256Hash:
                  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              },
            },
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.errors).to.exist;
          expect(res.body.errors.length).to.equal(1);
          expect(res.body.errors[0].message).to.equal(
            'PersistedQueryNotSupported',
          );
        });
      });

      it('returns PersistedQueryNotFound to a GET request', async () => {
        app = await createApp();
        const req = request(app)
          .get('/graphql')
          .query({
            extensions: JSON.stringify({
              persistedQuery: {
                version: 1,
                sha256Hash:
                  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              },
            }),
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.errors).to.exist;
          expect(res.body.errors.length).to.equal(1);
          expect(res.body.errors[0].message).to.equal('PersistedQueryNotFound');
        });
      });

      it('returns PersistedQueryNotFound to a POST request', async () => {
        app = await createApp();
        const req = request(app)
          .post('/graphql')
          .send({
            extensions: {
              persistedQuery: {
                version: 1,
                sha256Hash:
                  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              },
            },
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.errors).to.exist;
          expect(res.body.errors.length).to.equal(1);
          expect(res.body.errors[0].message).to.equal('PersistedQueryNotFound');
        });
      });

      it('can handle a request with variables', async () => {
        app = await createApp();
        const expected = {
          testArgument: 'hello world',
        };
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test($echo: String){ testArgument(echo: $echo) }',
            variables: { echo: 'world' },
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data).to.deep.equal(expected);
        });
      });

      it('can handle a request with variables as string', async () => {
        app = await createApp();
        const expected = {
          testArgument: 'hello world',
        };
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test($echo: String!){ testArgument(echo: $echo) }',
            variables: '{ "echo": "world" }',
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data).to.deep.equal(expected);
        });
      });

      it('can handle a request with variables as an invalid string', async () => {
        app = await createApp();
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test($echo: String!){ testArgument(echo: $echo) }',
            variables: '{ echo: "world" }',
          });
        return req.then(res => {
          expect(res.status).to.equal(400);
          expect(res.error.text).to.contain('Variables are invalid JSON.');
        });
      });

      it('can handle a request with operationName', async () => {
        app = await createApp();
        const expected = {
          testString: 'it works',
        };
        const req = request(app)
          .post('/graphql')
          .send({
            query: `
                      query test($echo: String){ testArgument(echo: $echo) }
                      query test2{ testString }`,
            variables: { echo: 'world' },
            operationName: 'test2',
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data).to.deep.equal(expected);
        });
      });

      it('can handle introspection request', async () => {
        app = await createApp();
        const req = request(app)
          .post('/graphql')
          .send({ query: introspectionQuery });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data.__schema.types[0].fields[0].name).to.equal(
            'testString',
          );
        });
      });

      it('does not accept a query AST', async () => {
        app = await createApp();
        const req = request(app)
          .post('/graphql')
          .send({
            query: gql`
              query test {
                testString
              }
            `,
          });
        return req.then(res => {
          expect(res.status).to.equal(400);
          expect(res.text).to.contain('GraphQL queries must be strings');
        });
      });

      it('can handle batch requests', async () => {
        app = await createApp();
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
          .post('/graphql')
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
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body).to.deep.equal(expected);
        });
      });

      it('can handle batch requests', async () => {
        app = await createApp();
        const expected = [
          {
            data: {
              testString: 'it works',
            },
          },
        ];
        const req = request(app)
          .post('/graphql')
          .send([
            {
              query: `
                      query test($echo: String){ testArgument(echo: $echo) }
                      query test2{ testString }`,
              variables: { echo: 'world' },
              operationName: 'test2',
            },
          ]);
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body).to.deep.equal(expected);
        });
      });

      it('can handle batch requests in parallel', async function() {
        // this test will fail due to timeout if running serially.
        const parallels = 100;
        const delayPerReq = 40;
        this.timeout(3000);

        app = await createApp();
        const expected = Array(parallels).fill({
          data: { testStringWithDelay: 'it works' },
        });
        const req = request(app)
          .post('/graphql')
          .send(
            Array(parallels).fill({
              query: `query test($delay: Int!) { testStringWithDelay(delay: $delay) }`,
              operationName: 'test',
              variables: { delay: delayPerReq },
            }),
          );
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body).to.deep.equal(expected);
        });
      });

      it('clones batch context', async () => {
        app = await createApp({
          graphqlOptions: {
            schema,
            context: { testField: 'expected' },
          },
        });
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
          .post('/graphql')
          .send([
            {
              query: 'query test{ testContext }',
            },
            {
              query: 'query test{ testContext }',
            },
          ]);
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body).to.deep.equal(expected);
        });
      });

      it('executes batch context if it is a function', async () => {
        let callCount = 0;
        app = await createApp({
          graphqlOptions: {
            schema,
            context: () => {
              callCount++;
              return { testField: 'expected' };
            },
          },
        });
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
          .post('/graphql')
          .send([
            {
              query: 'query test{ testContext }',
            },
            {
              query: 'query test{ testContext }',
            },
          ]);
        return req.then(res => {
          // XXX In AS 1.0 we ran context once per GraphQL operation (so this
          // was 2) rather than once per HTTP request. Was this actually
          // helpful? Honestly we're not sure why you'd use a function in the
          // 1.0 API anyway since the function didn't actually get any useful
          // arguments. Right now there's some weirdness where a context
          // function is actually evaluated both inside ApolloServer and in
          // runHttpQuery.
          expect(callCount).to.equal(1);
          expect(res.status).to.equal(200);
          expect(res.body).to.deep.equal(expected);
        });
      });

      it('can handle a request with a mutation', async () => {
        app = await createApp();
        const expected = {
          testMutation: 'not really a mutation, but who cares: world',
        };
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'mutation test($echo: String){ testMutation(echo: $echo) }',
            variables: { echo: 'world' },
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data).to.deep.equal(expected);
        });
      });

      it('applies the formatResponse function', async () => {
        app = await createApp({
          graphqlOptions: {
            schema,
            formatResponse(response) {
              response['extensions'] = { it: 'works' };
              return response;
            },
          },
        });
        const expected = { it: 'works' };
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'mutation test($echo: String){ testMutation(echo: $echo) }',
            variables: { echo: 'world' },
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.extensions).to.deep.equal(expected);
        });
      });

      it('passes the context to the resolver', async () => {
        const expected = 'context works';
        app = await createApp({
          graphqlOptions: {
            schema,
            context: { testField: expected },
          },
        });
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test{ testContext }',
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data.testContext).to.equal(expected);
        });
      });

      it('passes the rootValue to the resolver', async () => {
        const expected = 'it passes rootValue';
        app = await createApp({
          graphqlOptions: {
            schema,
            rootValue: expected,
          },
        });
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test{ testRootValue }',
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.data.testRootValue).to.equal(expected);
        });
      });

      it('returns errors', async () => {
        const expected = 'Secret error message';
        app = await createApp({
          graphqlOptions: {
            schema,
          },
        });
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test{ testError }',
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.errors[0].message).to.equal(expected);
        });
      });

      it('applies formatError if provided', async () => {
        const expected = '--blank--';
        app = await createApp({
          graphqlOptions: {
            schema,
            formatError: error => {
              expect(error instanceof Error).true;
              return { message: expected };
            },
          },
        });
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test{ testError }',
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.errors[0].message).to.equal(expected);
        });
      });

      it('formatError receives error that passes instanceof checks', async () => {
        const expected = '--blank--';
        app = await createApp({
          graphqlOptions: {
            schema,
            formatError: error => {
              expect(error instanceof Error).true;
              expect(error instanceof GraphQLError).true;
              return { message: expected };
            },
          },
        });
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test{ testError }',
          });
        return req.then(res => {
          expect(res.status).to.equal(200);
          expect(res.body.errors[0].message).to.equal(expected);
        });
      });

      it('allows for custom error formatting to sanitize', async () => {
        app = await createApp({
          graphqlOptions: {
            schema: TestSchema,
            formatError(error) {
              return { message: 'Custom error format: ' + error.message };
            },
          },
        });

        const response = await request(app)
          .post('/graphql')
          .send({
            query: '{thrower}',
          });

        expect(response.status).to.equal(200);
        expect(JSON.parse(response.text)).to.deep.equal({
          data: null,
          errors: [
            {
              message: 'Custom error format: Throws!',
            },
          ],
        });
      });

      it('allows for custom error formatting to elaborate', async () => {
        app = await createApp({
          graphqlOptions: {
            schema: TestSchema,
            formatError(error) {
              return {
                message: error.message,
                locations: error.locations,
                stack: 'Stack trace',
              };
            },
          },
        });

        const response = await request(app)
          .post('/graphql')
          .send({
            query: '{thrower}',
          });

        expect(response.status).to.equal(200);
        expect(JSON.parse(response.text)).to.deep.equal({
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
        app = await createApp({
          graphqlOptions: {
            schema,
            formatError: () => {
              throw new Error('I should be caught');
            },
          },
        });
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test{ testError }',
          });
        return req.then(res => {
          expect(res.body.errors[0].message).to.equal('Internal server error');
        });
      });

      it('sends stack trace to error if debug mode is set', async () => {
        const expected = /at resolveFieldValueOrError/;
        const origError = console.error;
        const err = jest.fn();
        console.error = err;
        app = await createApp({
          graphqlOptions: {
            schema,
            debug: true,
          },
        });
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test{ testError }',
          });
        return req.then(() => {
          console.error = origError;
          if (err.called) {
            expect(err.calledOnce);
            expect(err.getCall(0).args[0]).to.match(expected);
          }
        });
      });

      it('sends stack trace to error log if debug mode is set', async () => {
        const logStub = jest.spyOn(console, 'error');
        const expected = /at resolveFieldValueOrError/;
        app = await createApp({
          graphqlOptions: {
            schema,
            debug: true,
          },
        });
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test{ testError }',
          });
        return req.then(() => {
          logStub.restore();
          if (logStub.called) {
            expect(logStub.callCount).to.equal(1);
            expect(logStub.getCall(0).args[0]).to.match(expected);
          }
        });
      });

      it('applies additional validationRules', async () => {
        const expected = 'alwaysInvalidRule was really invalid!';
        const alwaysInvalidRule = function(context) {
          return {
            enter() {
              context.reportError(new GraphQLError(expected));
              return BREAK;
            },
          };
        };
        app = await createApp({
          graphqlOptions: {
            schema,
            validationRules: [alwaysInvalidRule],
          },
        });
        const req = request(app)
          .post('/graphql')
          .send({
            query: 'query test{ testString }',
          });
        return req.then(res => {
          expect(res.status).to.equal(400);
          expect(res.body.errors[0].message).to.equal(expected);
        });
      });
    });

    describe('server setup', () => {
      it('throws error on 404 routes', async () => {
        app = await createApp();

        const query = {
          query: '{ testString }',
        };
        const req = request(app)
          .get('/bogus-route')
          .query(query);
        return req.then(res => {
          expect(res.status).to.equal(404);
        });
      });
    });

    describe('Persisted Queries', () => {
      const query = '{testString}';
      const query2 = '{ testString }';

      const hash = sha256
        .create()
        .update(query)
        .hex();
      const extensions = {
        persistedQuery: {
          version: VERSION,
          sha256Hash: hash,
        },
      };

      const extensions2 = {
        persistedQuery: {
          version: VERSION,
          sha256Hash: sha256
            .create()
            .update(query2)
            .hex(),
        },
      };

      beforeEach(async () => {
        const map = new Map<string, string>();
        const cache = {
          set: async (key, val) => {
            await map.set(key, val);
          },
          get: async key => map.get(key),
        };
        app = await createApp({
          graphqlOptions: {
            schema,
            persistedQueries: {
              cache,
            },
          },
        });
      });

      it('returns PersistedQueryNotFound on the first try', async () => {
        const result = await request(app)
          .post('/graphql')
          .send({
            extensions,
          });

        expect(result.body.data).not.to.exist;
        expect(result.body.errors.length).to.equal(1);
        expect(result.body.errors[0].message).to.equal(
          'PersistedQueryNotFound',
        );
        expect(result.body.errors[0].extensions.code).to.equal(
          'PERSISTED_QUERY_NOT_FOUND',
        );
      });
      it('returns result on the second try', async () => {
        await request(app)
          .post('/graphql')
          .send({
            extensions,
          });
        const result = await request(app)
          .post('/graphql')
          .send({
            extensions,
            query,
          });

        expect(result.body.data).to.deep.equal({ testString: 'it works' });
        expect(result.body.errors).not.to.exist;
      });

      it('returns with batched persisted queries', async () => {
        const errors = await request(app)
          .post('/graphql')
          .send([
            {
              extensions,
            },
            {
              extensions: extensions2,
            },
          ]);

        expect(errors.body[0].data).to.not.exist;
        expect(errors.body[1].data).to.not.exist;
        expect(errors.body[0].errors[0].message).to.equal(
          'PersistedQueryNotFound',
        );
        expect(errors.body[0].errors[0].extensions.code).to.equal(
          'PERSISTED_QUERY_NOT_FOUND',
        );
        expect(errors.body[1].errors[0].message).to.equal(
          'PersistedQueryNotFound',
        );
        expect(errors.body[1].errors[0].extensions.code).to.equal(
          'PERSISTED_QUERY_NOT_FOUND',
        );

        const result = await request(app)
          .post('/graphql')
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

        expect(result.body[0].data).to.deep.equal({ testString: 'it works' });
        expect(result.body[0].data).to.deep.equal({ testString: 'it works' });
        expect(result.body.errors).not.to.exist;
      });

      it('returns result on the persisted query', async () => {
        await request(app)
          .post('/graphql')
          .send({
            extensions,
          });
        await request(app)
          .post('/graphql')
          .send({
            extensions,
            query,
          });
        const result = await request(app)
          .post('/graphql')
          .send({
            extensions,
          });

        expect(result.body.data).to.deep.equal({ testString: 'it works' });
        expect(result.body.errors).not.to.exist;
      });

      it('returns error when hash does not match', async () => {
        const response = await request(app)
          .post('/graphql')
          .send({
            extensions: {
              persistedQuery: {
                version: VERSION,
                sha:
                  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              },
            },
            query,
          });
        expect(response.status).to.equal(400);
        expect(response.error.text).to.match(/does not match query/);
      });

      it('returns correct result using get request', async () => {
        await request(app)
          .post('/graphql')
          .send({
            extensions,
            query,
          });
        const result = await request(app)
          .get('/graphql')
          .query({
            extensions: JSON.stringify(extensions),
          });
        expect(result.body.data).to.deep.equal({ testString: 'it works' });
      });
    });
  });
};
