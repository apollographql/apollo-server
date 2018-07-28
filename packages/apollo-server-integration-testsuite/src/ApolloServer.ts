/* tslint:disable:no-unused-expression */
import * as http from 'http';
import * as net from 'net';
import { sha256 } from 'js-sha256';
import express = require('express');
import bodyParser = require('body-parser');
import yup = require('yup');

import { Trace } from 'apollo-engine-reporting-protobuf';

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLError,
  ValidationContext,
  FieldDefinitionNode,
} from 'graphql';

import { PubSub } from 'graphql-subscriptions';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import * as WebSocket from 'ws';

import { execute } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import {
  createPersistedQueryLink as createPersistedQuery,
  VERSION,
} from 'apollo-link-persisted-queries';

import { createApolloFetch } from 'apollo-fetch';
import {
  AuthenticationError,
  UserInputError,
  gql,
  Config,
  ApolloServerBase,
} from 'apollo-server-core';
import { GraphQLExtension, GraphQLResponse } from 'graphql-extensions';

export function createServerInfo<AS extends ApolloServerBase>(
  server: AS,
  httpServer: http.Server,
): ServerInfo<AS> {
  const serverInfo: any = {
    ...(httpServer.address() as net.AddressInfo),
    server,
    httpServer,
  };

  // Convert IPs which mean "any address" (IPv4 or IPv6) into localhost
  // corresponding loopback ip. Note that the url field we're setting is
  // primarily for consumption by our test suite. If this heuristic is
  // wrong for your use case, explicitly specify a frontend host (in the
  // `frontends.host` field in your engine config, or in the `host`
  // option to ApolloServer.listen).
  let hostForUrl = serverInfo.address;
  if (serverInfo.address === '' || serverInfo.address === '::')
    hostForUrl = 'localhost';

  serverInfo.url = require('url').format({
    protocol: 'http',
    hostname: hostForUrl,
    port: serverInfo.port,
    pathname: server.graphqlPath,
  });

  return serverInfo;
}

const INTROSPECTION_QUERY = `
  {
    __schema {
      directives {
        name
      }
    }
  }
`;

const TEST_STRING_QUERY = `
  {
    testString
  }
`;

const queryType = new GraphQLObjectType({
  name: 'QueryType',
  fields: {
    testString: {
      type: GraphQLString,
      resolve() {
        return 'test string';
      },
    },
  },
});

const schema = new GraphQLSchema({
  query: queryType,
});

export interface ServerInfo<AS extends ApolloServerBase> {
  address: string;
  family: string;
  url: string;
  port: number | string;
  server: AS;
  httpServer: http.Server;
}

export interface CreateServerFunc<AS extends ApolloServerBase> {
  (config: Config): Promise<ServerInfo<AS>>;
}

export interface StopServerFunc {
  (): Promise<void>;
}

export function testApolloServer<AS extends ApolloServerBase>(
  createApolloServer: CreateServerFunc<AS>,
  stopServer: StopServerFunc,
) {
  describe('ApolloServer', () => {
    afterEach(stopServer);

    describe('constructor', () => {
      describe('validation rules', () => {
        it('accepts additional rules', async () => {
          const NoTestString = (context: ValidationContext) => ({
            Field(node: FieldDefinitionNode) {
              if (node.name.value === 'testString') {
                context.reportError(
                  new GraphQLError('Not allowed to use', [node]),
                );
              }
            },
          });

          const formatError = jest.fn().callsFake(error => {
            expect(error instanceof Error).true;
            return error;
          });

          const { url: uri } = await createApolloServer({
            schema,
            validationRules: [NoTestString],
            introspection: false,
            formatError,
          });

          const apolloFetch = createApolloFetch({ uri });

          const introspectionResult = await apolloFetch({
            query: INTROSPECTION_QUERY,
          });
          expect(introspectionResult.data, 'data should not exist').not.to
            .exist;
          expect(introspectionResult.errors, 'errors should exist').to.exist;
          expect(introspectionResult.errors[0].message).to.match(
            /introspection/,
          );
          expect(formatError.callCount).to.equal(
            introspectionResult.errors.length,
          );

          const result = await apolloFetch({ query: TEST_STRING_QUERY });
          expect(result.data, 'data should not exist').not.to.exist;
          expect(result.errors, 'errors should exist').to.exist;
          expect(result.errors[0].message).to.match(/Not allowed/);
          expect(formatError.callCount).to.equal(
            introspectionResult.errors.length + result.errors.length,
          );
        });

        it('allows introspection by default', async () => {
          const nodeEnv = process.env.NODE_ENV;
          delete process.env.NODE_ENV;

          const { url: uri } = await createApolloServer({
            schema,
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({ query: INTROSPECTION_QUERY });
          expect(result.data, 'data should not exist').to.exist;
          expect(result.errors, 'errors should exist').not.to.exist;

          process.env.NODE_ENV = nodeEnv;
        });

        it('prevents introspection by default during production', async () => {
          const nodeEnv = process.env.NODE_ENV;
          process.env.NODE_ENV = 'production';

          const { url: uri } = await createApolloServer({
            schema,
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({ query: INTROSPECTION_QUERY });
          expect(result.data, 'data should not exist').not.to.exist;
          expect(result.errors, 'errors should exist').to.exist;
          expect(result.errors.length).to.equal(1);
          expect(result.errors[0].extensions.code).to.equal(
            'GRAPHQL_VALIDATION_FAILED',
          );

          process.env.NODE_ENV = nodeEnv;
        });

        it('allows introspection to be enabled explicitly', async () => {
          const nodeEnv = process.env.NODE_ENV;
          process.env.NODE_ENV = 'production';

          const { url: uri } = await createApolloServer({
            schema,
            introspection: true,
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({ query: INTROSPECTION_QUERY });
          expect(result.data, 'data should not exist').to.exist;
          expect(result.errors, 'errors should exist').not.to.exist;

          process.env.NODE_ENV = nodeEnv;
        });
      });

      describe('schema creation', () => {
        it('accepts typeDefs and resolvers', async () => {
          const typeDefs = gql`
            type Query {
              hello: String
            }
          `;
          const resolvers = { Query: { hello: () => 'hi' } };
          const { url: uri } = await createApolloServer({
            typeDefs,
            resolvers,
          });

          const apolloFetch = createApolloFetch({ uri });
          const result = await apolloFetch({ query: '{hello}' });

          expect(result.data).to.deep.equal({ hello: 'hi' });
          expect(result.errors, 'errors should exist').not.to.exist;
        });
        it('uses schema over resolvers + typeDefs', async () => {
          const typeDefs = gql`
            type Query {
              hello: String
            }
          `;
          const resolvers = { Query: { hello: () => 'hi' } };
          const { url: uri } = await createApolloServer({
            typeDefs,
            resolvers,
            schema,
          });

          const apolloFetch = createApolloFetch({ uri });
          const typeDefResult = await apolloFetch({ query: '{hello}' });

          expect(typeDefResult.data, 'data should not exist').not.to.exist;
          expect(typeDefResult.errors, 'errors should exist').to.exist;

          const result = await apolloFetch({ query: '{testString}' });
          expect(result.data).to.deep.equal({ testString: 'test string' });
          expect(result.errors, 'errors should exist').not.to.exist;
        });
        it('allows mocks as boolean', async () => {
          const typeDefs = gql`
            type Query {
              hello: String
            }
          `;
          const { url: uri } = await createApolloServer({
            typeDefs,
            mocks: true,
          });

          const apolloFetch = createApolloFetch({ uri });
          const result = await apolloFetch({ query: '{hello}' });
          expect(result.data).to.deep.equal({ hello: 'Hello World' });
          expect(result.errors, 'errors should exist').not.to.exist;
        });

        it('allows mocks as an object', async () => {
          const typeDefs = gql`
            type Query {
              hello: String
            }
          `;
          const { url: uri } = await createApolloServer({
            typeDefs,
            mocks: { String: () => 'mock city' },
          });

          const apolloFetch = createApolloFetch({ uri });
          const result = await apolloFetch({ query: '{hello}' });

          expect(result.data).to.deep.equal({ hello: 'mock city' });
          expect(result.errors, 'errors should exist').not.to.exist;
        });
      });
    });

    describe('formatError', () => {
      it('wraps thrown error from validation rules', async () => {
        const throwError = jest.fn().callsFake(() => {
          throw new Error('nope');
        });

        const formatError = jest.fn().callsFake(error => {
          expect(error instanceof Error).true;
          expect(error.constructor.name).to.equal('Error');
          return error;
        });

        const { url: uri } = await createApolloServer({
          schema,
          validationRules: [throwError],
          introspection: true,
          formatError,
        });

        const apolloFetch = createApolloFetch({ uri });

        const introspectionResult = await apolloFetch({
          query: INTROSPECTION_QUERY,
        });
        expect(introspectionResult.data, 'data should not exist').not.to.exist;
        expect(introspectionResult.errors, 'errors should exist').to.exist;
        expect(formatError.calledOnce).true;
        expect(throwError.calledOnce).true;

        const result = await apolloFetch({ query: TEST_STRING_QUERY });
        expect(result.data, 'data should not exist').not.to.exist;
        expect(result.errors, 'errors should exist').to.exist;
        expect(formatError.calledTwice).true;
        expect(throwError.calledTwice).true;
      });

      it('works with errors similar to GraphQL errors, such as yup', async () => {
        const throwError = jest.fn().callsFake(async () => {
          const schema = yup.object().shape({
            email: yup
              .string()
              .email()
              .required('Please enter your email address'),
          });

          await schema.validate({ email: 'lol' });
        });

        const formatError = jest.fn().callsFake(error => {
          expect(error instanceof Error).true;
          expect(error.extensions.code).to.equal('INTERNAL_SERVER_ERROR');
          expect(error.extensions.exception.name).to.equal('ValidationError');
          expect(error.extensions.exception.message).to.exist;
          const inputError = new UserInputError('User Input Error');
          return {
            message: inputError.message,
            extensions: inputError.extensions,
          };
        });

        const { url: uri } = await createApolloServer({
          typeDefs: gql`
            type Query {
              error: String
            }
          `,
          resolvers: {
            Query: {
              error: () => {
                return throwError();
              },
            },
          },
          introspection: true,
          debug: true,
          formatError,
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({
          query: '{error}',
        });
        expect(result.data).to.deep.equal({ error: null });
        expect(result.errors, 'errors should exist').to.exist;
        expect(result.errors[0].extensions.code).equals('BAD_USER_INPUT');
        expect(result.errors[0].message).equals('User Input Error');
        expect(formatError.calledOnce).true;
        expect(throwError.calledOnce).true;
      });
    });

    describe('lifecycle', () => {
      async function startEngineServer({ port, check }) {
        const engine = express();
        engine.use((req, _res, next) => {
          // body parser requires a content-type
          req.headers['content-type'] = 'text/plain';
          next();
        });
        engine.use(
          bodyParser.raw({
            inflate: true,
            type: '*/*',
          }),
        );
        engine.use(check);
        return await engine.listen(port);
      }

      it('validation > engine > extensions > formatError', async () => {
        return new Promise(async (resolve, reject) => {
          const nodeEnv = process.env.NODE_ENV;
          delete process.env.NODE_ENV;

          let listener = await startEngineServer({
            port: 10101,
            check: (req, res) => {
              const trace = JSON.stringify(Trace.decode(req.body));
              try {
                expect(trace).to.match(/nope/);
                expect(trace).not.to.match(/masked/);
              } catch (e) {
                reject(e);
              }
              res.end();
              listener.close(resolve);
            },
          });

          const throwError = jest.fn().callsFake(() => {
            throw new Error('nope');
          });

          const validationRule = jest.fn().callsFake(() => {
            expect(
              formatError.notCalled,
              'formatError should be called after validation',
            ).true;
            expect(
              extension.notCalled,
              'extension should be called after validation',
            ).true;
            return true;
          });
          const extension = jest.fn();

          const formatError = jest.fn().callsFake(error => {
            expect(error instanceof Error).true;
            expect(
              extension.calledOnce,
              'extension should be called before formatError',
            ).true;
            expect(
              validationRule.calledOnce,
              'validationRules should be called before formatError',
            ).true;

            error.message = 'masked';
            return error;
          });

          class Extension extends GraphQLExtension {
            willSendResponse(o: { graphqlResponse: GraphQLResponse }) {
              expect(o.graphqlResponse.errors.length).to.equal(1);
              expect(
                formatError.notCalled,
                'formatError should be called after extensions',
              ).true;
              expect(
                validationRule.calledOnce,
                'validationRules should be called before extensions',
              ).true;
              extension();
            }
          }

          const { url: uri } = await createApolloServer({
            typeDefs: gql`
              type Query {
                error: String
              }
            `,
            resolvers: {
              Query: {
                error: () => {
                  throwError();
                },
              },
            },
            validationRules: [validationRule],
            extensions: [() => new Extension()],
            engine: {
              endpointUrl: 'http://localhost:10101',
              apiKey: 'fake',
              maxUncompressedReportSize: 1,
            },
            formatError,
            debug: true,
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({
            query: `{error}`,
          });
          expect(result.data).to.deep.equal({
            error: null,
          });
          expect(result.errors, 'errors should exist').to.exist;
          expect(result.errors[0].message).to.equal('masked');
          expect(formatError.calledOnce).true;
          expect(throwError.calledOnce).true;

          process.env.NODE_ENV = nodeEnv;
        });
      });

      it('errors thrown in extensions call formatError and are wrapped', async () => {
        const extension = jest.fn().callsFake(() => {
          throw new Error('nope');
        });

        const formatError = jest.fn().callsFake(error => {
          expect(error instanceof Error).true;
          expect(
            extension.calledOnce,
            'extension should be called before formatError',
          ).true;

          error.message = 'masked';
          return error;
        });

        class Extension extends GraphQLExtension {
          willSendResponse(_o: { graphqlResponse: GraphQLResponse }) {
            expect(
              formatError.notCalled,
              'formatError should be called after extensions',
            ).true;
            extension();
          }
        }

        const { url: uri } = await createApolloServer({
          typeDefs: gql`
            type Query {
              error: String
            }
          `,
          resolvers: {
            Query: {
              error: () => {},
            },
          },
          extensions: [() => new Extension()],
          formatError,
          debug: true,
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({
          query: `{error}`,
        });
        expect(result.data, 'data should not exist').to.not.exist;
        expect(result.errors, 'errors should exist').to.exist;
        expect(result.errors[0].message).to.equal('masked');
        expect(result.errors[0].message).to.equal('masked');
        expect(formatError.calledOnce).true;
      });

      it('defers context eval with thunk until after options creation', async () => {
        const uniqueContext = { key: 'major' };
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;
        const resolvers = {
          Query: {
            hello: (_parent, _args, context) => {
              expect(context).to.equal(Promise.resolve(uniqueContext));
              return 'hi';
            },
          },
        };
        const spy = jest.fn().returns({});
        const { url: uri } = await createApolloServer({
          typeDefs,
          resolvers,
          context: spy,
        });

        const apolloFetch = createApolloFetch({ uri });

        expect(spy.notCalled).true;

        await apolloFetch({ query: '{hello}' });
        expect(spy.calledOnce).true;
        await apolloFetch({ query: '{hello}' });
        expect(spy.calledTwice).true;
      });

      it('allows context to be async function', async () => {
        const uniqueContext = { key: 'major' };
        const spy = jest.fn().returns('hi');
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;
        const resolvers = {
          Query: {
            hello: (_parent, _args, context) => {
              expect(context.key).to.equal('major');
              return spy();
            },
          },
        };
        const { url: uri } = await createApolloServer({
          typeDefs,
          resolvers,
          context: async () => uniqueContext,
        });

        const apolloFetch = createApolloFetch({ uri });

        expect(spy.notCalled).true;
        await apolloFetch({ query: '{hello}' });
        expect(spy.calledOnce).true;
      });

      it('clones the context for every request', async () => {
        const uniqueContext = { key: 'major' };
        const spy = jest.fn().returns('hi');
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;
        const resolvers = {
          Query: {
            hello: (_parent, _args, context) => {
              expect(context.key).to.equal('major');
              context.key = 'minor';
              return spy();
            },
          },
        };
        const { url: uri } = await createApolloServer({
          typeDefs,
          resolvers,
          context: uniqueContext,
        });

        const apolloFetch = createApolloFetch({ uri });

        expect(spy.notCalled).true;

        await apolloFetch({ query: '{hello}' });
        expect(spy.calledOnce).true;
        await apolloFetch({ query: '{hello}' });
        expect(spy.calledTwice).true;
      });

      it('returns thrown context error as a valid graphql result', async () => {
        const nodeEnv = process.env.NODE_ENV;
        delete process.env.NODE_ENV;
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;
        const resolvers = {
          Query: {
            hello: () => {
              throw Error('never get here');
            },
          },
        };
        const { url: uri } = await createApolloServer({
          typeDefs,
          resolvers,
          context: () => {
            throw new AuthenticationError('valid result');
          },
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: '{hello}' });
        expect(result.errors.length).to.equal(1);
        expect(result.data).not.to.exist;

        const e = result.errors[0];
        expect(e.message).to.contain('valid result');
        expect(e.extensions).to.exist;
        expect(e.extensions.code).to.equal('UNAUTHENTICATED');
        expect(e.extensions.exception.stacktrace).to.exist;

        process.env.NODE_ENV = nodeEnv;
      });

      it('propogates error codes in production', async () => {
        const nodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const { url: uri } = await createApolloServer({
          typeDefs: gql`
            type Query {
              error: String
            }
          `,
          resolvers: {
            Query: {
              error: () => {
                throw new AuthenticationError('we the best music');
              },
            },
          },
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{error}` });
        expect(result.data).to.exist;
        expect(result.data).to.deep.equal({ error: null });

        expect(result.errors, 'errors should exist').to.exist;
        expect(result.errors.length).to.equal(1);
        expect(result.errors[0].extensions.code).to.equal('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).not.to.exist;

        process.env.NODE_ENV = nodeEnv;
      });

      it('propogates error codes with null response in production', async () => {
        const nodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const { url: uri } = await createApolloServer({
          typeDefs: gql`
            type Query {
              error: String!
            }
          `,
          resolvers: {
            Query: {
              error: () => {
                throw new AuthenticationError('we the best music');
              },
            },
          },
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{error}` });
        expect(result.data).null;

        expect(result.errors, 'errors should exist').to.exist;
        expect(result.errors.length).to.equal(1);
        expect(result.errors[0].extensions.code).to.equal('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).not.to.exist;

        process.env.NODE_ENV = nodeEnv;
      });
    });

    describe('subscriptions', () => {
      const SOMETHING_CHANGED_TOPIC = 'something_changed';
      const pubsub = new PubSub();
      let subscription;

      function createEvent(num) {
        return setTimeout(
          () =>
            pubsub.publish(SOMETHING_CHANGED_TOPIC, {
              num,
            }),
          num + 10,
        );
      }

      afterEach(async () => {
        if (subscription) {
          try {
            await subscription.unsubscribe();
          } catch (e) {}
          subscription = null;
        }
      });

      it('enables subscriptions after creating subscriptions server', done => {
        const typeDefs = gql`
          type Query {
            hi: String
          }

          type Subscription {
            num: Int
          }
        `;

        const query = `
        subscription {
          num
        }
      `;

        const resolvers = {
          Query: {
            hi: () => 'here to placate graphql-js',
          },
          Subscription: {
            num: {
              subscribe: () => {
                createEvent(1);
                createEvent(2);
                createEvent(3);
                return pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC);
              },
            },
          },
        };

        createApolloServer({
          typeDefs,
          resolvers,
        }).then(({ port, server, httpServer }) => {
          server.installSubscriptionHandlers(httpServer);

          const client = new SubscriptionClient(
            `ws://localhost:${port}${server.subscriptionsPath}`,
            {},
            WebSocket,
          );

          const observable = client.request({ query });

          let i = 1;
          subscription = observable.subscribe({
            next: ({ data }) => {
              try {
                expect(data.num).to.equal(i);
                if (i === 3) {
                  done();
                }
                i++;
              } catch (e) {
                done(e);
              }
            },
            error: done,
            complete: () => {
              done(new Error('should not complete'));
            },
          });
        });
      });
      it('disables subscritpions when option set to false', done => {
        const typeDefs = gql`
          type Query {
            "graphql-js forces there to be a query type"
            hi: String
          }

          type Subscription {
            num: Int
          }
        `;

        const query = `
        subscription {
          num
        }
      `;

        const resolvers = {
          Query: {
            hi: () => 'here to placate graphql-js',
          },
          Subscription: {
            num: {
              subscribe: () => {
                createEvent(1);
                return pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC);
              },
            },
          },
        };

        createApolloServer({
          typeDefs,
          resolvers,
          subscriptions: false,
        }).then(({ port, server, httpServer }) => {
          try {
            server.installSubscriptionHandlers(httpServer);
            expect.fail();
          } catch (e) {
            expect(e.message).to.match(/disabled/);
          }

          const client = new SubscriptionClient(
            `ws://localhost:${port}${server.subscriptionsPath}`,
            {},
            WebSocket,
          );

          const observable = client.request({ query });

          subscription = observable.subscribe({
            next: () => {
              done(new Error('should not call next'));
            },
            error: () => {
              done(new Error('should not notify of error'));
            },
            complete: () => {
              done(new Error('should not complete'));
            },
          });

          // Unfortunately the error connection is not propagated to the
          // observable. What should happen is we provide a default onError
          // function that notifies the returned observable and can cursomize
          // the behavior with an option in the client constructor. If you're
          // available to make a PR to the following please do!
          // https://github.com/apollographql/subscriptions-transport-ws/blob/master/src/client.ts
          client.onError((_: Error) => {
            done();
          });
        });
      });
      it('accepts subscriptions configuration', done => {
        const onConnect = jest.fn().callsFake(connectionParams => ({
          ...connectionParams,
        }));
        const typeDefs = gql`
          type Query {
            hi: String
          }

          type Subscription {
            num: Int
          }
        `;

        const query = `
        subscription {
          num
        }
      `;

        const resolvers = {
          Query: {
            hi: () => 'here to placate graphql-js',
          },
          Subscription: {
            num: {
              subscribe: () => {
                createEvent(1);
                createEvent(2);
                createEvent(3);
                return pubsub.asyncIterator(SOMETHING_CHANGED_TOPIC);
              },
            },
          },
        };

        const path = '/sub';
        createApolloServer({
          typeDefs,
          resolvers,
          subscriptions: { onConnect, path },
        })
          .then(({ port, server, httpServer }) => {
            server.installSubscriptionHandlers(httpServer);
            expect(onConnect.notCalled).true;

            expect(server.subscriptionsPath).to.equal(path);
            const client = new SubscriptionClient(
              `ws://localhost:${port}${server.subscriptionsPath}`,
              {},
              WebSocket,
            );

            const observable = client.request({ query });

            let i = 1;
            subscription = observable.subscribe({
              next: ({ data }) => {
                try {
                  expect(onConnect.calledOnce).true;
                  expect(data.num).to.equal(i);
                  if (i === 3) {
                    done();
                  }
                  i++;
                } catch (e) {
                  done(e);
                }
              },
              error: done,
              complete: () => {
                done(new Error('should not complete'));
              },
            });
          })
          .catch(done);
      });
    });

    describe('Persisted Queries', () => {
      let uri: string;
      const query = gql`
        ${TEST_STRING_QUERY}
      `;
      const hash = sha256
        .create()
        .update(TEST_STRING_QUERY)
        .hex();
      const extensions = {
        persistedQuery: {
          version: VERSION,
          sha256Hash: hash,
        },
      };

      beforeEach(async () => {
        const serverInfo = await createApolloServer({
          schema,
          introspection: false,
          persistedQueries: {
            cache: new Map<string, string>() as any,
          },
        });
        uri = serverInfo.url;
      });

      it('returns PersistedQueryNotFound on the first try', async () => {
        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({
          extensions,
        } as any);

        expect(result.data).not.to.exist;
        expect(result.errors.length).to.equal(1);
        expect(result.errors[0].message).to.equal('PersistedQueryNotFound');
        expect(result.errors[0].extensions.code).to.equal(
          'PERSISTED_QUERY_NOT_FOUND',
        );
      });
      it('returns result on the second try', async () => {
        const apolloFetch = createApolloFetch({ uri });

        await apolloFetch({
          extensions,
        } as any);
        const result = await apolloFetch({
          extensions,
          query: TEST_STRING_QUERY,
        } as any);

        expect(result.data).to.deep.equal({ testString: 'test string' });
        expect(result.errors).not.to.exist;
      });

      it('returns result on the persisted query', async () => {
        const apolloFetch = createApolloFetch({ uri });

        await apolloFetch({
          extensions,
        } as any);
        await apolloFetch({
          extensions,
          query: TEST_STRING_QUERY,
        } as any);
        const result = await apolloFetch({
          extensions,
        } as any);

        expect(result.data).to.deep.equal({ testString: 'test string' });
        expect(result.errors).not.to.exist;
      });

      // Apollo Fetch's result depends on the server implementation, if the
      // statusText of the error is unparsable, then we'll fall into the catch,
      // such as with express. If it is parsable, then we'll use the afterware
      it('returns error when hash does not match', async () => {
        const apolloFetch = createApolloFetch({ uri }).useAfter((res, next) => {
          expect(res.response.status).to.equal(400);
          expect(res.response.raw).to.match(/does not match query/);
          next();
        });

        try {
          await apolloFetch({
            extensions: {
              persistedQuery: {
                version: VERSION,
                sha:
                  'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              },
            },
            query: TEST_STRING_QUERY,
          } as any);
        } catch (e) {
          expect(e.response).to.exist;
          expect(e.response.status).to.equal(400);
          expect(e.response.raw).to.match(/does not match query/);
        }
      });

      it('returns correct result for persisted query link', done => {
        const variables = { id: 1 };
        const link = createPersistedQuery().concat(
          createHttpLink({ uri, fetch } as any),
        );

        execute(link, { query, variables } as any).subscribe(result => {
          expect(result.data).to.deep.equal({ testString: 'test string' });
          done();
        }, done);
      });

      it('returns correct result for persisted query link using get request', done => {
        const variables = { id: 1 };
        const link = createPersistedQuery({
          useGETForHashedQueries: true,
        }).concat(createHttpLink({ uri, fetch } as any));

        execute(link, { query, variables } as any).subscribe(result => {
          expect(result.data).to.deep.equal({ testString: 'test string' });
          done();
        }, done);
      });
    });
  });
}
