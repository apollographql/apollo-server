import { expect } from 'chai';
import { stub } from 'sinon';
import 'mocha';
import * as querystring from 'querystring';

import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLError,
    introspectionQuery,
    BREAK,
} from 'graphql';

// tslint:disable-next-line
const request = require('supertest-as-promised');

import { GraphQLOptions } from 'graphql-server-core';
import * as GraphiQL from 'graphql-server-module-graphiql';
import { OperationStore } from 'graphql-server-module-operation-store';

const QueryType = new GraphQLObjectType({
    name: 'QueryType',
    fields: {
        testString: {
            type: GraphQLString,
            resolve() {
                return 'it works';
            },
        },
        testContext: {
            type: GraphQLString,
            resolve(_, args, context) {
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
            resolve(root, { echo }) {
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

const MutationType = new GraphQLObjectType({
    name: 'MutationType',
    fields: {
        testMutation: {
            type: GraphQLString,
            args: { echo: { type: GraphQLString } },
            resolve(root, { echo }) {
                return `not really a mutation, but who cares: ${echo}`;
            },
        },
    },
});

export const Schema = new GraphQLSchema({
    query: QueryType,
    mutation: MutationType,
});

export interface CreateAppOptions {
  excludeParser?: boolean;
  graphqlOptions?: GraphQLOptions | {(): GraphQLOptions | Promise<{}>};
  graphiqlOptions?: GraphiQL.GraphiQLData;
}

export interface CreateAppFunc {
    (options?: CreateAppOptions): void;
}

export interface DestroyAppFunc {
  (app: any): void;
}

export default (createApp: CreateAppFunc, destroyApp?: DestroyAppFunc) => {
  describe('apolloServer', () => {
    let app;

    afterEach(() => {
      if (app) {
        if (destroyApp) {
          destroyApp(app);
        } else {
          app = null;
        }
      }
    });

    describe('graphqlHTTP', () => {
      it('can be called with an options function', () => {
          app = createApp({graphqlOptions: (): GraphQLOptions => ({schema: Schema})});
          const expected = {
              testString: 'it works',
          };
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testString }',
              });
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('can be called with an options function that returns a promise', () => {
          app = createApp({ graphqlOptions: () => {
              return new Promise(resolve => {
                  resolve({schema: Schema});
              });
          }});
          const expected = {
              testString: 'it works',
          };
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testString }',
              });
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('throws an error if options promise is rejected', () => {
          app = createApp({ graphqlOptions: () => {
            return Promise.reject({}) as any as GraphQLOptions;
          }});
          const expected = 'Invalid options';
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testString }',
              });
          return req.then((res) => {
              expect(res.status).to.equal(500);
              return expect(res.error.text).to.contain(expected);
          });
      });

      it('rejects the request if the method is not POST or GET', () => {
          app = createApp({excludeParser: true});
          const req = request(app)
              .head('/graphql')
              .send();
          return req.then((res) => {
              expect(res.status).to.be.oneOf([404, 405]);
              // Hapi doesn't return allow header, so we can't test this.
              // return expect(res.headers['allow']).to.equal('POST');
          });
      });

      it('throws an error if POST body is missing', () => {
          app = createApp({excludeParser: true});
          const req = request(app)
              .post('/graphql')
              .send();
          return req.then((res) => {
              expect(res.status).to.equal(500);
              return expect(res.error.text).to.contain('POST body missing.');
          });
      });

      it('can handle a basic GET request', () => {
          app = createApp();
          const expected = {
              testString: 'it works',
          };
          const query = {
              query: 'query test{ testString }',
          };
          const req = request(app)
              .get(`/graphql?${querystring.stringify(query)}`);
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('can handle a GET request with variables', () => {
          app = createApp();
          const query = {
              query: 'query test($echo: String){ testArgument(echo: $echo) }',
              variables: JSON.stringify({ echo: 'world' }),
          };
          const expected = {
              testArgument: 'hello world',
          };
          const req = request(app)
              .get(`/graphql?${querystring.stringify(query)}`);
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('can handle a basic request', () => {
          app = createApp();
          const expected = {
              testString: 'it works',
          };
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testString }',
              });
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('can handle a request with variables', () => {
          app = createApp();
          const expected = {
              testArgument: 'hello world',
          };
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test($echo: String){ testArgument(echo: $echo) }',
                  variables: { echo: 'world' },
              });
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('can handle a request with variables as string', () => {
          app = createApp();
          const expected = {
              testArgument: 'hello world',
          };
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test($echo: String!){ testArgument(echo: $echo) }',
                  variables: '{ "echo": "world" }',
              });
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('can handle a request with variables as an invalid string', () => {
          app = createApp();
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test($echo: String!){ testArgument(echo: $echo) }',
                  variables: '{ echo: "world" }',
              });
          return req.then((res) => {
              expect(res.status).to.equal(400);
              return expect(res.error.text).to.contain('Variables are invalid JSON.');
          });
      });

      it('can handle a request with operationName', () => {
          app = createApp();
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
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('can handle introspection request', () => {
          app = createApp();
          const req = request(app)
              .post('/graphql')
              .send({query: introspectionQuery});
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data.__schema.types[0].fields[0].name).to.equal('testString');
          });
      });

       it('can handle batch requests', () => {
          app = createApp();
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
              .send([{
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
              }]);
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body).to.deep.equal(expected);
          });
      });

       it('can handle batch requests', () => {
          app = createApp();
          const expected = [
              {
                  data: {
                      testString: 'it works',
                  },
              },
          ];
          const req = request(app)
              .post('/graphql')
              .send([{
                  query: `
                      query test($echo: String){ testArgument(echo: $echo) }
                      query test2{ testString }`,
                  variables: { echo: 'world' },
                  operationName: 'test2',
              }]);
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body).to.deep.equal(expected);
          });
      });

      it('clones batch context', () => {
          app = createApp({graphqlOptions: {
              schema: Schema,
              context: {testField: 'expected'},
          }});
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
              .send([{
                  query: 'query test{ testContext }',
              }, {
                  query: 'query test{ testContext }',
              }]);
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body).to.deep.equal(expected);
          });
      });

      it('can handle a request with a mutation', () => {
          app = createApp();
          const expected = {
              testMutation: 'not really a mutation, but who cares: world',
          };
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'mutation test($echo: String){ testMutation(echo: $echo) }',
                  variables: { echo: 'world' },
              });
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('applies the formatResponse function', () => {
          app = createApp({graphqlOptions: {
              schema: Schema,
              formatResponse(response) {
                  response['extensions'] = { it: 'works' }; return response;
              },
          }});
          const expected = { it: 'works' };
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'mutation test($echo: String){ testMutation(echo: $echo) }',
                  variables: { echo: 'world' },
              });
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.extensions).to.deep.equal(expected);
          });
      });

      it('passes the context to the resolver', () => {
          const expected = 'context works';
          app = createApp({graphqlOptions: {
              schema: Schema,
              context: {testField: expected},
          }});
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testContext }',
              });
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data.testContext).to.equal(expected);
          });
      });

      it('passes the rootValue to the resolver', () => {
          const expected = 'it passes rootValue';
          app = createApp({graphqlOptions: {
              schema: Schema,
              rootValue: expected,
          }});
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testRootValue }',
              });
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data.testRootValue).to.equal(expected);
          });
      });

      it('returns errors', () => {
          const expected = 'Secret error message';
          app = createApp({graphqlOptions: {
              schema: Schema,
          }});
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testError }',
              });
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.errors[0].message).to.equal(expected);
          });
      });

      it('applies formatError if provided', () => {
          const expected = '--blank--';
          app = createApp({graphqlOptions: {
              schema: Schema,
              formatError: (err) => ({ message: expected }),
          }});
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testError }',
              });
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.errors[0].message).to.equal(expected);
          });
      });

      it('sends internal server error when formatError fails', () => {
          app = createApp({graphqlOptions: {
              schema: Schema,
              formatError: (err) => {
                throw new Error('I should be catched');
              },
          }});
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testError }',
              });
          return req.then((res) => {
              return expect(res.res.body.errors[0].message).to.equal('Internal server error');
          });
      });

      it('sends stack trace to error if debug mode is set', () => {
          const expected = /at resolveOrError/;
          const stackTrace = [];
          const origError = console.error;
          console.error = (...args) => stackTrace.push(args);
          app = createApp({graphqlOptions: {
              schema: Schema,
              debug: true,
          }});
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testError }',
              });
          return req.then((res) => {
            console.error = origError;
            return expect(stackTrace[0][0]).to.match(expected);
          });
      });

      it('sends stack trace to error log if debug mode is set', () => {
          const logStub = stub(console, 'error');
          const expected = /at resolveOrError/;
          app = createApp({graphqlOptions: {
              schema: Schema,
              debug: true,
          }});
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testError }',
              });
          return req.then((res) => {
            logStub.restore();
            expect(logStub.callCount).to.equal(1);
            return expect(logStub.getCall(0).args[0]).to.match(expected);
          });
      });

      it('applies additional validationRules', () => {
          const expected = 'AlwaysInvalidRule was really invalid!';
          const AlwaysInvalidRule = function (context) {
              return {
                  enter() {
                      context.reportError(new GraphQLError(
                          expected
                      ));
                      return BREAK;
                  },
              };
          };
          app = createApp({graphqlOptions: {
              schema: Schema,
              validationRules: [AlwaysInvalidRule],
          }});
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testString }',
              });
          return req.then((res) => {
              expect(res.status).to.equal(400);
              return expect(res.body.errors[0].message).to.equal(expected);
          });
      });

    });

    describe('renderGraphiQL', () => {
      it('presents GraphiQL when accepting HTML', () => {
          app = createApp({graphiqlOptions: {
              endpointURL: '/graphql',
          }});

          const req = request(app)
              .get('/graphiql?query={test}')
              .set('Accept', 'text/html');
          return req.then((response) => {
              expect(response.status).to.equal(200);
              expect(response.type).to.equal('text/html');
              expect(response.text).to.include('{test}');
              expect(response.text).to.include('/graphql');
              expect(response.text).to.include('graphiql.min.js');
          });
      });
    });

    describe('stored queries', () => {
      it('works with formatParams', () => {
          const store = new OperationStore(Schema);
          store.put('query testquery{ testString }');
          app = createApp({ graphqlOptions: {
              schema: Schema,
              formatParams(params) {
                  params['query'] = store.get(params.operationName);
                  return params;
              },
          }});
          const expected = { testString: 'it works' };
          const req = request(app)
              .post('/graphql')
              .send({
                  operationName: 'testquery',
              });
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('can reject non-whitelisted queries', () => {
          const store = new OperationStore(Schema);
          store.put('query testquery{ testString }');
          app = createApp({ graphqlOptions: {
              schema: Schema,
              formatParams(params) {
                  if (params.query) {
                      throw new Error('Must not provide query, only operationName');
                  }
                  params['query'] = store.get(params.operationName);
                  return params;
              },
          }});
          const expected = [{
              data: {
                  testString: 'it works',
              },
          }, {
              errors: [{
                  message: 'Must not provide query, only operationName',
              }],
          }];

          const req = request(app)
              .post('/graphql')
              .send([{
                  operationName: 'testquery',
              }, {
                  query: '{ testString }',
              }]);
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body).to.deep.equal(expected);
          });
      });
    });
  });
};
