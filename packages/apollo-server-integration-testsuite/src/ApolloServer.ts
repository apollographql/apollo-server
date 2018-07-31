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

          const formatError = jest.fn(error => {
            expect(error instanceof Error).toBe(true);
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
          expect(introspectionResult.data).toBeUndefined();
          expect(introspectionResult.errors).toBeDefined();
          expect(introspectionResult.errors[0].message).toMatch(
            /introspection/,
          );
          expect(formatError.mock.calls.length).toEqual(
            introspectionResult.errors.length,
          );

          const result = await apolloFetch({ query: TEST_STRING_QUERY });
          expect(result.data).toBeUndefined();
          expect(result.errors).toBeDefined();
          expect(result.errors[0].message).toMatch(/Not allowed/);
          expect(formatError.mock.calls.length).toEqual(
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
          expect(result.data).toBeDefined();
          expect(result.errors).toBeUndefined();

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
          expect(result.data).toBeUndefined();
          expect(result.errors).toBeDefined();
          expect(result.errors.length).toEqual(1);
          expect(result.errors[0].extensions.code).toEqual(
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
          expect(result.data).toBeDefined();
          expect(result.errors).toBeUndefined();

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

          expect(result.data).toEqual({ hello: 'hi' });
          expect(result.errors).toBeUndefined();
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

          expect(typeDefResult.data).toBeUndefined();
          expect(typeDefResult.errors).toBeDefined();

          const result = await apolloFetch({ query: '{testString}' });
          expect(result.data).toEqual({ testString: 'test string' });
          expect(result.errors).toBeUndefined();
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
          expect(result.data).toEqual({ hello: 'Hello World' });
          expect(result.errors).toBeUndefined();
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

          expect(result.data).toEqual({ hello: 'mock city' });
          expect(result.errors).toBeUndefined();
        });
      });
    });

    describe('formatError', () => {
      it('wraps thrown error from validation rules', async () => {
        const throwError = jest.fn(() => {
          throw new Error('nope');
        });

        const formatError = jest.fn(error => {
          expect(error instanceof Error).toBe(true);
          expect(error.constructor.name).toEqual('Error');
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
        expect(introspectionResult.data).toBeUndefined();
        expect(introspectionResult.errors).toBeDefined();
        expect(formatError).toHaveBeenCalledTimes(1);
        expect(throwError).toHaveBeenCalledTimes(1);

        const result = await apolloFetch({ query: TEST_STRING_QUERY });
        expect(result.data).toBeUndefined();
        expect(result.errors).toBeDefined();
        expect(formatError).toHaveBeenCalledTimes(2);
        expect(throwError).toHaveBeenCalledTimes(2);
      });

      it('works with errors similar to GraphQL errors, such as yup', async () => {
        const throwError = jest.fn(async () => {
          const schema = yup.object().shape({
            email: yup
              .string()
              .email()
              .required('Please enter your email address'),
          });

          await schema.validate({ email: 'lol' });
        });

        const formatError = jest.fn(error => {
          expect(error instanceof Error).toBe(true);
          expect(error.extensions.code).toEqual('INTERNAL_SERVER_ERROR');
          expect(error.extensions.exception.name).toEqual('ValidationError');
          expect(error.extensions.exception.message).toBeDefined();
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
        expect(result.data).toEqual({ error: null });
        expect(result.errors).toBeDefined();
        expect(result.errors[0].extensions.code).toEqual('BAD_USER_INPUT');
        expect(result.errors[0].message).toEqual('User Input Error');
        expect(formatError).toHaveBeenCalledTimes(1);
        expect(throwError).toHaveBeenCalledTimes(1);
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

          const throwError = jest.fn(() => {
            throw new Error('nope');
          });

          const validationRule = jest.fn(() => {
            // formatError should be called after validation
            expect(formatError).not.toBeCalled();
            // extension should be called after validation
            expect(extension).not.toBeCalled();
            return true;
          });
          const extension = jest.fn();

          const formatError = jest.fn(error => {
            expect(error instanceof Error).toBe(true);
            // extension should be called before formatError
            expect(extension).toHaveBeenCalledTimes(1);
            // validationRules should be called before formatError
            expect(validationRule).toHaveBeenCalledTimes(1);

            error.message = 'masked';
            return error;
          });

          class Extension extends GraphQLExtension {
            willSendResponse(o: { graphqlResponse: GraphQLResponse }) {
              expect(o.graphqlResponse.errors.length).toEqual(1);
              // formatError should be called after extensions
              expect(formatError).not.toBeCalled();
              // validationRules should be called before extensions
              expect(validationRule).toHaveBeenCalledTimes(1);
              extension();
            }
          }

          const port = Math.floor(Math.random() * (65535 - 1025)) + 1025;

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
              endpointUrl: `http://localhost:${port}`,
              apiKey: 'fake',
              maxUncompressedReportSize: 1,
            },
            formatError,
            debug: true,
          });

          let listener = await startEngineServer({
            port,
            check: (req, res) => {
              const trace = JSON.stringify(Trace.decode(req.body));
              try {
                expect(trace).toMatch(/nope/);
                expect(trace).not.toMatch(/masked/);
              } catch (e) {
                reject(e);
              }
              res.end();
              listener.close(resolve);
            },
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({
            query: `{error}`,
          });
          expect(result.data).toEqual({
            error: null,
          });
          expect(result.errors).toBeDefined();
          expect(result.errors[0].message).toEqual('masked');
          expect(formatError).toHaveBeenCalledTimes(1);
          expect(throwError).toHaveBeenCalledTimes(1);

          process.env.NODE_ENV = nodeEnv;
        });
      });

      it('errors thrown in extensions call formatError and are wrapped', async () => {
        const extension = jest.fn(() => {
          throw new Error('nope');
        });

        const formatError = jest.fn(error => {
          expect(error instanceof Error).toBe(true);
          // extension should be called before formatError
          expect(extension).toHaveBeenCalledTimes(1);

          error.message = 'masked';
          return error;
        });

        class Extension extends GraphQLExtension {
          willSendResponse(_o: { graphqlResponse: GraphQLResponse }) {
            // formatError should be called after extensions
            expect(formatError).not.toBeCalled();
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
        expect(result.data).toBeUndefined();
        expect(result.errors).toBeDefined();
        expect(result.errors[0].message).toEqual('masked');
        expect(formatError).toHaveBeenCalledTimes(1);
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
              expect(context).toEqual(Promise.resolve(uniqueContext));
              return 'hi';
            },
          },
        };
        const spy = jest.fn(() => ({}));
        const { url: uri } = await createApolloServer({
          typeDefs,
          resolvers,
          context: spy,
        });

        const apolloFetch = createApolloFetch({ uri });

        expect(spy).not.toBeCalled();

        await apolloFetch({ query: '{hello}' });
        expect(spy).toHaveBeenCalledTimes(1);
        await apolloFetch({ query: '{hello}' });
        expect(spy).toHaveBeenCalledTimes(2);
      });

      it('allows context to be async function', async () => {
        const uniqueContext = { key: 'major' };
        const spy = jest.fn(() => 'hi');
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;
        const resolvers = {
          Query: {
            hello: (_parent, _args, context) => {
              expect(context.key).toEqual('major');
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

        expect(spy).not.toBeCalled();
        await apolloFetch({ query: '{hello}' });
        expect(spy).toHaveBeenCalledTimes(1);
      });

      it('clones the context for every request', async () => {
        const uniqueContext = { key: 'major' };
        const spy = jest.fn(() => 'hi');
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;
        const resolvers = {
          Query: {
            hello: (_parent, _args, context) => {
              expect(context.key).toEqual('major');
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

        expect(spy).not.toBeCalled();

        await apolloFetch({ query: '{hello}' });
        expect(spy).toHaveBeenCalledTimes(1);
        await apolloFetch({ query: '{hello}' });
        expect(spy).toHaveBeenCalledTimes(2);
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
        expect(result.errors.length).toEqual(1);
        expect(result.data).toBeUndefined();

        const e = result.errors[0];
        expect(e.message).toMatch('valid result');
        expect(e.extensions).toBeDefined();
        expect(e.extensions.code).toEqual('UNAUTHENTICATED');
        expect(e.extensions.exception.stacktrace).toBeDefined();

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
        expect(result.data).toBeDefined();
        expect(result.data).toEqual({ error: null });

        expect(result.errors).toBeDefined();
        expect(result.errors.length).toEqual(1);
        expect(result.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).toBeUndefined();

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
        expect(result.data).toBeNull();

        expect(result.errors).toBeDefined();
        expect(result.errors.length).toEqual(1);
        expect(result.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).toBeUndefined();

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
                expect(data.num).toEqual(i);
                if (i === 3) {
                  done();
                }
                i++;
              } catch (e) {
                done.fail(e);
              }
            },
            error: done.fail,
            complete: () => {
              done.fail(new Error('should not complete'));
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
            done.fail(
              'subscription server creation should fail, since subscriptions are disabled',
            );
          } catch (e) {
            expect(e.message).toMatch(/disabled/);
          }

          const client = new SubscriptionClient(
            `ws://localhost:${port}${server.subscriptionsPath}`,
            {},
            WebSocket,
          );

          const observable = client.request({ query });

          subscription = observable.subscribe({
            next: () => {
              done.fail(new Error('should not call next'));
            },
            error: () => {
              done.fail(new Error('should not notify of error'));
            },
            complete: () => {
              done.fail(new Error('should not complete'));
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
        const onConnect = jest.fn(connectionParams => ({
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
            expect(onConnect).not.toBeCalled();

            expect(server.subscriptionsPath).toEqual(path);
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
                  expect(onConnect).toHaveBeenCalledTimes(1);
                  expect(data.num).toEqual(i);
                  if (i === 3) {
                    done();
                  }
                  i++;
                } catch (e) {
                  done.fail(e);
                }
              },
              error: done.fail,
              complete: () => {
                done.fail(new Error('should not complete'));
              },
            });
          })
          .catch(done.fail);
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

        expect(result.data).toBeUndefined();
        expect(result.errors.length).toEqual(1);
        expect(result.errors[0].message).toEqual('PersistedQueryNotFound');
        expect(result.errors[0].extensions.code).toEqual(
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

        expect(result.data).toEqual({ testString: 'test string' });
        expect(result.errors).toBeUndefined();
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

        expect(result.data).toEqual({ testString: 'test string' });
        expect(result.errors).toBeUndefined();
      });

      // Apollo Fetch's result depends on the server implementation, if the
      // statusText of the error is unparsable, then we'll fall into the catch,
      // such as with express. If it is parsable, then we'll use the afterware
      it('returns error when hash does not match', async () => {
        const apolloFetch = createApolloFetch({ uri }).useAfter((res, next) => {
          expect(res.response.status).toEqual(400);
          expect(res.response.raw).toMatch(/does not match query/);
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
          expect(e.response).toBeDefined();
          expect(e.response.status).toEqual(400);
          expect(e.response.raw).toMatch(/does not match query/);
        }
      });

      it('returns correct result for persisted query link', done => {
        const variables = { id: 1 };
        const link = createPersistedQuery().concat(
          createHttpLink({ uri, fetch } as any),
        );

        execute(link, { query, variables } as any).subscribe(result => {
          expect(result.data).toEqual({ testString: 'test string' });
          done();
        }, done.fail);
      });

      it('returns correct result for persisted query link using get request', done => {
        const variables = { id: 1 };
        const link = createPersistedQuery({
          useGETForHashedQueries: true,
        }).concat(createHttpLink({ uri, fetch } as any));

        execute(link, { query, variables } as any).subscribe(result => {
          expect(result.data).toEqual({ testString: 'test string' });
          done();
        }, done.fail);
      });
    });
  });
}
