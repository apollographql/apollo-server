/* tslint:disable:no-unused-expression */
import http from 'http';
import net from 'net';
import { sha256 } from 'js-sha256';
import express = require('express');
import bodyParser = require('body-parser');
import yup = require('yup');

import { FullTracesReport, ITrace } from 'apollo-engine-reporting-protobuf';

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
import WebSocket from 'ws';

import { execute } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import {
  createPersistedQueryLink as createPersistedQuery,
  VERSION,
} from 'apollo-link-persisted-queries';

import { createApolloFetch, ApolloFetch, GraphQLRequest } from 'apollo-fetch';
import {
  AuthenticationError,
  UserInputError,
  gql,
  Config,
  ApolloServerBase,
} from 'apollo-server-core';
import { Headers } from 'apollo-server-env';
import { GraphQLExtension, GraphQLResponse } from 'graphql-extensions';
import { TracingFormat } from 'apollo-tracing';
import ApolloServerPluginResponseCache from 'apollo-server-plugin-response-cache';
import { GraphQLRequestContext } from 'apollo-server-plugin-base';

import { mockDate, unmockDate, advanceTimeBy } from '__mocks__/date';
import { EngineReportingOptions } from 'apollo-engine-reporting';

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

        it('allows mocks as an object without overriding the existing resolvers', async () => {
          const typeDefs = gql`
            type User {
              first: String
              last: String
            }
            type Query {
              user: User
            }
          `;
          const resolvers = {
            Query: {
              user: () => ({
                first: 'James',
                last: 'Heinlen',
              }),
            },
          };
          const { url: uri } = await createApolloServer({
            typeDefs,
            resolvers,
            mocks: {
              User: () => ({
                last: () => 'mock city',
              }),
            },
          });

          const apolloFetch = createApolloFetch({ uri });
          const result = await apolloFetch({
            query: '{user{first last}}',
          });
          expect(result.data).toEqual({
            user: { first: 'Hello World', last: 'mock city' },
          });
          expect(result.errors).toBeUndefined();
        });

        // Need to fix bug in graphql-tools to enable mocks to override the existing resolvers
        it.skip('allows mocks as an object with overriding the existing resolvers', async () => {
          const typeDefs = gql`
            type User {
              first: String
              last: String
            }
            type Query {
              user: User
            }
          `;
          const resolvers = {
            Query: {
              user: () => ({
                first: 'James',
                last: 'Heinlen',
              }),
            },
          };
          const { url: uri } = await createApolloServer({
            typeDefs,
            resolvers,
            mocks: {
              User: () => ({
                last: () => 'mock city',
              }),
            },
            mockEntireSchema: false,
          });

          const apolloFetch = createApolloFetch({ uri });
          const result = await apolloFetch({
            query: '{user{first last}}',
          });
          expect(result.data).toEqual({
            user: { first: 'James', last: 'mock city' },
          });
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
              fieldWhichWillError: String
            }
          `,
          resolvers: {
            Query: {
              fieldWhichWillError: () => {
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
          query: '{fieldWhichWillError}',
        });
        expect(result.data).toEqual({ fieldWhichWillError: null });
        expect(result.errors).toBeDefined();
        expect(result.errors[0].extensions.code).toEqual('BAD_USER_INPUT');
        expect(result.errors[0].message).toEqual('User Input Error');
        expect(formatError).toHaveBeenCalledTimes(1);
        expect(throwError).toHaveBeenCalledTimes(1);
      });
    });

    describe('lifecycle', () => {
      describe('with Engine server', () => {
        let nodeEnv: string;
        let engineServer: EngineMockServer;

        class EngineMockServer {
          private app: express.Application;
          private server: http.Server;
          private reports: FullTracesReport[] = [];
          public readonly promiseOfReports: Promise<FullTracesReport[]>;

          constructor() {
            let reportResolver: (reports: FullTracesReport[]) => void;
            this.promiseOfReports = new Promise<FullTracesReport[]>(resolve => {
              reportResolver = resolve;
            });

            this.app = express();
            this.app.use((req, _res, next) => {
              // body parser requires a content-type
              req.headers['content-type'] = 'text/plain';
              next();
            });
            this.app.use(
              bodyParser.raw({
                inflate: true,
                type: '*/*',
              }),
            );

            this.app.use((req, res) => {
              const report = FullTracesReport.decode(req.body);
              this.reports.push(report);
              res.end();

              // Resolve any outstanding Promises with our new report data.
              reportResolver(this.reports);
            });
          }

          async listen(): Promise<http.Server> {
            return await new Promise(resolve => {
              const server = (this.server = this.app.listen(
                0,
                // Intentionally IPv4.
                '127.0.0.1',
                () => {
                  resolve(server);
                },
              ));
            });
          }

          async stop(): Promise<void> {
            if (!this.server) {
              return;
            }

            return new Promise(resolve => {
              this.server && this.server.close(resolve);
            });
          }

          public engineOptions(): Partial<EngineReportingOptions<any>> {
            return {
              endpointUrl: this.getUrl(),
            };
          }

          private getUrl(): string {
            if (!this.server) {
              throw new Error('must listen before getting URL');
            }
            const {
              family,
              address,
              port,
            } = this.server.address() as net.AddressInfo;

            if (family !== 'IPv4') {
              throw new Error(`The family was unexpectedly ${family}.`);
            }
            const { URL } = require('url');
            return new URL(`http://${address}:${port}`).toString();
          }
        }

        beforeEach(async () => {
          nodeEnv = process.env.NODE_ENV;
          delete process.env.NODE_ENV;
          engineServer = new EngineMockServer();
          return await engineServer.listen();
        });

        afterEach(done => {
          process.env.NODE_ENV = nodeEnv;

          (engineServer.stop() || Promise.resolve()).then(done);
        });

        // TODO(jesse) This test block can be merged with another that will
        // appear in a separate describe/it block after a branch merges
        // that hasn't quite become a PR yet: abernix/finish-pr-1639.  It's
        // intentionally separate right now because of the guaranteed merge
        // conflict.
        it('validation > engine > extensions > formatError', async () => {
          const throwError = jest.fn(() => {
            throw new Error('nope');
          });

          const validationRule = jest.fn(() => {
            // formatError should be called after validation
            expect(formatError).not.toBeCalled();
            // extension should be called after validation
            expect(willSendResponseInExtension).not.toBeCalled();
            return true;
          });

          const willSendResponseInExtension = jest.fn();

          const formatError = jest.fn(error => {
            try {
              expect(error).toBeInstanceOf(Error);
              // extension should be called before formatError
              expect(willSendResponseInExtension).toHaveBeenCalledTimes(1);
              // validationRules should be called before formatError
              expect(validationRule).toHaveBeenCalledTimes(1);
            } finally {
              error.message = 'masked';
              return error;
            }
          });

          class Extension<TContext = any> extends GraphQLExtension {
            willSendResponse(o: {
              graphqlResponse: GraphQLResponse;
              context: TContext;
            }) {
              expect(o.graphqlResponse.errors.length).toEqual(1);
              // formatError should be called before willSendResponse
              expect(formatError).toHaveBeenCalledTimes(1);
              // validationRule should be called before willSendResponse
              expect(validationRule).toHaveBeenCalledTimes(1);
              willSendResponseInExtension();
            }
          }

          const { url: uri } = await createApolloServer({
            typeDefs: gql`
              type Query {
                fieldWhichWillError: String
              }
            `,
            resolvers: {
              Query: {
                fieldWhichWillError: () => {
                  throwError();
                },
              },
            },
            validationRules: [validationRule],
            extensions: [() => new Extension()],
            engine: {
              ...engineServer.engineOptions(),
              apiKey: 'service:my-app:secret',
              maxUncompressedReportSize: 1,
              generateClientInfo: () => ({
                clientName: 'testing',
                clientReferenceId: '1234',
                clientVersion: 'v1.0.1',
              }),
            },
            formatError,
            debug: true,
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({
            query: `{fieldWhichWillError}`,
          });
          expect(result.data).toEqual({
            fieldWhichWillError: null,
          });
          expect(result.errors).toBeDefined();
          expect(result.errors[0].message).toEqual('masked');

          expect(validationRule).toHaveBeenCalledTimes(1);
          expect(throwError).toHaveBeenCalledTimes(1);
          expect(formatError).toHaveBeenCalledTimes(1);
          expect(willSendResponseInExtension).toHaveBeenCalledTimes(1);

          const reports = await engineServer.promiseOfReports;

          expect(reports.length).toBe(1);

          const trace = Object.values(reports[0].tracesPerQuery)[0].trace[0];

          expect(trace.clientReferenceId).toMatch(/1234/);
          expect(trace.clientName).toMatch(/testing/);
          expect(trace.clientVersion).toEqual('v1.0.1');

          expect(trace.root!.child![0].error![0].message).toMatch(/nope/);
          expect(trace.root!.child![0].error![0].message).not.toMatch(/masked/);
        });

        describe('validation > engine > traces', () => {
          let apolloFetch: ApolloFetch;

          const setupApolloServerAndFetchPair = async (
            engineOptions: Partial<EngineReportingOptions<any>> = {},
          ) => {
            const { url: uri } = await createApolloServer({
              typeDefs: gql`
                type Query {
                  justAField: String
                }
              `,
              resolvers: {
                Query: {
                  justAField: () => 'a string',
                },
              },
              engine: {
                ...engineServer.engineOptions(),
                apiKey: 'service:my-app:secret',
                maxUncompressedReportSize: 1,
                ...engineOptions,
              },
              debug: true,
            });

            apolloFetch = createApolloFetch({ uri });
          };

          it('sets the trace key to operationName when it is defined', async () => {
            await setupApolloServerAndFetchPair();

            const result = await apolloFetch({
              query: `query AnOperationName {justAField}`,
            });
            expect(result.data).toEqual({
              justAField: 'a string',
            });
            expect(result.errors).not.toBeDefined();

            const reports = await engineServer.promiseOfReports;
            expect(reports.length).toBe(1);

            expect(Object.keys(reports[0].tracesPerQuery)[0]).toMatch(
              /^# AnOperationName\n/,
            );
          });

          it('sets the trace key to "-" when operationName is undefined', async () => {
            await setupApolloServerAndFetchPair();

            const result = await apolloFetch({
              query: `{justAField}`,
            });
            expect(result.data).toEqual({
              justAField: 'a string',
            });
            expect(result.errors).not.toBeDefined();

            const reports = await engineServer.promiseOfReports;
            expect(reports.length).toBe(1);

            expect(Object.keys(reports[0].tracesPerQuery)[0]).toMatch(/^# -\n/);
          });
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

        class Extension<TContext = any> extends GraphQLExtension {
          willSendResponse(_o: {
            graphqlResponse: GraphQLResponse;
            context: TContext;
          }) {
            // formatError should be called after extensions
            expect(formatError).not.toBeCalled();
            extension();
          }
        }

        const { url: uri } = await createApolloServer({
          typeDefs: gql`
            type Query {
              fieldWhichWillError: String
            }
          `,
          resolvers: {
            Query: {
              fieldWhichWillError: () => {},
            },
          },
          extensions: [() => new Extension()],
          formatError,
          debug: true,
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({
          query: `{fieldWhichWillError}`,
        });
        expect(result.data).toBeUndefined();
        expect(result.errors).toBeDefined();
        expect(result.errors[0].message).toEqual('masked');
        expect(formatError).toHaveBeenCalledTimes(1);
      });

      describe('context field', () => {
        const typeDefs = gql`
          type Query {
            hello: String
          }
        `;

        const resolvers = {
          Query: {
            hello: () => 'hi',
          },
        };

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

        describe('as a function', () => {
          it('can accept and return `req`', async () => {
            expect(
              await createApolloServer({
                typeDefs,
                resolvers,
                context: ({ req }) => ({ req }),
              }),
            ).not.toThrow;
          });

          it('can accept nothing and return an empty object', async () => {
            expect(
              await createApolloServer({
                typeDefs,
                resolvers,
                context: () => ({}),
              }),
            ).not.toThrow;
          });

          it('can be an async function', async () => {
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
        });

        describe('as an object', () => {
          it('can be an empty object', async () => {
            expect(
              await createApolloServer({
                typeDefs,
                resolvers,
                context: {},
              }),
            ).not.toThrow;
          });

          it('can contain arbitrary values', async () => {
            expect(
              await createApolloServer({
                typeDefs,
                resolvers,
                context: { value: 'arbitrary' },
              }),
            ).not.toThrow;
          });
        });
      });

      it('propogates error codes in production', async () => {
        const nodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const { url: uri } = await createApolloServer({
          typeDefs: gql`
            type Query {
              fieldWhichWillError: String
            }
          `,
          resolvers: {
            Query: {
              fieldWhichWillError: () => {
                throw new AuthenticationError('we the best music');
              },
            },
          },
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{fieldWhichWillError}` });
        expect(result.data).toBeDefined();
        expect(result.data).toEqual({ fieldWhichWillError: null });

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
              fieldWhichWillError: String!
            }
          `,
          resolvers: {
            Query: {
              fieldWhichWillError: () => {
                throw new AuthenticationError('we the best music');
              },
            },
          },
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{fieldWhichWillError}` });
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
      it('disables subscriptions when option set to false', done => {
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
            `ws://localhost:${port}${server.subscriptionsPath || ''}`,
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

    describe('Tracing', () => {
      const typeDefs = gql`
        type Book {
          title: String
          author: String
        }

        type Movie {
          title: String
        }

        type Query {
          books: [Book]
          movies: [Movie]
        }
      `;

      const resolvers = {
        Query: {
          books: () =>
            new Promise(resolve =>
              setTimeout(() => resolve([{ title: 'H', author: 'J' }]), 10),
            ),
          movies: () =>
            new Promise(resolve =>
              setTimeout(() => resolve([{ title: 'H' }]), 12),
            ),
        },
      };

      it('reports a total duration that is longer than the duration of its resolvers', async () => {
        const { url: uri } = await createApolloServer({
          typeDefs,
          resolvers,
          tracing: true,
        });

        const apolloFetch = createApolloFetch({ uri });
        const result = await apolloFetch({
          query: `{ books { title author } }`,
        });

        const tracing: TracingFormat = result.extensions.tracing;

        const earliestStartOffset = tracing.execution.resolvers
          .map(resolver => resolver.startOffset)
          .reduce((currentEarliestOffset, nextOffset) =>
            Math.min(currentEarliestOffset, nextOffset),
          );

        const latestEndOffset = tracing.execution.resolvers
          .map(resolver => resolver.startOffset + resolver.duration)
          .reduce((currentLatestEndOffset, nextEndOffset) =>
            Math.min(currentLatestEndOffset, nextEndOffset),
          );

        const resolverDuration = latestEndOffset - earliestStartOffset;

        expect(resolverDuration).not.toBeGreaterThan(tracing.duration);
      });
    });

    describe('Response caching', () => {
      beforeAll(() => {
        mockDate();
      });

      afterAll(() => {
        unmockDate();
      });

      it('basic caching', async () => {
        const typeDefs = gql`
          type Query {
            cached: String @cacheControl(maxAge: 10)
            uncached: String
            private: String @cacheControl(maxAge: 9, scope: PRIVATE)
          }
        `;

        type FieldName = 'cached' | 'uncached' | 'private';
        const fieldNames: FieldName[] = ['cached', 'uncached', 'private'];
        const resolverCallCount: Partial<Record<FieldName, number>> = {};
        const expectedResolverCallCount: Partial<
          Record<FieldName, number>
        > = {};
        const expectCacheHit = (fn: FieldName) =>
          expect(resolverCallCount[fn]).toBe(expectedResolverCallCount[fn]);
        const expectCacheMiss = (fn: FieldName) =>
          expect(resolverCallCount[fn]).toBe(++expectedResolverCallCount[fn]);

        const resolvers = {
          Query: {},
        };
        fieldNames.forEach(name => {
          resolverCallCount[name] = 0;
          expectedResolverCallCount[name] = 0;
          resolvers.Query[name] = () => {
            resolverCallCount[name]++;
            return `value:${name}`;
          };
        });

        const { url: uri } = await createApolloServer({
          typeDefs,
          resolvers,
          plugins: [
            ApolloServerPluginResponseCache({
              sessionId: (requestContext: GraphQLRequestContext<any>) => {
                return (
                  requestContext.request.http.headers.get('session-id') || null
                );
              },
              extraCacheKeyData: (
                requestContext: GraphQLRequestContext<any>,
              ) => {
                return (
                  requestContext.request.http.headers.get(
                    'extra-cache-key-data',
                  ) || null
                );
              },
              shouldReadFromCache: (
                requestContext: GraphQLRequestContext<any>,
              ) => {
                return !requestContext.request.http.headers.get(
                  'no-read-from-cache',
                );
              },
              shouldWriteToCache: (
                requestContext: GraphQLRequestContext<any>,
              ) => {
                return !requestContext.request.http.headers.get(
                  'no-write-to-cache',
                );
              },
            }),
          ],
        });

        const apolloFetch = createApolloFetch({ uri });
        apolloFetch.use(({ request, options }, next) => {
          const headers = (request as any).headers;
          if (headers) {
            if (!options.headers) {
              options.headers = {};
            }
            for (const k in headers) {
              options.headers[k] = headers[k];
            }
          }
          next();
        });
        // Make HTTP response headers visible on the result next to 'data'.
        apolloFetch.useAfter(({ response }, next) => {
          response.parsed.httpHeaders = response.headers;
          next();
        });
        // Use 'any' because we're sneaking httpHeaders onto response.parsed.
        function httpHeader(result: any, header: string): string | null {
          const value = (result.httpHeaders as Headers).get(header);
          // hack: hapi sets cache-control: no-cache by default; make it
          // look to our tests like the other servers.
          if (header === 'cache-control' && value === 'no-cache') {
            return null;
          }
          return value;
        }
        // Just for the typing.
        function doFetch(
          options: GraphQLRequest & { headers?: Record<string, string> },
        ) {
          return apolloFetch(options as any);
        }

        const basicQuery = '{ cached }';
        const fetch = async () => {
          const result = await doFetch({
            query: basicQuery,
          });
          expect(result.data.cached).toBe('value:cached');
          return result;
        };

        // Cache miss
        {
          const result = await fetch();
          expectCacheMiss('cached');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=10, public',
          );
          expect(httpHeader(result, 'age')).toBe(null);
        }

        // Cache hit
        {
          const result = await fetch();
          expectCacheHit('cached');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=10, public',
          );
          expect(httpHeader(result, 'age')).toBe('0');
        }

        // Cache hit partway to ttl.
        advanceTimeBy(5 * 1000);
        {
          const result = await fetch();
          expectCacheHit('cached');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=10, public',
          );
          expect(httpHeader(result, 'age')).toBe('5');
        }

        // Cache miss after ttl.
        advanceTimeBy(6 * 1000);
        {
          const result = await fetch();
          expectCacheMiss('cached');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=10, public',
          );
          expect(httpHeader(result, 'age')).toBe(null);
        }

        // Cache hit.
        {
          const result = await fetch();
          expectCacheHit('cached');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=10, public',
          );
          expect(httpHeader(result, 'age')).toBe('0');
        }

        // For now, caching is based on the original document text, not the AST,
        // so this should be a cache miss.
        {
          const result = await doFetch({
            query: '{       cached           }',
          });
          expect(result.data.cached).toBe('value:cached');
          expectCacheMiss('cached');
        }

        // This definitely should be a cache miss because the output is different.
        {
          const result = await doFetch({
            query: '{alias: cached}',
          });
          expect(result.data.alias).toBe('value:cached');
          expectCacheMiss('cached');
        }

        // Reading both a cached and uncached data should not get cached (it's a
        // full response cache).
        {
          const result = await doFetch({
            query: '{cached uncached}',
          });
          expect(result.data.cached).toBe('value:cached');
          expect(result.data.uncached).toBe('value:uncached');
          expectCacheMiss('cached');
          expectCacheMiss('uncached');
          expect(httpHeader(result, 'cache-control')).toBe(null);
          expect(httpHeader(result, 'age')).toBe(null);
        }

        // Just double-checking that it didn't get cached.
        {
          const result = await doFetch({
            query: '{cached uncached}',
          });
          expect(result.data.cached).toBe('value:cached');
          expect(result.data.uncached).toBe('value:uncached');
          expectCacheMiss('cached');
          expectCacheMiss('uncached');
          expect(httpHeader(result, 'cache-control')).toBe(null);
          expect(httpHeader(result, 'age')).toBe(null);
        }

        // Let's just remind ourselves that the basic query is cacheable.
        {
          await doFetch({ query: basicQuery });
          expectCacheHit('cached');
        }

        // But if we give it some extra cache key data, it'll be cached separately.
        {
          const result = await doFetch({
            query: basicQuery,
            headers: { 'extra-cache-key-data': 'foo' },
          });
          expect(result.data.cached).toBe('value:cached');
          expectCacheMiss('cached');
        }

        // But if we give it the same extra cache key data twice, it's a hit.
        {
          const result = await doFetch({
            query: basicQuery,
            headers: { 'extra-cache-key-data': 'foo' },
          });
          expect(result.data.cached).toBe('value:cached');
          expectCacheHit('cached');
        }

        // Without a session ID, private fields won't be cached.
        {
          const result = await doFetch({
            query: '{private}',
          });
          expect(result.data.private).toBe('value:private');
          expectCacheMiss('private');
          // Note that the HTTP header calculator doesn't know about session
          // IDs, so it'll still tell HTTP-level caches to cache this, albeit
          // privately.
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=9, private',
          );
          expect(httpHeader(result, 'age')).toBe(null);
        }

        // See?
        {
          const result = await doFetch({
            query: '{private}',
          });
          expect(result.data.private).toBe('value:private');
          expectCacheMiss('private');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=9, private',
          );
        }

        // OK, how about with a session ID.  First try should be a miss.
        {
          const result = await doFetch({
            query: '{private}',
            headers: { 'session-id': 'foo' },
          });
          expect(result.data.private).toBe('value:private');
          expectCacheMiss('private');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=9, private',
          );
        }

        // But next try should be a hit.
        {
          const result = await doFetch({
            query: '{private}',
            headers: { 'session-id': 'foo' },
          });
          expect(result.data.private).toBe('value:private');
          expectCacheHit('private');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=9, private',
          );
        }

        // But a different session ID should be a miss again.
        {
          const result = await doFetch({
            query: '{private}',
            headers: { 'session-id': 'bar' },
          });
          expect(result.data.private).toBe('value:private');
          expectCacheMiss('private');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=9, private',
          );
        }

        // As should be no session.
        {
          const result = await doFetch({
            query: '{private}',
          });
          expect(result.data.private).toBe('value:private');
          expectCacheMiss('private');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=9, private',
          );
        }

        // Let's remind ourselves once again that the basic (public) query is *still* cached.
        {
          const result = await doFetch({ query: basicQuery });
          expectCacheHit('cached');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=10, public',
          );
        }

        // If you're logged in, though, you get your own cache shared with all
        // other authenticated users (the "authenticated public" cache), so this
        // is a miss. It's still a public cache, though, for the HTTP header.
        // XXX Does that makes sense? Maybe this should be private, or maybe we
        // should drop the entire "authenticated public" concept.
        {
          const result = await doFetch({
            query: basicQuery,
            headers: { 'session-id': 'bar' },
          });
          expect(result.data.cached).toBe('value:cached');
          expectCacheMiss('cached');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=10, public',
          );
        }

        // See, this other session sees it!
        {
          const result = await doFetch({
            query: basicQuery,
            headers: { 'session-id': 'baz' },
          });
          expect(result.data.cached).toBe('value:cached');
          expectCacheHit('cached');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=10, public',
          );
          expect(httpHeader(result, 'age')).toBe('0');
        }

        // Let's continue to remind ourselves that the basic (public) query is *still* cached.
        {
          const result = await doFetch({ query: basicQuery });
          expectCacheHit('cached');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=10, public',
          );
        }

        // But what if we specifically ask to not read from the cache?
        {
          const result = await doFetch({
            query: basicQuery,
            headers: { 'no-read-from-cache': 'y' },
          });
          expect(result.data.cached).toBe('value:cached');
          expectCacheMiss('cached');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=10, public',
          );
        }

        // Let's expire the cache, and run again, not writing to the cache.
        advanceTimeBy(15 * 1000);
        {
          const result = await doFetch({
            query: basicQuery,
            headers: { 'no-write-to-cache': 'y' },
          });
          expect(result.data.cached).toBe('value:cached');
          expectCacheMiss('cached');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=10, public',
          );
        }

        // And now verify that in fact we did not write!
        {
          const result = await doFetch({
            query: basicQuery,
          });
          expect(result.data.cached).toBe('value:cached');
          expectCacheMiss('cached');
          expect(httpHeader(result, 'cache-control')).toBe(
            'max-age=10, public',
          );
        }
      });
    });
  });
}
