import { expect } from 'chai';
import { stub } from 'sinon';
import 'mocha';

import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLError,
    GraphQLNonNull,
    introspectionQuery,
    BREAK,
} from 'graphql';

// tslint:disable-next-line
const request = require('supertest');

import { GraphQLOptions } from 'apollo-server-core';
import * as GraphiQL from 'apollo-server-module-graphiql';
import { OperationStore } from 'apollo-server-module-operation-store';

const queryType = new GraphQLObjectType({
    name: 'QueryType',
    fields: {
        testString: {
            type: GraphQLString,
            resolve() {
                return 'it works';
            },
        },
        testStringWithDelay: {
            type: GraphQLString,
            args: {
              delay: { type: new GraphQLNonNull(GraphQLInt) },
            },
            resolve(root, args) {
              return new Promise((resolve, reject) => {
                setTimeout(() => resolve('it works'), args['delay']);
              });
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

const mutationType = new GraphQLObjectType({
    name: 'MutationType',
    fields: {
        testMutation: {
            type: GraphQLString,
            args: { echo: { type: GraphQLString } },
            resolve(root, { echo }) {
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
          resolve(root, args) {
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
  graphqlOptions?: GraphQLOptions | {(): GraphQLOptions | Promise<GraphQLOptions>};
  graphiqlOptions?: GraphiQL.GraphiQLData | {(): GraphiQL.GraphiQLData | Promise<GraphiQL.GraphiQLData>};
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
      it('can be called with an options function', async () => {
          app = await createApp({graphqlOptions: (): GraphQLOptions => ({schema})});
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

      it('can be called with an options function that returns a promise', async () => {
          app = await createApp({ graphqlOptions: () => {
              return new Promise(resolve => {
                  resolve({schema});
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

      it('throws an error if options promise is rejected', async () => {
          app = await createApp({ graphqlOptions: () => {
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

      it('rejects the request if the method is not POST or GET', async () => {
          app = await createApp({excludeParser: true});
          const req = request(app)
              .head('/graphql')
              .send();
          return req.then((res) => {
              expect(res.status).to.equal(405);
              expect(res.headers['allow']).to.equal('GET, POST');
          });
      });

      it('throws an error if POST body is missing', async () => {
          app = await createApp({excludeParser: true});
          const req = request(app)
              .post('/graphql')
              .send();
          return req.then((res) => {
              expect(res.status).to.equal(500);
              return expect(res.error.text).to.contain('POST body missing.');
          });
      });

      it('throws an error if GET query is missing', async () => {
          app = await createApp();
          const req = request(app)
              .get(`/graphql`);
          return req.then((res) => {
              expect(res.status).to.equal(400);
              return expect(res.error.text).to.contain('GET query missing.');
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
              .get('/graphql').query(query);
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
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
              .get('/graphql').query(query);
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('throws error if trying to use mutation using GET request', async () => {
          app = await createApp();
          const query = {
              query: 'mutation test{ testMutation(echo: "ping") }',
          };
          const req = request(app)
              .get('/graphql').query(query);
          return req.then((res) => {
              expect(res.status).to.equal(405);
              expect(res.headers['allow']).to.equal('POST');
              return expect(res.error.text).to.contain('GET supports only query operation');
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
              .get('/graphql').query(query);
          return req.then((res) => {
              expect(res.status).to.equal(405);
              expect(res.headers['allow']).to.equal('POST');
              return expect(res.error.text).to.contain('GET supports only query operation');
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
              .get('/graphql').query(query);
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
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
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
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
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
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
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
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
          return req.then((res) => {
              expect(res.status).to.equal(400);
              return expect(res.error.text).to.contain('Variables are invalid JSON.');
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
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('can handle introspection request', async () => {
          app = await createApp();
          const req = request(app)
              .post('/graphql')
              .send({query: introspectionQuery});
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data.__schema.types[0].fields[0].name).to.equal('testString');
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
           .send(Array(parallels).fill({
             query: `query test($delay: Int!) { testStringWithDelay(delay: $delay) }`,
             operationName: 'test',
             variables: { delay: delayPerReq },
           }));
           return req.then((res) => {
             expect(res.status).to.equal(200);
             return expect(res.body).to.deep.equal(expected);
           });
      });

      it('clones batch context', async () => {
          app = await createApp({graphqlOptions: {
              schema,
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
          return req.then((res) => {
              expect(res.status).to.equal(200);
              return expect(res.body.data).to.deep.equal(expected);
          });
      });

      it('applies the formatResponse function', async () => {
          app = await createApp({graphqlOptions: {
              schema,
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

      it('passes the context to the resolver', async () => {
          const expected = 'context works';
          app = await createApp({graphqlOptions: {
              schema,
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

      it('passes the rootValue to the resolver', async () => {
          const expected = 'it passes rootValue';
          app = await createApp({graphqlOptions: {
              schema,
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

      it('returns errors', async () => {
          const expected = 'Secret error message';
          app = await createApp({graphqlOptions: {
              schema,
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

      it('applies formatError if provided', async () => {
          const expected = '--blank--';
          app = await createApp({graphqlOptions: {
              schema,
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

      it('sends internal server error when formatError fails', async() => {
          app = await createApp({graphqlOptions: {
              schema,
              formatError: (err) => {
                throw new Error('I should be caught');
              },
          }});
          const req = request(app)
              .post('/graphql')
              .send({
                  query: 'query test{ testError }',
              });
          return req.then((res) => {
              return expect(res.body.errors[0].message).to.equal('Internal server error');
          });
      });

      it('sends stack trace to error if debug mode is set', async () => {
          const expected = /at resolveFieldValueOrError/;
          const stackTrace = [];
          const origError = console.error;
          console.error = (...args) => stackTrace.push(args);
          app = await createApp({graphqlOptions: {
              schema,
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

      it('sends stack trace to error log if debug mode is set', async () => {
          const logStub = stub(console, 'error');
          const expected = /at resolveFieldValueOrError/;
          app = await createApp({graphqlOptions: {
              schema,
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

      it('applies additional validationRules', async () => {
          const expected = 'alwaysInvalidRule was really invalid!';
          const alwaysInvalidRule = function (context) {
              return {
                  enter() {
                      context.reportError(new GraphQLError(expected));
                      return BREAK;
                  },
              };
          };
          app = await createApp({graphqlOptions: {
              schema,
              validationRules: [alwaysInvalidRule],
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
      it('presents GraphiQL when accepting HTML', async () => {
          app = await createApp({graphiqlOptions: {
              endpointURL: '/graphql',
          }});

          const req = request(app)
              .get('/graphiql').query('query={test}')
              .set('Accept', 'text/html');
          return req.then((response) => {
              expect(response.status).to.equal(200);
              expect(response.type).to.equal('text/html');
              expect(response.text).to.include('{test}');
              expect(response.text).to.include('/graphql');
              expect(response.text).to.include('graphiql.min.js');
          });
      });

      it('allows options to be a function', async () => {
        app = await createApp({graphiqlOptions: () => ({
            endpointURL: '/graphql',
        })});

        const req = request(app)
            .get('/graphiql')
            .set('Accept', 'text/html');
        return req.then((response) => {
            expect(response.status).to.equal(200);
        });
      });

      it('handles options function errors', async () => {
        app = await createApp({graphiqlOptions: () => {
          throw new Error('I should be caught');
        }});

        const req = request(app)
            .get('/graphiql')
            .set('Accept', 'text/html');
        return req.then((response) => {
            expect(response.status).to.equal(500);
        });
      });

      it('presents options variables', async () => {
        app = await createApp({graphiqlOptions: {
            endpointURL: '/graphql',
            variables: {key: 'optionsValue'},
        }});

        const req = request(app)
            .get('/graphiql')
            .set('Accept', 'text/html');
        return req.then((response) => {
            expect(response.status).to.equal(200);
            expect(response.text.replace(/\s/g, '')).to.include('variables:"{\\n\\"key\\":\\"optionsValue\\"\\n}"');
        });
      });

      it('presents query variables over options variables', async () => {
        app = await createApp({graphiqlOptions: {
            endpointURL: '/graphql',
            variables: {key: 'optionsValue'},
        }});

        const req = request(app)
            .get('/graphiql?variables={"key":"queryValue"}')
            .set('Accept', 'text/html');
        return req.then((response) => {
            expect(response.status).to.equal(200);
            expect(response.text.replace(/\s/g, '')).to.include('variables:"{\\n\\"key\\":\\"queryValue\\"\\n}"');
        });
      });
    });

    describe('stored queries', () => {
      it('works with formatParams', async () => {
          const store = new OperationStore(schema);
          store.put('query testquery{ testString }');
          app = await createApp({ graphqlOptions: {
              schema,
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

      it('can reject non-whitelisted queries', async () => {
          const store = new OperationStore(schema);
          store.put('query testquery{ testString }');
          app = await createApp({ graphqlOptions: {
              schema,
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

    describe('server setup', () => {
      it('throws error on 404 routes', async () => {
          app = await createApp();

          const query = {
              query: '{ testString }',
          };
          const req = request(app)
              .get('/bogus-route').query(query);
          return req.then((res) => {
              expect(res.status).to.equal(404);
          });
      });
    });
  });
};
