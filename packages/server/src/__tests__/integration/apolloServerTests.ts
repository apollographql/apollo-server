import http from 'http';
import { createHash } from '@apollo/utils.createhash';
import { URL } from 'url';
import express from 'express';
import bodyParser from 'body-parser';
import loglevel from 'loglevel';

import { Report, Trace } from '@apollo/usage-reporting-protobuf';

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLError,
  ValidationContext,
  FieldDefinitionNode,
  ResponsePath,
  DocumentNode,
  printSchema,
} from 'graphql';

// Note that by doing deep imports here we don't need to install React.
import { execute } from '@apollo/client/link/core';
import { createHttpLink } from '@apollo/client/link/http';
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';

import { createApolloFetch, ApolloFetch, ParsedResponse } from './apolloFetch';
import {
  AuthenticationError,
  UserInputError,
  gql,
  ApolloServerOptions,
  ApolloServer,
  GatewayInterface,
  GraphQLServiceConfig,
  ApolloServerPluginInlineTrace,
  ApolloServerPluginUsageReporting,
  ApolloServerPluginUsageReportingOptions,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloError,
  ApolloServerPluginLandingPageLocalDefault,
} from '../..';
import fetch from 'node-fetch';
import type {
  BaseContext,
  GraphQLRequestContextExecutionDidStart,
  PluginDefinition,
} from '../../externalTypes';

import resolvable, { Resolvable } from '@josephg/resolvable';
import type { AddressInfo } from 'net';
import request, { Response } from 'supertest';
import Keyv from 'keyv';
import type {
  CreateServerForIntegrationTests,
  CreateServerForIntegrationTestsOptions,
  CreateServerForIntegrationTestsResult,
} from '.';
import type { SchemaLoadOrUpdateCallback } from '../../types';

const quietLogger = loglevel.getLogger('quiet');
quietLogger.setLevel(loglevel.levels.WARN);

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

const makeGatewayMock = ({
  optionsSpy = (_options) => {},
  unsubscribeSpy = () => {},
}: {
  optionsSpy?: (_options: any) => void;
  unsubscribeSpy?: () => void;
} = {}) => {
  let resolution: GraphQLServiceConfig<BaseContext> | null = null;
  let rejection: Error | null = null;
  const eventuallyAssigned = {
    resolveLoad: (config: GraphQLServiceConfig<BaseContext>) => {
      resolution = config;
    },
    rejectLoad: (err: Error) => {
      rejection = err;
    },
    triggerSchemaChange: null as SchemaLoadOrUpdateCallback | null,
  };

  const listeners: SchemaLoadOrUpdateCallback[] = [];
  const mockedGateway: GatewayInterface<BaseContext> = {
    load: async (options) => {
      optionsSpy(options);
      // Make sure it's async
      await new Promise((res) => setImmediate(res));
      if (rejection) {
        throw rejection;
      }
      if (resolution) {
        listeners.forEach((cb) =>
          cb({
            apiSchema: resolution!.schema,
            coreSupergraphSdl: printSchema(resolution!.schema),
          }),
        );
        return resolution;
      }
      throw Error('Neither resolving nor rejecting?');
    },
    onSchemaLoadOrUpdate: (callback) => {
      listeners.push(callback);
      eventuallyAssigned.triggerSchemaChange = callback;
      return unsubscribeSpy;
    },
    stop: async () => {},
  };

  return { gateway: mockedGateway, triggers: eventuallyAssigned };
};

export function defineIntegrationTestSuiteApolloServerTests(
  createServerWithoutRememberingToCleanItUp: CreateServerForIntegrationTests,
  options: {
    serverlessFramework?: boolean;
  } = {},
) {
  describe('apolloServerTests.ts', () => {
    let serverToCleanUp: ApolloServer | null = null;

    async function createServer(
      config: ApolloServerOptions<BaseContext>,
      options?: CreateServerForIntegrationTestsOptions,
    ): Promise<CreateServerForIntegrationTestsResult> {
      const serverInfo = await createServerWithoutRememberingToCleanItUp(
        config,
        options,
      );
      serverToCleanUp = serverInfo.server;
      return serverInfo;
    }

    async function createServerAndGetUrl(
      config: ApolloServerOptions<BaseContext>,
      options?: CreateServerForIntegrationTestsOptions,
    ): Promise<string> {
      return (await createServer(config, options)).url;
    }

    // This will get called at the end of each test, and also tests
    // which want to test stop() behavior can call it themselves (so it's OK to call
    // it more than once).
    async function stopServer() {
      try {
        await serverToCleanUp?.stop();
      } finally {
        serverToCleanUp = null;
      }
    }
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

          const formatError = jest.fn((error) => {
            expect(error instanceof Error).toBe(true);
            return error;
          });

          const uri = await createServerAndGetUrl({
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
          const uri = await createServerAndGetUrl({
            schema,
            stopOnTerminationSignals: false,
            nodeEnv: '',
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({ query: INTROSPECTION_QUERY });
          expect(result.data).toBeDefined();
          expect(result.errors).toBeUndefined();
        });

        it('prevents introspection by default during production', async () => {
          const uri = await createServerAndGetUrl({
            schema,
            stopOnTerminationSignals: false,
            nodeEnv: 'production',
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({ query: INTROSPECTION_QUERY });
          expect(result.data).toBeUndefined();
          expect(result.errors).toBeDefined();
          expect(result.errors.length).toEqual(1);
          expect(result.errors[0].extensions.code).toEqual(
            'GRAPHQL_VALIDATION_FAILED',
          );
        });

        it('allows introspection to be enabled explicitly', async () => {
          const uri = await createServerAndGetUrl({
            schema,
            introspection: true,
            stopOnTerminationSignals: false,
            nodeEnv: 'production',
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({ query: INTROSPECTION_QUERY });
          expect(result.data).toBeDefined();
          expect(result.errors).toBeUndefined();
        });
      });

      describe('appropriate error for bad user input', () => {
        it('variable coercion errors', async () => {
          const uri = await createServerAndGetUrl({
            typeDefs: gql`
              type Query {
                hello(x: String): String
              }
            `,
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({
            query: `query ($x:String) {hello(x:$x)}`,
            variables: { x: 2 },
          });
          expect(result.data).toBeUndefined();
          expect(result.errors).toBeDefined();
          expect(result.errors[0].message).toMatch(
            /got invalid value 2; String cannot represent a non string value: 2/,
          );
          expect(result.errors[0].extensions.code).toBe('BAD_USER_INPUT');
        });

        it('catches required type variable error and returns UserInputError', async () => {
          const uri = await createServerAndGetUrl({
            typeDefs: gql`
              type Query {
                hello(x: String!): String
              }
            `,
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({
            query: `query ($x:String!) {hello(x:$x)}`,
          });
          expect(result.data).toBeUndefined();
          expect(result.errors).toBeDefined();
          expect(result.errors[0].message).toMatch(
            `Variable "$x" of required type "String!" was not provided.`,
          );
          expect(result.errors[0].extensions.code).toBe('BAD_USER_INPUT');
        });

        it('catches required List type variable error and returns UserInputError', async () => {
          const uri = await createServerAndGetUrl({
            typeDefs: gql`
              type Query {
                hello(x: [String]!): String
              }
            `,
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({
            query: `query ($x:[String]!) {hello(x:$x)}`,
          });
          expect(result.data).toBeUndefined();
          expect(result.errors).toBeDefined();
          expect(result.errors[0].message).toMatch(
            `Variable "$x" of required type "[String]!" was not provided.`,
          );
          expect(result.errors[0].extensions.code).toBe('BAD_USER_INPUT');
        });

        it('catches non-null type variable error and returns UserInputError', async () => {
          const uri = await createServerAndGetUrl({
            typeDefs: gql`
              type Query {
                hello(x: String!): String
              }
            `,
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({
            query: `query ($x:String!) {hello(x:$x)}`,
            variables: { x: null },
          });
          expect(result.data).toBeUndefined();
          expect(result.errors).toBeDefined();
          expect(result.errors[0].message).toMatch(
            `Variable "$x" of non-null type "String!" must not be null.`,
          );
          expect(result.errors[0].extensions.code).toBe('BAD_USER_INPUT');
        });

        it('catches non-null List type variable error and returns UserInputError', async () => {
          const uri = await createServerAndGetUrl({
            typeDefs: gql`
              type Query {
                hello(x: [String]!): String
              }
            `,
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({
            query: `query ($x:[String]!) {hello(x:$x)}`,
            variables: { x: null },
          });
          expect(result.data).toBeUndefined();
          expect(result.errors).toBeDefined();
          expect(result.errors[0].message).toMatch(
            `Variable "$x" of non-null type "[String]!" must not be null.`,
          );
          expect(result.errors[0].extensions.code).toBe('BAD_USER_INPUT');
        });

        it('catches List of non-null type variable error and returns UserInputError', async () => {
          const uri = await createServerAndGetUrl({
            typeDefs: gql`
              type Query {
                hello(x: [String!]!): String
              }
            `,
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({
            query: `query ($x:[String!]!) {hello(x:$x)}`,
            variables: { x: [null] },
          });
          expect(result.data).toBeUndefined();
          expect(result.errors).toBeDefined();
          expect(result.errors[0].message).toBe(
            `Variable "$x" got invalid value null at "x[0]"; ` +
              `Expected non-nullable type "String!" not to be null.`,
          );
          expect(result.errors[0].extensions.code).toBe('BAD_USER_INPUT');
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
          const uri = await createServerAndGetUrl({
            typeDefs,
            resolvers,
          });

          const apolloFetch = createApolloFetch({ uri });
          const result = await apolloFetch({ query: '{hello}' });

          expect(result.data).toEqual({ hello: 'hi' });
          expect(result.errors).toBeUndefined();
        });

        it("accepts a gateway's schema and calls its executor", async () => {
          const executor = jest.fn();
          executor.mockReturnValue(
            Promise.resolve({ data: { testString: 'hi - but federated!' } }),
          );

          const { gateway, triggers } = makeGatewayMock();

          triggers.resolveLoad({ schema, executor });

          const uri = await createServerAndGetUrl({
            gateway,
          });

          const apolloFetch = createApolloFetch({ uri });
          const result = await apolloFetch({ query: '{testString}' });

          expect(result.data).toEqual({ testString: 'hi - but federated!' });
          expect(result.errors).toBeUndefined();
          expect(executor).toHaveBeenCalled();
        });

        if (!options.serverlessFramework) {
          // You don't have to call start on serverless frameworks (or in
          // `apollo-server` which does not currently use this test suite).
          it('rejected load promise is thrown by server.start', async () => {
            const { gateway, triggers } = makeGatewayMock();

            const loadError = new Error(
              'load error which should be be thrown by start',
            );
            triggers.rejectLoad(loadError);

            await expect(
              createServerAndGetUrl({
                gateway,
              }),
            ).rejects.toThrowError(loadError);
          });
        }

        it('allows mocks as boolean', async () => {
          const typeDefs = gql`
            type Query {
              hello: String
            }
          `;
          const uri = await createServerAndGetUrl({
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
          const uri = await createServerAndGetUrl({
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
                last: 'Heinlein',
              }),
            },
          };
          const uri = await createServerAndGetUrl({
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
      });
    });

    describe('Plugins', () => {
      let apolloFetch: ApolloFetch;
      let apolloFetchResponse: ParsedResponse;
      let serverInstance: ApolloServer<BaseContext>;

      const setupApolloServerAndFetchPairForPlugins = async (
        plugins: PluginDefinition<BaseContext>[] = [],
      ) => {
        const { server, url } = await createServer(
          {
            typeDefs: gql`
              type Query {
                justAField: String
              }
            `,
            plugins,
          },
          { context: async () => ({ customContext: true }) },
        );

        serverInstance = server;

        apolloFetch = createApolloFetch({ uri: url })
          // Store the response so we can inspect it.
          .useAfter(({ response }, next) => {
            apolloFetchResponse = response;
            next();
          });
      };

      // TODO(AS4): Is this test still relevant now that we pass
      // the context explicitly to executeOperation?
      // Test for https://github.com/apollographql/apollo-server/issues/4170
      it('works when using executeOperation', async () => {
        const encounteredFields: ResponsePath[] = [];
        const encounteredContext: BaseContext[] = [];
        await setupApolloServerAndFetchPairForPlugins([
          {
            requestDidStart: async () => ({
              executionDidStart: async () => ({
                willResolveField({ info, contextValue }) {
                  encounteredFields.push(info.path);
                  encounteredContext.push(contextValue);
                },
              }),
            }),
          },
        ]);

        // The bug in 4170 (linked above) was occurring because of a failure
        // to clone context in `executeOperation` in the same way that occurs
        // in `runHttpQuery` prior to entering the request pipeline.  That
        // resulted in the inability to attach a symbol to the context because
        // the symbol already existed on the context.  Of course, a context
        // is only created after the first invocation, so we'll run this twice
        // to encounter the error where it was in the way when we tried to set
        // it the second time.  While we could have tested for the property
        // before assigning to it, that is not the contract we have with the
        // context, which should have been copied on `executeOperation` (which
        // is meant to be used by testing, currently).
        await serverInstance.executeOperation(
          {
            query: '{ justAField }',
          },
          { customContext: true },
        );
        await serverInstance.executeOperation(
          {
            query: '{ justAField }',
          },
          { customContext: true },
        );

        expect(encounteredFields).toStrictEqual([
          { key: 'justAField', prev: undefined, typename: 'Query' },
          { key: 'justAField', prev: undefined, typename: 'Query' },
        ]);

        // This bit is just to ensure that nobody removes `context` from the
        // `setupApolloServerAndFetchPairForPlugins` thinking it's unimportant.
        // When a custom context is not provided, a new one is initialized
        // on each request.
        expect(encounteredContext).toStrictEqual([
          expect.objectContaining({ customContext: true }),
          expect.objectContaining({ customContext: true }),
        ]);
      });

      it('returns correct status code for a normal operation', async () => {
        await setupApolloServerAndFetchPairForPlugins();

        const result = await apolloFetch({ query: '{ justAField }' });
        expect(result.errors).toBeUndefined();
        expect(apolloFetchResponse.status).toEqual(200);
      });

      it('allows setting a custom status code for an error', async () => {
        await setupApolloServerAndFetchPairForPlugins([
          {
            async requestDidStart() {
              return {
                async didResolveOperation() {
                  throw new Error('known_error');
                },
                async willSendResponse({
                  response: {
                    http,
                    result: { errors },
                  },
                }) {
                  if (errors![0].message === 'known_error') {
                    http!.statusCode = 403;
                  }
                },
              };
            },
          },
        ]);

        const result = await apolloFetch({ query: '{ justAField }' });
        expect(result.errors).toBeDefined();
        expect(apolloFetchResponse.status).toEqual(403);
      });

      it('preserves user-added "extensions" in the response when parsing errors occur', async () => {
        await setupApolloServerAndFetchPairForPlugins([
          {
            async requestDidStart() {
              return {
                async willSendResponse({ response }) {
                  response.result.extensions = { myExtension: true };
                },
              };
            },
          },
        ]);

        const result = await apolloFetch({ query: '{ 🦠' });
        expect(result.errors).toBeDefined();
        expect(result.extensions).toEqual(
          expect.objectContaining({
            myExtension: true,
          }),
        );
      });

      it('preserves user-added "extensions" in the response when validation errors occur', async () => {
        await setupApolloServerAndFetchPairForPlugins([
          {
            async requestDidStart() {
              return {
                async willSendResponse({ response }) {
                  response.result.extensions = { myExtension: true };
                },
              };
            },
          },
        ]);

        const result = await apolloFetch({
          query: '{ missingFieldWhichWillNotValidate }',
        });
        expect(result.errors).toBeDefined();
        expect(result.extensions).toEqual(
          expect.objectContaining({
            myExtension: true,
          }),
        );
      });
    });

    describe('formatError', () => {
      it('wraps thrown error from validation rules', async () => {
        const throwError = jest.fn(() => {
          throw new Error('nope');
        });

        const formatError = jest.fn((error) => {
          expect(error instanceof Error).toBe(true);
          expect(error.constructor.name).toEqual('Error');
          return error;
        });

        const uri = await createServerAndGetUrl({
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
        // https://npm.im/yup is a package that produces a particular type of
        // error that we test compatibility with. This test was first brought
        // with https://github.com/apollographql/apollo-server/pull/1288. We
        // used to use the actual `yup` package to generate the error, but we
        // don't need to actually bundle that dependency just to test
        // compatibility with that particular error shape.  To be honest, it's
        // not clear from the original PR which attribute of this error need be
        // mocked, but for the sake not not breaking anything, all of yup's
        // error properties have been reproduced here.
        const throwError = jest.fn(async () => {
          // Intentionally `any` because this is a custom Error class with
          // various custom properties (like `value` and `params`).
          const yuppieError: any = new Error('email must be a valid email');
          yuppieError.name = 'ValidationError';

          // Set `message` to enumerable, which `yup` does and `Error` doesn't.
          Object.defineProperty(yuppieError, 'message', {
            enumerable: true,
          });

          // Set other properties which `yup` sets.
          yuppieError.path = 'email';
          yuppieError.type = undefined;
          yuppieError.value = { email: 'invalid-email' };
          yuppieError.errors = ['email must be a valid email'];
          yuppieError.inner = [];
          yuppieError.params = {
            path: 'email',
            value: 'invalid-email',
            originalValue: 'invalid-email',
            label: undefined,
            regex: /@/,
          };

          // This stack is fake, but roughly what `yup` generates!
          yuppieError.stack = [
            'ValidationError: email must be a valid email',
            '    at createError (yup/lib/util/createValidation.js:64:35)',
            '    at yup/lib/util/createValidation.js:113:108',
            '    at process._tickCallback (internal/process/next_tick.js:68:7)',
          ].join('\n');

          throw yuppieError;
        });

        const formatError = jest.fn((error) => {
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

        const uri = await createServerAndGetUrl({
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
          includeStackTracesInErrorResponses: true,
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
      describe('for Apollo usage reporting', () => {
        let reportIngress: MockReportIngress;

        class MockReportIngress {
          private app: express.Application;
          private server?: http.Server;
          private reports: Report[] = [];
          public readonly promiseOfReports: Promise<Report[]>;

          constructor() {
            let reportResolver: (reports: Report[]) => void;
            this.promiseOfReports = new Promise<Report[]>((resolve) => {
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
              const report = Report.decode(req.body);
              this.reports.push(report);
              res.end();

              // Resolve any outstanding Promises with our new report data.
              reportResolver(this.reports);
            });
          }

          async listen(): Promise<http.Server> {
            return await new Promise((resolve) => {
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

            return new Promise((resolve) => {
              this.server?.close(() => resolve());
            });
          }

          getUrl(): string {
            if (!this.server) {
              throw new Error('must listen before getting URL');
            }
            const { family, address, port } =
              this.server.address() as AddressInfo;

            // @ts-expect-error until https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60042
            if (family !== 'IPv4' && family !== 4) {
              throw new Error(`The family was unexpectedly ${family}.`);
            }
            return new URL(`http://${address}:${port}`).toString();
          }
        }

        beforeEach(async () => {
          reportIngress = new MockReportIngress();
          return await reportIngress.listen();
        });

        afterEach((done) => {
          (reportIngress.stop() || Promise.resolve()).then(done);
        });

        describe('traces', () => {
          let throwError: jest.Mock;
          let apolloFetch: ApolloFetch;

          beforeEach(async () => {
            throwError = jest.fn();
          });

          const setupApolloServerAndFetchPair = async (
            usageReportingOptions: Partial<
              ApolloServerPluginUsageReportingOptions<any>
            > = {},
            constructorOptions: Partial<CreateServerForIntegrationTests> = {},
            plugins: PluginDefinition<BaseContext>[] = [],
          ) => {
            const uri = await createServerAndGetUrl({
              typeDefs: gql`
                enum CacheControlScope {
                  PUBLIC
                  PRIVATE
                }

                directive @cacheControl(
                  maxAge: Int
                  scope: CacheControlScope
                ) on FIELD_DEFINITION | OBJECT | INTERFACE

                type Query {
                  fieldWhichWillError: String
                  justAField: String @cacheControl(maxAge: 5, scope: PRIVATE)
                }
              `,
              resolvers: {
                Query: {
                  fieldWhichWillError: () => {
                    throwError();
                  },
                  justAField: () => 'a string',
                },
              },
              apollo: {
                key: 'service:my-app:secret',
                graphRef: 'my-app@current',
              },
              plugins: [
                ApolloServerPluginUsageReporting({
                  endpointUrl: reportIngress.getUrl(),
                  maxUncompressedReportSize: 1,
                  logger: quietLogger,
                  ...usageReportingOptions,
                }),
                ...plugins,
              ],
              includeStackTracesInErrorResponses: true,
              stopOnTerminationSignals: false,
              nodeEnv: '',
              ...constructorOptions,
            });

            apolloFetch = createApolloFetch({ uri });
          };

          it('cachePolicy', async () => {
            await setupApolloServerAndFetchPair();

            const result = await apolloFetch({
              query: `{justAField}`,
            });
            expect(result.errors).toBeUndefined();
            expect(result.data).toEqual({
              justAField: 'a string',
            });

            const reports = await reportIngress.promiseOfReports;
            expect(reports.length).toBe(1);
            const trace = Object.values(reports[0].tracesPerQuery)[0]
              .trace![0] as Trace;

            expect(trace.cachePolicy).toBeDefined();
            expect(trace.cachePolicy?.maxAgeNs).toBe(5e9);
            expect(trace.cachePolicy?.scope).toBe(
              Trace.CachePolicy.Scope.PRIVATE,
            );
          });

          it('does not expose stack', async () => {
            throwError.mockImplementationOnce(() => {
              throw new Error('how do I stack up?');
            });

            await setupApolloServerAndFetchPair();

            const result = await apolloFetch({
              query: `{fieldWhichWillError}`,
            });
            expect(result.data).toEqual({
              fieldWhichWillError: null,
            });
            expect(result.errors).toBeDefined();

            // The original error message should still be sent to the client.
            expect(result.errors[0].message).toEqual('how do I stack up?');
            expect(throwError).toHaveBeenCalledTimes(1);

            const reports = await reportIngress.promiseOfReports;
            expect(reports.length).toBe(1);
            const trace = Object.values(reports[0].tracesPerQuery)[0]
              .trace![0] as Trace;

            // There should be no error at the root, our error is a child.
            expect(trace.root!.error).toStrictEqual([]);

            // There should only be one child.
            expect(trace.root!.child!.length).toBe(1);

            // The error should not have the stack in it.
            expect(trace.root!.child![0].error![0]).not.toHaveProperty('stack');
            expect(
              JSON.parse(trace.root!.child![0].error![0].json!),
            ).not.toHaveProperty('stack');
          });

          it('sets the trace key to operationName when it is defined', async () => {
            await setupApolloServerAndFetchPair();

            const result = await apolloFetch({
              query: `query AnOperationName {justAField}`,
            });
            expect(result.data).toEqual({
              justAField: 'a string',
            });
            expect(result.errors).not.toBeDefined();

            const reports = await reportIngress.promiseOfReports;
            expect(reports.length).toBe(1);

            expect(Object.keys(reports[0].tracesPerQuery)[0]).toMatch(
              /^# AnOperationName\n/,
            );
          });

          it('sets the trace key to unknown operation for missing operation', async () => {
            await setupApolloServerAndFetchPair();

            await apolloFetch({
              query: `query notQ {justAField}`,
              operationName: 'q',
            });

            const reports = await reportIngress.promiseOfReports;
            expect(reports.length).toBe(1);

            expect(Object.keys(reports[0].tracesPerQuery)[0]).toBe(
              '## GraphQLUnknownOperationName\n',
            );
          });

          it('sets the trace key to parse failure when non-parsable gql', async () => {
            await setupApolloServerAndFetchPair();

            await apolloFetch({
              query: `{nonExistentField`,
            });

            const reports = await reportIngress.promiseOfReports;
            expect(reports.length).toBe(1);

            expect(Object.keys(reports[0].tracesPerQuery)[0]).toBe(
              '## GraphQLParseFailure\n',
            );
          });

          it('sets the trace key to validation failure when invalid operation', async () => {
            await setupApolloServerAndFetchPair();

            await apolloFetch({
              query: `{nonExistentField}`,
            });

            const reports = await reportIngress.promiseOfReports;
            expect(reports.length).toBe(1);

            expect(Object.keys(reports[0].tracesPerQuery)[0]).toBe(
              '## GraphQLValidationFailure\n',
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

            const reports = await reportIngress.promiseOfReports;
            expect(reports.length).toBe(1);

            expect(Object.keys(reports[0].tracesPerQuery)[0]).toMatch(/^# -\n/);
          });

          it("doesn't resort to query body signature on `didResolveOperation` error", async () => {
            await setupApolloServerAndFetchPair({}, {}, [
              {
                async requestDidStart() {
                  return {
                    didResolveOperation() {
                      throw new Error('known_error');
                    },
                  };
                },
              },
            ]);

            const result = await apolloFetch({
              query: `{ aliasedField: justAField }`,
            });

            expect(result.errors).toBeDefined();
            expect(result.errors[0].extensions).toBeDefined();
            expect(result.errors[0].message).toEqual('known_error');

            const reports = await reportIngress.promiseOfReports;
            expect(reports.length).toBe(1);

            expect(Object.keys(reports[0].tracesPerQuery)[0]).not.toEqual(
              '# -\n{ aliasedField: justAField }',
            );
          });

          it("doesn't internal server error on an APQ", async () => {
            await setupApolloServerAndFetchPair();

            const TEST_STRING_QUERY = `
              { onlyForThisApqTest${
                Math.random().toString().split('.')[1]
              }: justAField }
            `;
            const hash = createHash('sha256')
              .update(TEST_STRING_QUERY)
              .digest('hex');

            const result = await apolloFetch({
              extensions: {
                persistedQuery: {
                  version: 1,
                  sha256Hash: hash,
                },
              },
            });

            // Having a persisted query not found error is fine.
            expect(result.errors).toContainEqual(
              expect.objectContaining({
                extensions: expect.objectContaining({
                  code: 'PERSISTED_QUERY_NOT_FOUND',
                }),
              }),
            );

            // However, having an internal server error is not okay!
            expect(result.errors).not.toContainEqual(
              expect.objectContaining({
                extensions: expect.objectContaining({
                  code: 'INTERNAL_SERVER_ERROR',
                }),
              }),
            );
          });

          describe('error munging', () => {
            describe('rewriteError', () => {
              it('new error', async () => {
                throwError.mockImplementationOnce(() => {
                  throw new Error('rewriteError nope');
                });

                await setupApolloServerAndFetchPair({
                  rewriteError: () =>
                    new GraphQLError('rewritten as a new error'),
                });

                const result = await apolloFetch({
                  query: `{fieldWhichWillError}`,
                });
                expect(result.data).toEqual({
                  fieldWhichWillError: null,
                });
                expect(result.errors).toBeDefined();

                // The original error message should be sent to the client.
                expect(result.errors[0].message).toEqual('rewriteError nope');
                expect(throwError).toHaveBeenCalledTimes(1);

                const reports = await reportIngress.promiseOfReports;
                expect(reports.length).toBe(1);
                const trace = Object.values(reports[0].tracesPerQuery)[0]
                  .trace![0] as Trace;
                // There should be no error at the root, our error is a child.
                expect(trace.root!.error).toStrictEqual([]);

                // There should only be one child.
                expect(trace.root!.child!.length).toBe(1);

                // The child should maintain the path, but have its message
                // rewritten.
                expect(trace.root!.child![0].error).toMatchObject([
                  {
                    json: '{"message":"rewritten as a new error","locations":[{"line":1,"column":2}],"path":["fieldWhichWillError"]}',
                    message: 'rewritten as a new error',
                    location: [{ column: 2, line: 1 }],
                  },
                ]);
              });

              it('modified error', async () => {
                throwError.mockImplementationOnce(() => {
                  throw new Error('rewriteError mod nope');
                });

                await setupApolloServerAndFetchPair({
                  rewriteError: (err) => {
                    err.message = 'rewritten as a modified error';
                    return err;
                  },
                });

                const result = await apolloFetch({
                  query: `{fieldWhichWillError}`,
                });
                expect(result.data).toEqual({
                  fieldWhichWillError: null,
                });
                expect(result.errors).toBeDefined();
                expect(result.errors[0].message).toEqual(
                  'rewriteError mod nope',
                );
                expect(throwError).toHaveBeenCalledTimes(1);

                const reports = await reportIngress.promiseOfReports;
                expect(reports.length).toBe(1);
                const trace = Object.values(reports[0].tracesPerQuery)[0]
                  .trace![0] as Trace;
                // There should be no error at the root, our error is a child.
                expect(trace.root!.error).toStrictEqual([]);

                // There should only be one child.
                expect(trace.root!.child!.length).toBe(1);

                // The child should maintain the path, but have its message
                // rewritten.
                expect(trace.root!.child![0].error).toMatchObject([
                  {
                    json: '{"message":"rewritten as a modified error","locations":[{"line":1,"column":2}],"path":["fieldWhichWillError"]}',
                    message: 'rewritten as a modified error',
                    location: [{ column: 2, line: 1 }],
                  },
                ]);
              });

              it('nulled error', async () => {
                throwError.mockImplementationOnce(() => {
                  throw new Error('rewriteError null nope');
                });

                await setupApolloServerAndFetchPair({
                  rewriteError: () => null,
                });

                const result = await apolloFetch({
                  query: `{fieldWhichWillError}`,
                });
                expect(result.data).toEqual({
                  fieldWhichWillError: null,
                });
                expect(result.errors).toBeDefined();
                expect(result.errors[0].message).toEqual(
                  'rewriteError null nope',
                );
                expect(throwError).toHaveBeenCalledTimes(1);

                const reports = await reportIngress.promiseOfReports;
                expect(reports.length).toBe(1);
                const trace = Object.values(reports[0].tracesPerQuery)[0]
                  .trace![0] as Trace;

                // There should be no error at the root, our error is a child.
                expect(trace.root!.error).toStrictEqual([]);

                // There should only be one child.
                expect(trace.root!.child!.length).toBe(1);

                // There should be no error in the trace for this property!
                expect(trace.root!.child![0].error).toStrictEqual([]);
              });
            });

            it('undefined error', async () => {
              throwError.mockImplementationOnce(() => {
                throw new Error('rewriteError undefined whoops');
              });

              await setupApolloServerAndFetchPair({
                rewriteError: () => undefined as any,
              });

              const result = await apolloFetch({
                query: `{fieldWhichWillError}`,
              });
              expect(result.data).toEqual({
                fieldWhichWillError: null,
              });
              expect(result.errors).toBeDefined();
              expect(result.errors[0].message).toEqual(
                'rewriteError undefined whoops',
              );
              expect(throwError).toHaveBeenCalledTimes(1);

              const reports = await reportIngress.promiseOfReports;
              expect(reports.length).toBe(1);
              const trace = Object.values(reports[0].tracesPerQuery)[0]
                .trace![0] as Trace;

              // There should be no error at the root, our error is a child.
              expect(trace.root!.error).toStrictEqual([]);

              // There should only be one child.
              expect(trace.root!.child!.length).toBe(1);

              // The child should maintain the path, but have its message
              // rewritten.
              expect(trace.root!.child![0].error).toMatchObject([
                {
                  json: '{"message":"rewriteError undefined whoops","locations":[{"line":1,"column":2}],"path":["fieldWhichWillError"]}',
                  message: 'rewriteError undefined whoops',
                  location: [{ column: 2, line: 1 }],
                },
              ]);
            });
          });
        });
      });

      it('errors thrown in plugins call formatError and are wrapped', async () => {
        const pluginCalled = jest.fn(() => {
          throw new Error('nope');
        });
        const formatError = jest.fn((error) => {
          expect(error instanceof Error).toBe(true);
          // extension should be called before formatError
          expect(pluginCalled).toHaveBeenCalledTimes(1);
          error.message = 'masked';
          return error;
        });
        const uri = await createServerAndGetUrl({
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
          plugins: [
            {
              async requestDidStart() {
                return {
                  async willSendResponse() {
                    // formatError should be called after plugins
                    expect(formatError).not.toBeCalled();
                    pluginCalled();
                  },
                };
              },
            },
          ],
          formatError,
          includeStackTracesInErrorResponses: true,
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
              hello: (_parent: any, _args: any, context: any) => {
                expect(context).toEqual(Promise.resolve(uniqueContext));
                return 'hi';
              },
            },
          };
          const spy = jest.fn(async () => ({}));
          const uri = await createServerAndGetUrl(
            {
              typeDefs,
              resolvers,
            },
            {
              context: spy,
            },
          );

          const apolloFetch = createApolloFetch({ uri });

          expect(spy).not.toBeCalled();

          await apolloFetch({ query: '{hello}' });
          expect(spy).toHaveBeenCalledTimes(1);
          await apolloFetch({ query: '{hello}' });
          expect(spy).toHaveBeenCalledTimes(2);
        });

        describe('context cloning', () => {
          it('clones the context for request pipeline requests', async () => {
            const uniqueContext = { key: 'major' };
            const spy = jest.fn(() => 'hi');
            const typeDefs = gql`
              type Query {
                hello: String
              }
            `;
            const resolvers = {
              Query: {
                hello: (_parent: any, _args: any, context: any) => {
                  expect(context.key).toEqual('major');
                  context.key = 'minor';
                  return spy();
                },
              },
            };
            const uri = await createServerAndGetUrl(
              {
                typeDefs,
                resolvers,
              },
              {
                context: async () => uniqueContext,
              },
            );

            const apolloFetch = createApolloFetch({ uri });

            expect(spy).not.toBeCalled();

            await apolloFetch({ query: '{hello}' });
            expect(spy).toHaveBeenCalledTimes(1);
            await apolloFetch({ query: '{hello}' });
            expect(spy).toHaveBeenCalledTimes(2);
          });

          // https://github.com/apollographql/apollo-server/issues/4170
          it('for every request with executeOperation', async () => {
            const uniqueContext = { key: 'major' };
            const spy = jest.fn(() => 'hi');
            const typeDefs = gql`
              type Query {
                hello: String
              }
            `;
            const resolvers = {
              Query: {
                hello: (_parent: any, _args: any, context: any) => {
                  expect(context.key).toEqual('major');
                  context.key = 'minor';
                  return spy();
                },
              },
            };
            const { server } = await createServer({
              typeDefs,
              resolvers,
            });

            expect(spy).not.toBeCalled();

            await server.executeOperation({ query: '{hello}' }, uniqueContext);
            expect(spy).toHaveBeenCalledTimes(1);
            await server.executeOperation({ query: '{hello}' }, uniqueContext);
            expect(spy).toHaveBeenCalledTimes(2);
          });
        });

        describe('as a function', () => {
          it('can accept nothing and return an empty object', async () => {
            expect(
              await createServerAndGetUrl(
                {
                  typeDefs,
                  resolvers,
                },
                {
                  context: async () => ({}),
                },
              ),
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
                hello: (_parent: any, _args: any, context: any) => {
                  expect(context.key).toEqual('major');
                  return spy();
                },
              },
            };
            const uri = await createServerAndGetUrl(
              {
                typeDefs,
                resolvers,
              },
              {
                context: async () => uniqueContext,
              },
            );

            const apolloFetch = createApolloFetch({ uri });

            expect(spy).not.toBeCalled();
            await apolloFetch({ query: '{hello}' });
            expect(spy).toHaveBeenCalledTimes(1);
          });

          it('returns thrown context error as a valid graphql result', async () => {
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
            const uri = await createServerAndGetUrl(
              {
                typeDefs,
                resolvers,
                stopOnTerminationSignals: false,
                nodeEnv: '',
              },
              {
                context: async () => {
                  throw new AuthenticationError('valid result');
                },
              },
            );

            const apolloFetch = createApolloFetch({ uri });

            const result = await apolloFetch({ query: '{hello}' });
            expect(result.errors.length).toEqual(1);
            expect(result.data).toBeUndefined();

            const e = result.errors[0];
            expect(e.message).toMatch('valid result');
            expect(e.extensions).toBeDefined();
            expect(e.extensions.code).toEqual('UNAUTHENTICATED');
            expect(e.extensions.exception.stacktrace).toBeDefined();
          });
        });

        describe('as an object', () => {
          it('can be an empty object', async () => {
            expect(
              await createServerAndGetUrl(
                {
                  typeDefs,
                  resolvers,
                },
                {
                  context: async () => ({}),
                },
              ),
            ).not.toThrow;
          });

          it('can contain arbitrary values', async () => {
            expect(
              await createServerAndGetUrl(
                {
                  typeDefs,
                  resolvers,
                },
                {
                  context: async () => ({ value: 'arbitrary' }),
                },
              ),
            ).not.toThrow;
          });
        });
      });

      it('propagates error codes in production', async () => {
        const uri = await createServerAndGetUrl({
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
          stopOnTerminationSignals: false,
          nodeEnv: 'production',
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{fieldWhichWillError}` });
        expect(result.data).toBeDefined();
        expect(result.data).toEqual({ fieldWhichWillError: null });

        expect(result.errors).toBeDefined();
        expect(result.errors.length).toEqual(1);
        expect(result.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).toBeUndefined();
      });

      it('propagates error codes with null response in production', async () => {
        const uri = await createServerAndGetUrl({
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
          stopOnTerminationSignals: false,
          nodeEnv: 'production',
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{fieldWhichWillError}` });
        expect(result.data).toBeNull();

        expect(result.errors).toBeDefined();
        expect(result.errors.length).toEqual(1);
        expect(result.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).toBeUndefined();
      });

      it('propagates error codes in dev mode', async () => {
        const uri = await createServerAndGetUrl({
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
          stopOnTerminationSignals: false,
          nodeEnv: '',
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{fieldWhichWillError}` });
        expect(result.data).toBeDefined();
        expect(result.data).toEqual({ fieldWhichWillError: null });

        expect(result.errors).toBeDefined();
        expect(result.errors.length).toEqual(1);
        expect(result.errors[0].extensions.code).toEqual('UNAUTHENTICATED');
        expect(result.errors[0].extensions.exception).toBeDefined();
        expect(result.errors[0].extensions.exception.stacktrace).toBeDefined();
      });

      it('shows ApolloError extensions in extensions (only!)', async () => {
        const uri = await createServerAndGetUrl({
          typeDefs: gql`
            type Query {
              fieldWhichWillError: String
            }
          `,
          resolvers: {
            Query: {
              fieldWhichWillError: () => {
                throw new ApolloError('Some message', 'SOME_CODE', {
                  ext1: 'myExt',
                });
              },
            },
          },
          stopOnTerminationSignals: false,
          nodeEnv: 'development',
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{fieldWhichWillError}` });
        expect(result.data).toEqual({ fieldWhichWillError: null });

        expect(result.errors).toBeDefined();
        expect(result.errors.length).toEqual(1);
        expect(result.errors[0].message).toEqual('Some message');
        expect(result.errors[0].extensions.code).toEqual('SOME_CODE');
        expect(result.errors[0].extensions.ext1).toEqual('myExt');
        expect(result.errors[0].extensions.exception).toBeDefined();
        expect(result.errors[0].extensions.exception.ext1).toBeUndefined();
      });
    });

    describe('Persisted Queries', () => {
      let uri: string;
      const query = gql`
        ${TEST_STRING_QUERY}
      `;
      const hash = createHash('sha256').update(TEST_STRING_QUERY).digest('hex');
      const extensions = {
        persistedQuery: {
          version: 1,
          sha256Hash: hash,
        },
      };

      beforeEach(async () => {
        uri = await createServerAndGetUrl({
          schema,
          introspection: false,
          persistedQueries: {
            cache: new Map<string, string>() as any,
          },
        });
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
                version: 1,
                sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
              },
            },
            query: TEST_STRING_QUERY,
          } as any);
        } catch (e: any) {
          expect(e.response).toBeDefined();
          expect(e.response.status).toEqual(400);
          expect(e.response.raw).toMatch(/does not match query/);
        }
      });

      it('returns correct result for persisted query link', (done) => {
        const variables = { id: 1 };
        const link = createPersistedQueryLink({
          sha256: (query) => createHash('sha256').update(query).digest('hex'),
        }).concat(createHttpLink({ uri, fetch } as any));

        execute(link, { query, variables } as any).subscribe((result) => {
          expect(result.data).toEqual({ testString: 'test string' });
          done();
        }, done.fail);
      });

      it('returns correct result for persisted query link using get request', (done) => {
        const variables = { id: 1 };
        const link = createPersistedQueryLink({
          sha256: (query) => createHash('sha256').update(query).digest('hex'),
          useGETForHashedQueries: true,
        }).concat(createHttpLink({ uri, fetch } as any));

        execute(link, { query, variables } as any).subscribe((result) => {
          expect(result.data).toEqual({ testString: 'test string' });
          done();
        }, done.fail);
      });
    });

    describe('usage reporting', () => {
      async function makeFakeUsageReportingServer({
        status,
        waitWriteResponse = false,
      }: {
        status: number;
        waitWriteResponse?: boolean;
      }) {
        const writeResponsePromise = resolvable();
        const fakeUsageReportingServer = http.createServer(async (_, res) => {
          await writeResponsePromise;
          res.writeHead(status);
          res.end('Important text in the body');
        });
        await new Promise<void>((resolve) => {
          fakeUsageReportingServer.listen(0, '127.0.0.1', () => {
            resolve();
          });
        });

        async function closeServer() {
          await new Promise<void>((resolve) =>
            fakeUsageReportingServer.close(() => resolve()),
          );
        }

        const { family, address, port } =
          fakeUsageReportingServer.address() as AddressInfo;
        // @ts-expect-error until https://github.com/DefinitelyTyped/DefinitelyTyped/pull/60042
        if (family !== 'IPv4' && family !== 4) {
          throw new Error(`The family was unexpectedly ${family}.`);
        }

        const fakeUsageReportingUrl = `http://${address}:${port}`;

        if (!waitWriteResponse) {
          writeResponsePromise.resolve();
        }

        return {
          closeServer,
          fakeUsageReportingUrl,
          writeResponseResolve: () => writeResponsePromise.resolve(),
        };
      }

      describe('graphql server functions even when Apollo servers are down', () => {
        async function testWithStatus(
          status: number,
          expectedRequestCount: number,
        ) {
          const networkError = status === 0;

          const { closeServer, fakeUsageReportingUrl, writeResponseResolve } =
            await makeFakeUsageReportingServer({
              status,
              waitWriteResponse: true,
            });

          try {
            // To simulate a network error, we create and close the server.
            // This lets us still generate a port that is hopefully unused.
            if (networkError) {
              await closeServer();
            }

            let requestCount = 0;
            const requestAgent = new http.Agent({ keepAlive: false });
            const realCreateConnection = (requestAgent as any).createConnection;
            (requestAgent as any).createConnection = function () {
              requestCount++;
              return realCreateConnection.apply(this, arguments);
            };

            let reportErrorPromiseResolve: (error: Error) => void;
            const reportErrorPromise = new Promise<Error>(
              (resolve) => (reportErrorPromiseResolve = resolve),
            );
            const uri = await createServerAndGetUrl({
              typeDefs: gql`
                type Query {
                  something: String!
                }
              `,
              resolvers: { Query: { something: () => 'hello' } },
              apollo: {
                key: 'service:my-app:secret',
                graphRef: 'my-app@current',
              },
              plugins: [
                ApolloServerPluginUsageReporting({
                  endpointUrl: fakeUsageReportingUrl,
                  reportIntervalMs: 1,
                  maxAttempts: 3,
                  fetcher: (url, options) =>
                    fetch(url, { ...options, agent: requestAgent }),
                  logger: quietLogger,
                  reportErrorFunction(error: Error) {
                    reportErrorPromiseResolve(error);
                  },
                }),
              ],
            });

            const apolloFetch = createApolloFetch({ uri });

            // Run a GraphQL query. Ensure that it returns successfully even
            // though reporting is going to fail. (Note that reporting can't
            // actually have failed yet (except in the network-error case)
            // because we haven't let writeResponsePromise resolve.)
            const result = await apolloFetch({
              query: `{ something }`,
            });
            expect(result.data.something).toBe('hello');

            if (!networkError) {
              // Allow reporting to return its response (for every retry).
              writeResponseResolve();
            }

            // Make sure we can get the error from reporting.
            const sendingError = await reportErrorPromise;
            expect(sendingError).toBeTruthy();
            if (networkError) {
              expect(sendingError.message).toContain(
                'Error sending report to Apollo servers',
              );
              expect(sendingError.message).toContain('ECONNREFUSED');
            } else {
              expect(sendingError.message).toBe(
                `Error sending report to Apollo servers: HTTP status ${status}, Important text in the body`,
              );
            }
            expect(requestCount).toBe(expectedRequestCount);
          } finally {
            if (!networkError) {
              await closeServer();
            }
          }
        }

        it('with retryable error', async () => {
          await testWithStatus(500, 3);
        });
        it('with network error', async () => {
          await testWithStatus(0, 3);
        });
        it('with non-retryable error', async () => {
          await testWithStatus(400, 1);
        });
      });
    });

    describe('Federated tracing', () => {
      // Enable federated tracing by pretending to be federated.
      const federationTypeDefs = gql`
        type _Service {
          sdl: String
        }
      `;

      const baseTypeDefs = gql`
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
          error: String
        }
      `;

      const allTypeDefs = [federationTypeDefs, baseTypeDefs];

      const resolvers = {
        Query: {
          books: () =>
            new Promise((resolve) =>
              setTimeout(() => resolve([{ title: 'H', author: 'J' }]), 10),
            ),
          movies: () =>
            new Promise((resolve) =>
              setTimeout(() => resolve([{ title: 'H' }]), 12),
            ),
          error: () => {
            throw new GraphQLError('It broke');
          },
        },
      };

      function createApolloFetchAsIfFromGateway(uri: string): ApolloFetch {
        return createApolloFetch({ uri }).use(({ options }, next) => {
          options.headers = { 'apollo-federation-include-trace': 'ftv1' };
          next();
        });
      }

      it("doesn't include federated trace without the special header", async () => {
        const uri = await createServerAndGetUrl({
          typeDefs: allTypeDefs,
          resolvers,
          logger: quietLogger,
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({
          query: `{ books { title author } }`,
        });

        expect(result.extensions).toBeUndefined();
      });

      it("doesn't include federated trace without _Service in the schema", async () => {
        const uri = await createServerAndGetUrl({
          typeDefs: baseTypeDefs,
          resolvers,
        });

        const apolloFetch = createApolloFetchAsIfFromGateway(uri);

        const result = await apolloFetch({
          query: `{ books { title author } }`,
        });

        expect(result.extensions).toBeUndefined();
      });

      it('reports a total duration that is longer than the duration of its resolvers', async () => {
        const uri = await createServerAndGetUrl({
          typeDefs: allTypeDefs,
          resolvers,
          logger: quietLogger,
        });

        const apolloFetch = createApolloFetchAsIfFromGateway(uri);

        const result = await apolloFetch({
          query: `{ books { title author } }`,
        });

        const ftv1: string = result.extensions.ftv1;

        expect(ftv1).toBeTruthy();
        const encoded = Buffer.from(ftv1, 'base64');
        const trace = Trace.decode(encoded);

        let earliestStartOffset = Infinity;
        let latestEndOffset = -Infinity;

        function walk(node: Trace.Node) {
          if (node.startTime !== 0 && node.endTime !== 0) {
            earliestStartOffset = Math.min(earliestStartOffset, node.startTime);
            latestEndOffset = Math.max(latestEndOffset, node.endTime);
          }
          node.child.forEach((n) => walk(n as Trace.Node));
        }

        walk(trace.root as Trace.Node);
        expect(earliestStartOffset).toBeLessThan(Infinity);
        expect(latestEndOffset).toBeGreaterThan(-Infinity);
        const resolverDuration = latestEndOffset - earliestStartOffset;
        expect(resolverDuration).toBeGreaterThan(0);
        expect(trace.durationNs).toBeGreaterThanOrEqual(resolverDuration);

        expect(trace.startTime!.seconds).toBeLessThanOrEqual(
          trace.endTime!.seconds!,
        );
        if (trace.startTime!.seconds === trace.endTime!.seconds) {
          expect(trace.startTime!.nanos).toBeLessThanOrEqual(
            trace.endTime!.nanos!,
          );
        }
      });

      it('includes errors in federated trace', async () => {
        const uri = await createServerAndGetUrl({
          typeDefs: allTypeDefs,
          resolvers,
          formatError(err) {
            err.message = `Formatted: ${err.message}`;
            return err;
          },
          plugins: [
            ApolloServerPluginInlineTrace({
              rewriteError(err) {
                err.message = `Rewritten for Usage Reporting: ${err.message}`;
                return err;
              },
            }),
          ],
        });

        const apolloFetch = createApolloFetchAsIfFromGateway(uri);

        const result = await apolloFetch({
          query: `{ error }`,
        });

        expect(result.data).toStrictEqual({ error: null });
        expect(result.errors).toBeTruthy();
        expect(result.errors.length).toBe(1);
        expect(result.errors[0].message).toBe('Formatted: It broke');

        const ftv1: string = result.extensions.ftv1;

        expect(ftv1).toBeTruthy();
        const encoded = Buffer.from(ftv1, 'base64');
        const trace = Trace.decode(encoded);
        expect(trace.root!.child![0].error![0].message).toBe(
          'Rewritten for Usage Reporting: It broke',
        );
      });
    });

    describe('Gateway', () => {
      it.each([true, false])(
        'receives schema updates from the gateway (with document store: %s)',
        async (withDocumentStore: boolean) => {
          const makeQueryTypeWithField = (fieldName: string) =>
            new GraphQLSchema({
              query: new GraphQLObjectType({
                name: 'QueryType',
                fields: {
                  [fieldName]: {
                    type: GraphQLString,
                  },
                },
              }),
            });

          const executor = (req: GraphQLRequestContextExecutionDidStart<any>) =>
            (req.source as string).match(/1/)
              ? Promise.resolve({ data: { testString1: 'hello' } })
              : Promise.resolve({ data: { testString2: 'aloha' } });

          const { gateway, triggers } = makeGatewayMock();

          triggers.resolveLoad({
            schema: makeQueryTypeWithField('testString1'),
            executor,
          });

          const uri = await createServerAndGetUrl({
            gateway,
            documentStore: withDocumentStore
              ? new Keyv<DocumentNode>()
              : undefined,
          });

          const apolloFetch = createApolloFetch({ uri });
          const result1 = await apolloFetch({ query: '{testString1}' });

          expect(result1.data).toEqual({ testString1: 'hello' });
          expect(result1.errors).toBeUndefined();

          triggers.triggerSchemaChange!({
            apiSchema: makeQueryTypeWithField('testString2'),
            coreSupergraphSdl: 'type Query { testString2: String }',
          });

          const result2 = await apolloFetch({ query: '{testString2}' });
          expect(result2.data).toEqual({ testString2: 'aloha' });
          expect(result2.errors).toBeUndefined();

          const invalidResult = await apolloFetch({ query: '{testString1}' });
          expect(invalidResult.data).toBeUndefined();
          expect(invalidResult.errors).toEqual([
            {
              extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
              message:
                'Cannot query field "testString1" on type "QueryType". Did you mean "testString2"?',
            },
          ]);
        },
      );

      it('passes apollo data to the gateway', async () => {
        const optionsSpy = jest.fn();

        const { gateway, triggers } = makeGatewayMock({ optionsSpy });
        triggers.resolveLoad({ schema, executor: async () => ({}) });
        await createServerAndGetUrl(
          {
            gateway,
            apollo: {
              key: 'service:tester:1234abc',
              graphRef: 'tester@staging',
            },
            logger: quietLogger,
          },
          { noRequestsMade: true },
        );

        expect(optionsSpy).toHaveBeenLastCalledWith({
          apollo: {
            key: 'service:tester:1234abc',
            keyHash:
              '0ca858e7fe8cffc01c5f1db917d2463b348b50d267427e54c1c8c99e557b242f4145930b949905ec430642467613610e471c40bb7a251b1e2248c399bb0498c4',
            graphRef: 'tester@staging',
          },
        });
      });

      it('unsubscribes from schema update on close', async () => {
        const unsubscribeSpy = jest.fn();
        const { gateway, triggers } = makeGatewayMock({ unsubscribeSpy });
        triggers.resolveLoad({ schema, executor: async () => ({}) });
        const server = (await createServer({ gateway })).server;
        if (options.serverlessFramework) {
          // Serverless frameworks execute ApolloServer.start() in a dangling
          // promise in the server constructor. To ensure that the server has
          // started in the case of serverless, we make a query against it,
          // which forces us to wait until after start.
          //
          // This is also required because ApolloServer.stop() was not designed
          // to be executed concurrently with start(). (Without this query,
          // stop() may be executed before the gateway schema update
          // unsubscriber is registered for disposal, causing the test to fail.)
          await server.executeOperation({ query: '{__typename}' });
        }
        expect(unsubscribeSpy).not.toHaveBeenCalled();
        await stopServer();
        expect(unsubscribeSpy).toHaveBeenCalled();
      });

      it('waits until gateway has resolved a schema to respond to queries', async () => {
        let startPromiseResolver: any, endPromiseResolver: any;
        const startPromise = new Promise((res) => {
          startPromiseResolver = res;
        });
        const endPromise = new Promise((res) => {
          endPromiseResolver = res;
        });
        const executor = async () => {
          startPromiseResolver();
          await endPromise;
          return { data: { testString: 'hi - but federated!' } };
        };

        const { gateway, triggers } = makeGatewayMock();

        triggers.resolveLoad({ schema, executor });
        const uri = await createServerAndGetUrl({
          gateway,
        });
        const fetchComplete = jest.fn();
        const apolloFetch = createApolloFetch({ uri });
        const result = apolloFetch({ query: '{testString}' }).then((result) => {
          fetchComplete(result);
          return result;
        });
        expect(fetchComplete).not.toHaveBeenCalled();
        await startPromise;
        expect(fetchComplete).not.toHaveBeenCalled();
        endPromiseResolver();
        const resolved = await result;
        expect(fetchComplete).toHaveBeenCalled();
        expect(resolved.data).toEqual({ testString: 'hi - but federated!' });
        expect(resolved.errors).toBeUndefined();
      });

      it('can serve multiple active schemas simultaneously during a schema rollover', async () => {
        function getSchemaUpdateWithField(fieldName: string) {
          return {
            apiSchema: new GraphQLSchema({
              query: new GraphQLObjectType({
                name: 'QueryType',
                fields: {
                  [fieldName]: {
                    type: GraphQLString,
                  },
                },
              }),
            }),
            coreSupergraphSdl: `type Query { ${fieldName}: String }`,
          };
        }

        const executorData: Record<
          string,
          {
            startPromise: Resolvable<void>;
            endPromise: Resolvable<void>;
            i: number;
          }
        > = Object.create(null);
        [1, 2, 3].forEach((i) => {
          const query = `{testString${i}}`;
          executorData[query] = {
            startPromise: resolvable(),
            endPromise: resolvable(),
            i,
          };
        });

        const executor = async (
          req: GraphQLRequestContextExecutionDidStart<any>,
        ) => {
          const source = req.source as string;
          const { startPromise, endPromise, i } = executorData[source];
          startPromise.resolve();
          await endPromise;
          return { data: { [`testString${i}`]: `${i}` } };
        };

        const { gateway, triggers } = makeGatewayMock();

        triggers.resolveLoad({
          schema: getSchemaUpdateWithField('testString1').apiSchema,
          executor,
        });

        const { url, server } = await createServer({ gateway });

        const apolloFetch = createApolloFetch({ uri: url });
        const result1 = apolloFetch({ query: '{testString1}' });
        await executorData['{testString1}'].startPromise;
        triggers.triggerSchemaChange!(getSchemaUpdateWithField('testString2'));
        // Hacky, but: executeOperation awaits schemaDerivedData, so when it
        // finishes we know the new schema is loaded.
        await server.executeOperation({ query: '{__typename}' });
        const result2 = apolloFetch({ query: '{testString2}' });
        await executorData['{testString2}'].startPromise;
        triggers.triggerSchemaChange!(getSchemaUpdateWithField('testString3'));
        await server.executeOperation({ query: '{__typename}' });
        const result3 = apolloFetch({ query: '{testString3}' });
        await executorData['{testString3}'].startPromise;
        executorData['{testString3}'].endPromise.resolve();
        executorData['{testString1}'].endPromise.resolve();
        executorData['{testString2}'].endPromise.resolve();

        await Promise.all([result1, result2, result3]).then(([v1, v2, v3]) => {
          expect(v1.errors).toBeUndefined();
          expect(v2.errors).toBeUndefined();
          expect(v3.errors).toBeUndefined();
          expect(v1.data).toEqual({ testString1: '1' });
          expect(v2.data).toEqual({ testString2: '2' });
          expect(v3.data).toEqual({ testString3: '3' });
        });
      });
    });

    describe('renderLandingPage', () => {
      let url: string;

      function getWithoutAcceptHeader() {
        return request(url).get('/');
      }

      function get(accept: string = 'text/html') {
        return getWithoutAcceptHeader().set('accept', accept);
      }

      function makeServerConfig(
        htmls: string[],
      ): ApolloServerOptions<BaseContext> {
        return {
          typeDefs: 'type Query {x: ID}',
          plugins: [
            ...htmls.map((html) => ({
              async serverWillStart() {
                return {
                  async renderLandingPage() {
                    return {
                      html,
                    };
                  },
                };
              },
            })),
          ],
          // dev mode, so we get the local landing page
          nodeEnv: '',
        };
      }

      // Pass this to expect in the "not LandingPage, you are trying to do GraphQL
      // but didn't send a query" case, which we should maybe change to
      // something nicer than an ugly 400.
      const serveNoLandingPage = 400;

      it('defaults to LocalDefault', async () => {
        url = (await createServer(makeServerConfig([]))).url;
        await get().expect(
          200,
          /apollo-server-landing-page.cdn.apollographql.com\/_latest.*isProd[^t]+false/s,
        );
      });

      it('can specify version for LocalDefault', async () => {
        url = (
          await createServer({
            typeDefs: 'type Query {x: ID}',
            plugins: [
              ApolloServerPluginLandingPageLocalDefault({ version: 'abcdef' }),
            ],
          })
        ).url;
        await get().expect(
          200,
          /apollo-server-landing-page.cdn.apollographql.com\/abcdef.*isProd[^t]+false/s,
        );
      });

      it('can install playground with specific version', async () => {
        url = (
          await createServer({
            typeDefs: 'type Query {x: ID}',
            plugins: [
              ApolloServerPluginLandingPageGraphQLPlayground({
                version: '9.8.7',
              }),
            ],
          })
        ).url;
        await get()
          .expect(/Playground/)
          .expect(/react@9\.8\.7/);
      });

      it('can be disabled', async () => {
        url = (
          await createServer({
            typeDefs: 'type Query {x: ID}',
            plugins: [ApolloServerPluginLandingPageDisabled()],
          })
        ).url;
        await get().expect(serveNoLandingPage);
      });

      describe('basic functionality', () => {
        beforeEach(async () => {
          url = (await createServer(makeServerConfig(['BAZ']))).url;
        });

        it('basic GET works', async () => {
          await get().expect(200, 'BAZ');
        });
        it('basic GET works with more complex header', async () => {
          // This is what Chrome happens to be sending today.
          await get(
            // cspell:disable-next-line
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
          ).expect(200, 'BAZ');
        });
        it('no landing page with application/json', async () => {
          await get('application/json').expect(serveNoLandingPage);
        });
        it('no landing page with */*', async () => {
          await get('*/*').expect(serveNoLandingPage);
        });
        it('needs the header', async () => {
          await getWithoutAcceptHeader().expect(serveNoLandingPage);
        });
      });

      // Serverless frameworks don't have startup errors because they don't
      // have a startup phase.
      options.serverlessFramework ||
        describe('startup errors', () => {
          it('only one plugin can implement renderLandingPage', async () => {
            await expect(
              createServerAndGetUrl(makeServerConfig(['x', 'y'])),
            ).rejects.toThrow(
              'Only one plugin can implement renderLandingPage.',
            );
          });
        });
    });

    describe('CSRF prevention', () => {
      async function makeServer(
        csrfPrevention?: ApolloServerOptions<BaseContext>['csrfPrevention'],
      ): Promise<string> {
        return (
          await createServer({
            typeDefs: 'type Query { x: ID }',
            resolvers: { Query: { x: () => 'foo' } },
            csrfPrevention,
          })
        ).url;
      }
      const operation = { query: '{x}' };
      const response = { data: { x: 'foo' } };

      function succeeds(res: Response) {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(response);
      }

      function blocked(res: Response) {
        expect(res.status).toBe(400);
        expect(res.text).toMatch(/This operation has been blocked/);
      }

      it('default', async () => {
        const url = await makeServer();

        // Normal POSTs work.
        succeeds(
          await request(url)
            .post('/')
            .set('content-type', 'application/json')
            .send(JSON.stringify(operation)),
        );

        // POST without content-type is blocked.
        blocked(await request(url).post('/').send(JSON.stringify(operation)));

        // POST with text/plain is blocked.
        blocked(
          await request(url)
            .post('/')
            .set('content-type', 'text/plain')
            .send(JSON.stringify(operation)),
        );

        // GET without content-type is blocked.
        blocked(await request(url).get('/').query(operation));

        // GET with json content-type succeeds (this is what Apollo Client Web
        // does).
        succeeds(
          await request(url)
            .get('/')
            .set('content-type', 'application/json')
            .query(operation),
        );

        // GET with text/plain content-type is blocked (because this is not
        // preflighted).
        blocked(
          await request(url)
            .get('/')
            .set('content-type', 'text/plain')
            .query(operation),
        );

        // GET with an invalid content-type (no slash) actually succeeds, since
        // this will be preflighted, although it would be reasonable if it
        // didn't.
        succeeds(
          await request(url)
            .get('/')
            .set('content-type', 'invalid')
            .query(operation),
        );

        // Adding parameters to the content-type and spaces doesn't stop it from
        // being blocked.
        blocked(
          await request(url)
            .get('/')
            .set('content-type', '    text/plain   ; charset=utf-8')
            .query(operation),
        );

        // But we can do the space and charset around json and have that be fine.
        succeeds(
          await request(url)
            .get('/')
            .set('content-type', '    application/json   ; charset=utf-8')
            .query(operation),
        );

        // This header set by iOS and Kotlin lets us bypass the check (and would
        // cause a preflight in the browser).
        succeeds(
          await request(url)
            .get('/')
            .set('x-apollo-operation-name', 'foo')
            .query(operation),
        );

        // This header that you can set manually lets us bypass the check (and
        // would cause a preflight in the browser).
        succeeds(
          await request(url)
            .get('/')
            .set('apollo-require-preflight', 'bar')
            .query(operation),
        );

        // But this random header is not good enough.
        blocked(
          await request(url)
            .get('/')
            .set('please-preflight-me', 'bar')
            .query(operation),
        );
      });

      it('csrfPrevention: {requestHeaders}', async () => {
        const url = await makeServer({ requestHeaders: ['xxx', 'yyy'] });

        // GET without content-type is blocked.
        blocked(await request(url).get('/').query(operation));

        // The headers we configured work, separately and together.
        succeeds(
          await request(url).get('/').set('xxx', 'foo').query(operation),
        );
        succeeds(
          await request(url).get('/').set('yyy', 'bar').query(operation),
        );
        succeeds(
          await request(url)
            .get('/')
            .set('xxx', 'foo')
            .set('yyy', 'bar')
            .query(operation),
        );

        // But this default header doesn't work.
        blocked(
          await request(url)
            .get('/')
            .set('apollo-require-preflight', 'bar')
            .query(operation),
        );
      });

      it('csrfPrevention: false', async () => {
        const url = await makeServer(false);

        // GET without content-type succeeds when CSRF prevention is disabled.
        succeeds(await request(url).get('/').query(operation));
      });
    });
  });
}
