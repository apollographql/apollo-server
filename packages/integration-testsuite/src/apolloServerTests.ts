import http from 'http';
import { createHash } from '@apollo/utils.createhash';
import express from 'express';
import bodyParser from 'body-parser';
import loglevel from 'loglevel';

import { Report, Trace } from '@apollo/usage-reporting-protobuf';

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLError,
  type ValidationContext,
  type DocumentNode,
  printSchema,
  type FieldNode,
  type GraphQLFormattedError,
  GraphQLScalarType,
} from 'graphql';

// Note that by doing deep imports here we don't need to install React.
import { execute } from '@apollo/client/link/core';
import { createHttpLink } from '@apollo/client/link/http';
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';

import {
  createApolloFetch,
  type ApolloFetch,
  type ParsedResponse,
} from './apolloFetch.js';
import {
  type ApolloServerOptions,
  ApolloServer,
  type BaseContext,
  type ApolloServerPlugin,
  HeaderMap,
} from '@apollo/server';
import fetch, { type Headers } from 'node-fetch';

import resolvable, { type Resolvable } from '@josephg/resolvable';
import type { AddressInfo } from 'net';
import request, { type Response } from 'supertest';
import { InMemoryLRUCache } from '@apollo/utils.keyvaluecache';
import type {
  CreateServerForIntegrationTests,
  CreateServerForIntegrationTestsOptions,
  CreateServerForIntegrationTestsResult,
} from '.';
import gql from 'graphql-tag';
import {
  type ApolloServerPluginUsageReportingOptions,
  ApolloServerPluginUsageReporting,
} from '@apollo/server/plugin/usageReporting';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginUsageReportingDisabled,
} from '@apollo/server/plugin/disabled';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloServerPluginLandingPageGraphQLPlayground } from '@apollo/server-plugin-landing-page-graphql-playground';
import {
  jest,
  describe,
  expect,
  beforeEach,
  afterEach,
  it,
} from '@jest/globals';
import type { Mock } from 'jest-mock';
import type {
  GatewayExecutor,
  GatewayGraphQLRequestContext,
  GatewayInterface,
  GatewaySchemaLoadOrUpdateCallback,
} from '@apollo/server-gateway-interface';
import {
  ApolloServerErrorCode,
  ApolloServerValidationErrorCode,
} from '@apollo/server/errors';

const quietLogger = loglevel.getLogger('quiet');
function mockLogger() {
  return {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

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
  executor,
  schema,
  optionsSpy = (_options) => {},
  unsubscribeSpy = () => {},
}: {
  executor: GatewayExecutor | null;
  schema: GraphQLSchema;
  optionsSpy?: (_options: any) => void;
  unsubscribeSpy?: () => void;
}) => {
  const triggers = {
    // This gets updated later, when ApolloServer calls gateway.load().
    triggerSchemaChange: null as GatewaySchemaLoadOrUpdateCallback | null,
  };

  const listeners: GatewaySchemaLoadOrUpdateCallback[] = [];
  const mockedGateway: GatewayInterface = {
    load: async (options) => {
      optionsSpy(options);
      // Make sure it's async
      await new Promise((res) => setImmediate(res));
      listeners.forEach((cb) =>
        cb({
          apiSchema: schema,
          coreSupergraphSdl: printSchema(schema),
        }),
      );
      return { executor };
    },
    onSchemaLoadOrUpdate: (callback) => {
      listeners.push(callback);
      triggers.triggerSchemaChange = callback;
      return unsubscribeSpy;
    },
    stop: async () => {},
  };

  return { gateway: mockedGateway, triggers };
};

export function defineIntegrationTestSuiteApolloServerTests(
  createServerWithoutRememberingToCleanItUp: CreateServerForIntegrationTests,
  options: {
    // Serverless integrations tell us that they start in the background,
    // which affects some tests.
    serverIsStartedInBackground?: boolean;
  } = {},
) {
  describe('apolloServerTests.ts', () => {
    let serverToCleanUp: ApolloServer | null = null;
    let extraCleanup: (() => Promise<void>) | null = null;

    async function createServer(
      config: ApolloServerOptions<BaseContext>,
      options?: CreateServerForIntegrationTestsOptions,
    ): Promise<CreateServerForIntegrationTestsResult> {
      const serverInfo = await createServerWithoutRememberingToCleanItUp(
        config,
        options,
      );
      serverToCleanUp = serverInfo.server;
      extraCleanup = serverInfo.extraCleanup ?? null;
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
        await extraCleanup?.();
      } finally {
        serverToCleanUp = null;
        extraCleanup = null;
      }
    }
    afterEach(stopServer);

    // If this test fails, it means your `@apollo/server` and
    // `@apollo/server-integration-testsuite` versions are out of sync. Please
    // update both packages to the same version.
    it('lockstep versioning of @apollo/server and @apollo/server-integration-testsuite', async () => {
      const server = (await createServer({ schema })).server;
      if (!(server instanceof ApolloServer)) {
        throw Error(
          'Have you installed @apollo/server and @apollo/server-integration-testsuite with non-matching versions?',
        );
      }
    });

    describe('constructor', () => {
      describe('validation rules', () => {
        it('accepts additional rules', async () => {
          const NoTestString = (context: ValidationContext) => ({
            Field(node: FieldNode) {
              if (node.name.value === 'testString') {
                context.reportError(
                  new GraphQLError('Not allowed to use', { nodes: [node] }),
                );
              }
            },
          });

          const formatError = jest.fn((error: GraphQLFormattedError) => {
            expect(error).toMatchObject({ message: expect.any(String) });
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
          expect(introspectionResult.errors[0].extensions?.code).toEqual(
            ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
          );
          expect(
            introspectionResult.errors[0].extensions.validationErrorCode,
          ).toEqual(ApolloServerValidationErrorCode.INTROSPECTION_DISABLED);
          expect(formatError.mock.calls.length).toEqual(
            introspectionResult.errors.length,
          );

          const result = await apolloFetch({ query: TEST_STRING_QUERY });
          expect(result.data).toBeUndefined();
          expect(result.errors).toBeDefined();
          expect(result.errors[0].message).toMatch(/Not allowed/);
          expect(result.errors[0].extensions?.code).toEqual(
            ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
          );
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
            ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED,
          );
          expect(result.errors[0].extensions.validationErrorCode).toEqual(
            ApolloServerValidationErrorCode.INTROSPECTION_DISABLED,
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

        it('catches custom scalar parseValue and returns BAD_USER_INPUT', async () => {
          const uri = await createServerAndGetUrl({
            typeDefs: gql`
              scalar CustomScalar
              type Query {
                hello(x: CustomScalar): String
              }
            `,
            resolvers: {
              CustomScalar: new GraphQLScalarType({
                name: 'CustomScalar',
                parseValue() {
                  // Work-around for https://github.com/graphql/graphql-js/pull/3785
                  // Once that's fixed, we can just directly throw this error.
                  const e = new GraphQLError('Something bad happened', {
                    extensions: { custom: 'foo' },
                  });
                  throw new GraphQLError(e.message, { originalError: e });
                },
              }),
            },
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({
            query: `query ($x:CustomScalar) {hello(x:$x)}`,
            variables: { x: 'foo' },
          });
          expect(result).toMatchInlineSnapshot(`
            {
              "errors": [
                {
                  "extensions": {
                    "code": "BAD_USER_INPUT",
                    "custom": "foo",
                  },
                  "locations": [
                    {
                      "column": 8,
                      "line": 1,
                    },
                  ],
                  "message": "Variable "$x" got invalid value "foo"; Something bad happened",
                },
              ],
            }
          `);
        });

        it('catches custom scalar parseValue and preserves code', async () => {
          const uri = await createServerAndGetUrl({
            typeDefs: gql`
              scalar CustomScalar
              type Query {
                hello(x: CustomScalar): String
              }
            `,
            resolvers: {
              CustomScalar: new GraphQLScalarType({
                name: 'CustomScalar',
                parseValue() {
                  // Work-around for https://github.com/graphql/graphql-js/pull/3785
                  // Once that's fixed, we can just directly throw this error.
                  const e = new GraphQLError('Something bad happened', {
                    extensions: { custom: 'foo', code: 'CUSTOMIZED' },
                  });
                  throw new GraphQLError(e.message, { originalError: e });
                },
              }),
            },
          });

          const apolloFetch = createApolloFetch({ uri });

          const result = await apolloFetch({
            query: `query ($x:CustomScalar) {hello(x:$x)}`,
            variables: { x: 'foo' },
          });
          expect(result).toMatchInlineSnapshot(`
            {
              "errors": [
                {
                  "extensions": {
                    "code": "CUSTOMIZED",
                    "custom": "foo",
                  },
                  "locations": [
                    {
                      "column": 8,
                      "line": 1,
                    },
                  ],
                  "message": "Variable "$x" got invalid value "foo"; Something bad happened",
                },
              ],
            }
          `);
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
          const executor = jest.fn<GatewayExecutor>();
          executor.mockReturnValue(
            Promise.resolve({ data: { testString: 'hi - but federated!' } }),
          );

          const { gateway } = makeGatewayMock({ schema, executor });

          const uri = await createServerAndGetUrl({
            gateway,
          });

          const apolloFetch = createApolloFetch({ uri });
          const result = await apolloFetch({ query: '{testString}' });

          expect(result.data).toEqual({ testString: 'hi - but federated!' });
          expect(result.errors).toBeUndefined();
          expect(executor).toHaveBeenCalled();
        });

        it('rejected load promise is thrown by server.start', async () => {
          const loadError = new Error(
            'load error which should be be thrown by start',
          );
          const gateway: GatewayInterface = {
            async load() {
              throw loadError;
            },
            onSchemaLoadOrUpdate() {
              return () => {};
            },
            async stop() {},
          };

          if (options.serverIsStartedInBackground) {
            // We should be able to run the server setup code (which calls
            // startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests)
            // but actual operations will fail, like the function name says.
            // (But the error it throws should be masked.)
            const logger = mockLogger();
            const url = await createServerAndGetUrl({ gateway, logger });
            // We don't need to call stop() on the server since it fails to start.
            serverToCleanUp = null;
            const res = await request(url)
              .post('/')
              .send({ query: '{__typename}' });
            expect(res.status).toEqual(500);
            expect(res.header['content-type']).toMatchInlineSnapshot(
              `"application/json; charset=utf-8"`,
            );
            expect(res.text).toMatchInlineSnapshot(`
              "{"errors":[{"message":"This data graph is missing a valid configuration. More details may be available in the server logs.","extensions":{"code":"INTERNAL_SERVER_ERROR"}}]}
              "
            `);

            // The error is logged once immediately when startup fails, and
            // again during the request.
            expect(logger.error).toHaveBeenCalledTimes(2);
            expect(logger.error).toHaveBeenNthCalledWith(
              1,
              `An error occurred during Apollo Server startup. All GraphQL requests will now fail. The startup error was: ${loadError.message}`,
            );
            expect(logger.error).toHaveBeenNthCalledWith(
              2,
              `An error occurred during Apollo Server startup. All GraphQL requests will now fail. The startup error was: ${loadError.message}`,
            );
          } else {
            // createServer awaits start() so should throw.
            await expect(createServer({ gateway })).rejects.toThrowError(
              loadError,
            );
          }
        });
      });
    });

    describe('Plugins', () => {
      let apolloFetch: ApolloFetch;
      let apolloFetchResponse: ParsedResponse;

      const setupApolloServerAndFetchPairForPlugins = async (
        plugins: ApolloServerPlugin<BaseContext>[] = [],
      ) => {
        const { url } = await createServer(
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

        apolloFetch = createApolloFetch({ uri: url })
          // Store the response so we can inspect it.
          .useAfter(({ response }, next) => {
            apolloFetchResponse = response;
            next();
          });
      };

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
                async willSendResponse({ response: { http, body } }) {
                  if (
                    body.kind === 'single' &&
                    body.singleResult.errors?.[0].message === 'known_error'
                  ) {
                    http!.status = 403;
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
                  if (!('singleResult' in response.body)) {
                    throw Error('expected single result');
                  }
                  response.body.singleResult.extensions = { myExtension: true };
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
                  if (!('singleResult' in response.body)) {
                    throw Error('expected single result');
                  }
                  response.body.singleResult.extensions = { myExtension: true };
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
        const logger = mockLogger();

        const throwError = jest.fn(() => {
          throw new Error('nope');
        });

        const formatError = jest.fn((error: GraphQLFormattedError) => {
          expect(error).toMatchObject({ message: expect.any(String) });
          return error;
        });

        const url = await createServerAndGetUrl({
          schema,
          validationRules: [throwError],
          introspection: true,
          formatError,
          logger,
        });

        {
          const res = await request(url)
            .post('/')
            .send({ query: INTROSPECTION_QUERY });
          expect(res.status).toBe(500);
          expect(res.body).toMatchInlineSnapshot(`
            {
              "errors": [
                {
                  "extensions": {
                    "code": "INTERNAL_SERVER_ERROR",
                  },
                  "message": "Internal server error",
                },
              ],
            }
          `);
          expect(formatError).toHaveBeenCalledTimes(1);
          expect(throwError).toHaveBeenCalledTimes(1);
          expect(logger.error).toHaveBeenCalledTimes(1);
          expect(logger.error).toHaveBeenLastCalledWith(
            'Unexpected error processing request: Error: nope',
          );
        }

        {
          const res = await request(url)
            .post('/')
            .send({ query: TEST_STRING_QUERY });
          expect(res.status).toBe(500);
          expect(res.body).toMatchInlineSnapshot(`
            {
              "errors": [
                {
                  "extensions": {
                    "code": "INTERNAL_SERVER_ERROR",
                  },
                  "message": "Internal server error",
                },
              ],
            }
          `);
          expect(formatError).toHaveBeenCalledTimes(2);
          expect(throwError).toHaveBeenCalledTimes(2);
          expect(logger.error).toHaveBeenCalledTimes(2);
          expect(logger.error).toHaveBeenLastCalledWith(
            'Unexpected error processing request: Error: nope',
          );
        }
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
          (reportIngress.stop() || Promise.resolve()).then(() => done());
        });

        describe('traces', () => {
          let throwError: Mock;
          let apolloFetch: ApolloFetch;
          let uri: string;

          beforeEach(async () => {
            throwError = jest.fn();
          });

          const setupApolloServerAndFetchPair = async (
            usageReportingOptions: Partial<
              ApolloServerPluginUsageReportingOptions<any>
            > = {},
            constructorOptions: Partial<CreateServerForIntegrationTests> = {},
            plugins: ApolloServerPlugin<BaseContext>[] = [],
          ) => {
            uri = await createServerAndGetUrl({
              typeDefs: gql`
                directive @defer(
                  if: Boolean! = true
                  label: String
                ) on FRAGMENT_SPREAD | INLINE_FRAGMENT

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
                  delayedFoo: Foo
                  justAField: String @cacheControl(maxAge: 5, scope: PRIVATE)
                }

                type Foo {
                  bar: String
                }
              `,
              resolvers: {
                Query: {
                  fieldWhichWillError: () => {
                    throwError();
                  },
                  delayedFoo: async () => {
                    await new Promise<void>((r) => setTimeout(r, 10));
                    return { bar: 'hi' };
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
              includeStacktraceInErrorResponses: true,
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

          (process.env.INCREMENTAL_DELIVERY_TESTS_ENABLED ? it : it.skip)(
            'includes all fields with defer',
            async () => {
              await setupApolloServerAndFetchPair();
              const response = await fetch(uri, {
                method: 'POST',
                headers: {
                  'content-type': 'application/json',
                  accept: 'multipart/mixed; deferSpec=20220824',
                },
                body: JSON.stringify({
                  query: '{ justAField ...@defer { delayedFoo { bar} } }',
                }),
              });
              expect(response.status).toBe(200);
              expect(
                response.headers.get('content-type'),
              ).toMatchInlineSnapshot(
                `"multipart/mixed; boundary="-"; deferSpec=20220824"`,
              );
              expect(await response.text()).toMatchInlineSnapshot(`
                "
                ---
                content-type: application/json; charset=utf-8

                {"hasNext":true,"data":{"justAField":"a string"}}
                ---
                content-type: application/json; charset=utf-8

                {"hasNext":false,"incremental":[{"path":[],"data":{"delayedFoo":{"bar":"hi"}}}]}
                -----
                "
              `);
              const reports = await reportIngress.promiseOfReports;
              expect(reports.length).toBe(1);
              expect(Object.keys(reports[0].tracesPerQuery)).toHaveLength(1);
              const trace = Object.values(reports[0].tracesPerQuery)[0]
                .trace?.[0] as Trace;
              expect(trace).toBeDefined();
              expect(trace?.root?.child?.[0].responseName).toBe('justAField');
              expect(trace?.root?.child?.[1].responseName).toBe('delayedFoo');
              expect(trace?.root?.child?.[1].child?.[0].responseName).toBe(
                'bar',
              );
            },
          );

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

            expect(Object.keys(reports[0].tracesPerQuery)[0]).toEqual(
              '# -\n{justAField}',
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
            describe('sendErrors', () => {
              it('new error', async () => {
                throwError.mockImplementationOnce(() => {
                  throw new Error('transform nope');
                });

                await setupApolloServerAndFetchPair({
                  sendErrors: {
                    transform: () =>
                      new GraphQLError('rewritten as a new error'),
                  },
                });

                const result = await apolloFetch({
                  query: `{fieldWhichWillError}`,
                });
                expect(result.data).toEqual({
                  fieldWhichWillError: null,
                });
                expect(result.errors).toBeDefined();

                // The original error message should be sent to the client.
                expect(result.errors[0].message).toEqual('transform nope');
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
                  throw new Error('transform mod nope');
                });

                await setupApolloServerAndFetchPair({
                  sendErrors: {
                    transform: (err) => {
                      err.message = 'rewritten as a modified error';
                      return err;
                    },
                  },
                });

                const result = await apolloFetch({
                  query: `{fieldWhichWillError}`,
                });
                expect(result.data).toEqual({
                  fieldWhichWillError: null,
                });
                expect(result.errors).toBeDefined();
                expect(result.errors[0].message).toEqual('transform mod nope');
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
                  throw new Error('transform null nope');
                });

                await setupApolloServerAndFetchPair({
                  sendErrors: { transform: () => null },
                });

                const result = await apolloFetch({
                  query: `{fieldWhichWillError}`,
                });
                expect(result.data).toEqual({
                  fieldWhichWillError: null,
                });
                expect(result.errors).toBeDefined();
                expect(result.errors[0].message).toEqual('transform null nope');
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
                throw new Error('transform undefined whoops');
              });

              await setupApolloServerAndFetchPair({
                sendErrors: {
                  // @ts-expect-error (not allowed to be undefined)
                  transform: () => undefined,
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
                'transform undefined whoops',
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
                  json: '{"message":"transform undefined whoops","locations":[{"line":1,"column":2}],"path":["fieldWhichWillError"]}',
                  message: 'transform undefined whoops',
                  location: [{ column: 2, line: 1 }],
                },
              ]);
            });

            it('unmodified', async () => {
              throwError.mockImplementationOnce(() => {
                throw new GraphQLError('should be unmodified', {
                  extensions: { custom: 'extension' },
                });
              });

              await setupApolloServerAndFetchPair({
                sendErrors: {
                  unmodified: true,
                },
              });

              const result = await apolloFetch({
                query: `{fieldWhichWillError}`,
              });
              expect(result.data).toEqual({
                fieldWhichWillError: null,
              });
              expect(result.errors).toBeDefined();
              expect(result.errors[0].message).toEqual('should be unmodified');
              expect(throwError).toHaveBeenCalledTimes(1);

              const reports = await reportIngress.promiseOfReports;
              expect(reports.length).toBe(1);
              const trace = Object.values(reports[0].tracesPerQuery)[0]
                .trace![0] as Trace;

              // There should be no error at the root, our error is a child.
              expect(trace.root!.error).toStrictEqual([]);

              // There should only be one child.
              expect(trace.root!.child!.length).toBe(1);

              // The child should maintain the path and message
              expect(trace.root!.child![0].error).toMatchInlineSnapshot(`
                [
                  {
                    "json": "{"message":"should be unmodified","locations":[{"line":1,"column":2}],"path":["fieldWhichWillError"],"extensions":{"custom":"extension"}}",
                    "location": [
                      {
                        "column": 2,
                        "line": 1,
                      },
                    ],
                    "message": "should be unmodified",
                  },
                ]
              `);
            });

            it('masked', async () => {
              throwError.mockImplementationOnce(() => {
                throw new GraphQLError('should be masked', {
                  extensions: { custom: 'extension' },
                });
              });

              await setupApolloServerAndFetchPair({
                sendErrors: {
                  masked: true,
                },
              });

              const result = await apolloFetch({
                query: `{fieldWhichWillError}`,
              });
              expect(result.data).toEqual({
                fieldWhichWillError: null,
              });
              expect(result.errors).toBeDefined();
              expect(result.errors[0].message).toEqual('should be masked');
              expect(throwError).toHaveBeenCalledTimes(1);

              const reports = await reportIngress.promiseOfReports;
              expect(reports.length).toBe(1);
              const trace = Object.values(reports[0].tracesPerQuery)[0]
                .trace![0] as Trace;

              // There should be no error at the root, our error is a child.
              expect(trace.root!.error).toStrictEqual([]);

              // There should only be one child.
              expect(trace.root!.child!.length).toBe(1);

              // The child should maintain the path, but have its message masked
              expect(trace.root!.child![0].error).toMatchInlineSnapshot(`
                [
                  {
                    "json": "{"message":"<masked>","locations":[{"line":1,"column":2}],"path":["fieldWhichWillError"],"extensions":{"maskedBy":"ApolloServerPluginUsageReporting"}}",
                    "location": [
                      {
                        "column": 2,
                        "line": 1,
                      },
                    ],
                    "message": "<masked>",
                  },
                ]
              `);
            });
          });
        });
      });

      it('errors thrown in plugins call formatError and are wrapped', async () => {
        const pluginError = new Error('nope');
        const pluginCalled = jest.fn(() => {
          throw pluginError;
        });
        const formatError = jest.fn(
          (formattedError: GraphQLFormattedError, error: unknown) => {
            // Errors thrown by plugins are generally replaced with "Internal
            // server error" and logged.
            expect((error as Error).message).toBe('Internal server error');
            // extension should be called before formatError
            expect(pluginCalled).toHaveBeenCalledTimes(1);

            return {
              ...formattedError,
              message: 'masked',
            };
          },
        );
        const logger = mockLogger();
        const unexpectedErrorProcessingRequest = jest.fn<() => Promise<void>>();
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
          logger,
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
              unexpectedErrorProcessingRequest,
            },
          ],
          formatError,
          includeStacktraceInErrorResponses: true,
        });
        const apolloFetch = createApolloFetch({ uri });
        const result = await apolloFetch({
          query: `{fieldWhichWillError}`,
        });
        expect(result.data).toBeUndefined();
        expect(result.errors).toBeDefined();
        expect(result.errors[0].message).toEqual('masked');
        expect(formatError).toHaveBeenCalledTimes(1);
        expect(logger.error).toHaveBeenCalledTimes(1);
        expect(logger.error).toHaveBeenCalledWith(
          'Unexpected error processing request: Error: nope',
        );
        expect(unexpectedErrorProcessingRequest).toHaveBeenCalledTimes(1);
        expect(unexpectedErrorProcessingRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            error: expect.objectContaining({
              message: 'nope',
            }),
          }),
        );
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

            await server.executeOperation(
              { query: '{hello}' },
              { contextValue: uniqueContext },
            );
            expect(spy).toHaveBeenCalledTimes(1);
            await server.executeOperation(
              { query: '{hello}' },
              { contextValue: uniqueContext },
            );
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

          describe('context errors', () => {
            async function run(errorToThrow: Error) {
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
              const contextCreationDidFail = jest.fn<() => Promise<void>>();
              const uri = await createServerAndGetUrl(
                {
                  typeDefs,
                  resolvers,
                  stopOnTerminationSignals: false,
                  includeStacktraceInErrorResponses: false,
                  plugins: [{ contextCreationDidFail }],
                  formatError(formattedError) {
                    return {
                      ...formattedError,
                      extensions: {
                        ...formattedError.extensions,
                        formatErrorCalled: true,
                      },
                    };
                  },
                },
                {
                  context: async () => {
                    throw errorToThrow;
                  },
                },
              );

              let status = 0;
              let headers: Headers | undefined;
              const apolloFetch = createApolloFetch({ uri }).useAfter(
                (res, next) => {
                  status = res.response.status;
                  headers = res.response.headers;
                  next();
                },
              );

              const result = await apolloFetch({ query: '{hello}' });

              return {
                result,
                status,
                specialHeader: headers!.get('special'),
                contextCreationDidFailMockCalls:
                  contextCreationDidFail.mock.calls,
              };
            }

            it('GraphQLErrors are formatted, defaulting to status 500', async () => {
              expect(
                await run(
                  new GraphQLError('valid result', {
                    extensions: { code: 'SOME_CODE' },
                  }),
                ),
              ).toMatchInlineSnapshot(`
                {
                  "contextCreationDidFailMockCalls": [
                    [
                      {
                        "error": [GraphQLError: valid result],
                      },
                    ],
                  ],
                  "result": {
                    "errors": [
                      {
                        "extensions": {
                          "code": "SOME_CODE",
                          "formatErrorCalled": true,
                        },
                        "message": "valid result",
                      },
                    ],
                  },
                  "specialHeader": null,
                  "status": 500,
                }
              `);
            });

            it('GraphQLErrors are formatted, defaulting to INTERNAL_SERVER_ERROR', async () => {
              expect(await run(new GraphQLError('some error')))
                .toMatchInlineSnapshot(`
                {
                  "contextCreationDidFailMockCalls": [
                    [
                      {
                        "error": [GraphQLError: some error],
                      },
                    ],
                  ],
                  "result": {
                    "errors": [
                      {
                        "extensions": {
                          "code": "INTERNAL_SERVER_ERROR",
                          "formatErrorCalled": true,
                        },
                        "message": "some error",
                      },
                    ],
                  },
                  "specialHeader": null,
                  "status": 500,
                }
              `);
            });

            it('GraphQLErrors are formatted, obeying http extension', async () => {
              expect(
                await run(
                  new GraphQLError('some error', {
                    extensions: {
                      http: {
                        status: 404,
                        headers: new HeaderMap([['special', 'hello']]),
                      },
                    },
                  }),
                ),
              ).toMatchInlineSnapshot(`
                {
                  "contextCreationDidFailMockCalls": [
                    [
                      {
                        "error": [GraphQLError: some error],
                      },
                    ],
                  ],
                  "result": {
                    "errors": [
                      {
                        "extensions": {
                          "code": "INTERNAL_SERVER_ERROR",
                          "formatErrorCalled": true,
                        },
                        "message": "some error",
                      },
                    ],
                  },
                  "specialHeader": "hello",
                  "status": 404,
                }
              `);
            });

            it('non-GraphQLErrors are formatted', async () => {
              expect(await run(new Error('random error')))
                .toMatchInlineSnapshot(`
                {
                  "contextCreationDidFailMockCalls": [
                    [
                      {
                        "error": [Error: random error],
                      },
                    ],
                  ],
                  "result": {
                    "errors": [
                      {
                        "extensions": {
                          "code": "INTERNAL_SERVER_ERROR",
                          "formatErrorCalled": true,
                        },
                        "message": "Context creation failed: random error",
                      },
                    ],
                  },
                  "specialHeader": null,
                  "status": 500,
                }
              `);
            });
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
                throw new GraphQLError('we the best music', {
                  extensions: { code: 'SOME_CODE' },
                });
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
        expect(result.errors[0].extensions.code).toEqual('SOME_CODE');
        expect(result.errors[0].extensions).not.toHaveProperty('exception');
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
                throw new GraphQLError('we the best music', {
                  extensions: { code: 'SOME_CODE' },
                });
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
        expect(result.errors[0].extensions.code).toEqual('SOME_CODE');
        expect(result.errors[0].extensions).not.toHaveProperty('exception');
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
                throw new GraphQLError('we the best music', {
                  extensions: { code: 'SOME_CODE' },
                });
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
        expect(result.errors[0].extensions.code).toEqual('SOME_CODE');
        expect(result.errors[0].extensions).not.toHaveProperty('exception');
        expect(result.errors[0].extensions.stacktrace).toBeDefined();
      });

      it('shows error extensions in extensions (only!)', async () => {
        const uri = await createServerAndGetUrl({
          typeDefs: gql`
            type Query {
              fieldWhichWillError: String
            }
          `,
          resolvers: {
            Query: {
              fieldWhichWillError: () => {
                throw new GraphQLError('Some message', {
                  extensions: { ext1: 'myExt', code: 'SOME_CODE' },
                });
              },
            },
          },
          stopOnTerminationSignals: false,
          nodeEnv: 'development',
          includeStacktraceInErrorResponses: false,
        });

        const apolloFetch = createApolloFetch({ uri });

        const result = await apolloFetch({ query: `{fieldWhichWillError}` });
        expect(result.data).toEqual({ fieldWhichWillError: null });
        expect(result.errors).toEqual([
          {
            message: 'Some message',
            path: ['fieldWhichWillError'],
            locations: [{ line: 1, column: 2 }],
            extensions: {
              code: 'SOME_CODE',
              ext1: 'myExt',
            },
          },
        ]);
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

      it('returns correct result for persisted query link', async () => {
        const variables = { id: 1 };
        const link = createPersistedQueryLink({
          sha256: (query) => createHash('sha256').update(query).digest('hex'),
        }).concat(createHttpLink({ uri, fetch } as any));

        const promise = resolvable();
        execute(link, {
          query,
          variables,
        }).subscribe(
          (result) => {
            expect(result.data).toEqual({ testString: 'test string' });
            promise.resolve();
          },
          // onerror
          () => expect(false).toBe(true),
        );
        await promise;
        expect.assertions(1);
      });

      it('returns correct result for persisted query link using get request', async () => {
        const variables = { id: 1 };
        const link = createPersistedQueryLink({
          sha256: (query) => createHash('sha256').update(query).digest('hex'),
          useGETForHashedQueries: true,
        }).concat(createHttpLink({ uri, fetch } as any));

        const promise = resolvable();
        execute(link, { query, variables } as any).subscribe(
          (result) => {
            expect(result.data).toEqual({ testString: 'test string' });
            promise.resolve();
          },
          //onerror
          () => expect(false).toBe(true),
        );

        await promise;
        expect.assertions(1);
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
          status: number | 'cannot-connect' | 'timeout',
          expectedRequestCount: number,
        ) {
          const { closeServer, fakeUsageReportingUrl, writeResponseResolve } =
            await makeFakeUsageReportingServer({
              // the 444 case shouldn't ever get to actually sending 444
              status: typeof status === 'number' ? status : 444,
              waitWriteResponse: true,
            });

          try {
            // To simulate a network error, we create and close the server.
            // This lets us still generate a port that is hopefully unused.
            if (status == 'cannot-connect') {
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
                  // Make sure the timeout test actually finishes in time
                  requestTimeoutMs: status === 'timeout' ? 10 : undefined,
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

            if (typeof status === 'number') {
              // Allow reporting to return its response (for every retry).
              // (But not if we're intentionally timing out!)
              writeResponseResolve();
            }

            // Make sure we can get the error from reporting.
            const sendingError = await reportErrorPromise;
            expect(sendingError).toBeTruthy();
            if (status === 'cannot-connect') {
              expect(sendingError.message).toContain(
                'Error sending report to Apollo servers',
              );
              expect(sendingError.message).toContain('ECONNREFUSED');
            } else if (status === 'timeout') {
              expect(sendingError.message).toBe(
                'Error sending report to Apollo servers: The user aborted a request.',
              );
            } else {
              expect(sendingError.message).toBe(
                `Error sending report to Apollo servers: HTTP status ${status}, Important text in the body`,
              );
            }
            expect(requestCount).toBe(expectedRequestCount);
          } finally {
            if (status !== 'cannot-connect') {
              await closeServer();
            }
          }
        }

        it('with retryable error', async () => {
          await testWithStatus(500, 3);
        });
        it('with network error', async () => {
          await testWithStatus('cannot-connect', 3);
        });
        it('with timeout', async () => {
          await testWithStatus('timeout', 3);
        });
        it('with non-retryable error', async () => {
          await testWithStatus(400, 1);
        });
      });
    });

    describe('Federated tracing', () => {
      // Enable federated tracing by pretending to be federated.
      const federationV1TypeDefs = gql`
        type _Service {
          sdl: String
        }
      `;

      const federationV2TypeDefs = gql`
        type _Service {
          sdl: String!
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

      const v1TypeDefs = [federationV1TypeDefs, baseTypeDefs];
      const v2TypeDefs = [federationV2TypeDefs, baseTypeDefs];

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
          typeDefs: v2TypeDefs,
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

      describe.each([
        ['nullable _Service.sdl field', v1TypeDefs],
        ['non-nullable _Service.sdl! field', v2TypeDefs],
      ])('with %s', (_, typeDefs) => {
        it('reports a total duration that is longer than the duration of its resolvers', async () => {
          const uri = await createServerAndGetUrl({
            typeDefs,
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
              earliestStartOffset = Math.min(
                earliestStartOffset,
                node.startTime,
              );
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
            typeDefs,
            resolvers,
            formatError(err) {
              return {
                ...err,
                message: `Formatted: ${err.message}`,
              };
            },
            plugins: [
              ApolloServerPluginInlineTrace({
                includeErrors: {
                  transform(err) {
                    err.message = `Rewritten for Usage Reporting: ${err.message}`;
                    return err;
                  },
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

          const executor = (req: GatewayGraphQLRequestContext) =>
            (req.source as string).match(/1/)
              ? Promise.resolve({ data: { testString1: 'hello' } })
              : Promise.resolve({ data: { testString2: 'aloha' } });

          const { gateway, triggers } = makeGatewayMock({
            schema: makeQueryTypeWithField('testString1'),
            executor,
          });

          const uri = await createServerAndGetUrl({
            gateway,
            documentStore: withDocumentStore
              ? new InMemoryLRUCache<DocumentNode>()
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
              locations: [{ line: 1, column: 2 }],
            },
          ]);
        },
      );

      it('passes apollo data to the gateway', async () => {
        const optionsSpy = jest.fn();

        const { gateway } = makeGatewayMock({
          schema,
          executor: async () => ({}),
          optionsSpy,
        });
        const { server } = await createServer({
          gateway,
          apollo: {
            key: 'service:tester:1234abc',
            graphRef: 'tester@staging',
          },
          logger: quietLogger,
          plugins: [ApolloServerPluginUsageReportingDisabled()],
        });

        expect(optionsSpy).toHaveBeenLastCalledWith({
          apollo: {
            key: 'service:tester:1234abc',
            keyHash:
              '0ca858e7fe8cffc01c5f1db917d2463b348b50d267427e54c1c8c99e557b242f4145930b949905ec430642467613610e471c40bb7a251b1e2248c399bb0498c4',
            graphRef: 'tester@staging',
          },
        });

        // Executing an operation ensures that (even if
        // serverIsStartedInBackground) startup completes, so that we can
        // legally call stop().
        await server.executeOperation({ query: '{__typename}' });
      });

      it('unsubscribes from schema update on close', async () => {
        const unsubscribeSpy = jest.fn();
        const { gateway } = makeGatewayMock({
          schema,
          executor: async () => ({}),
          unsubscribeSpy,
        });
        const server = (await createServer({ gateway })).server;
        if (options.serverIsStartedInBackground) {
          // To ensure that the server has started in the case of serverless, we
          // make a query against it, which forces us to wait until after start.
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

        const { gateway } = makeGatewayMock({ schema, executor });

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

        const executor = async (req: GatewayGraphQLRequestContext) => {
          const source = req.source as string;
          const { startPromise, endPromise, i } = executorData[source];
          startPromise.resolve();
          await endPromise;
          return { data: { [`testString${i}`]: `${i}` } };
        };

        const { gateway, triggers } = makeGatewayMock({
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

      function get(accept = 'text/html') {
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
          /embeddable-sandbox.cdn.apollographql.com\/_latest\/embeddable-sandbox.umd.production.min.js/s,
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
          /embeddable-sandbox.cdn.apollographql.com\/abcdef\/embeddable-sandbox.umd.production.min.js/s,
        );
      });

      // We don’t maintain this plugin any more (and we deleted its source from
      // this repository) but it would still be nice to find out if we broke the
      // plugin somehow.
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

      // If the server was started in the background, then createServer does not
      // throw.
      options.serverIsStartedInBackground ||
        describe('startup errors', () => {
          it('only one plugin can implement renderLandingPage', async () => {
            await expect(
              createServer(makeServerConfig(['x', 'y'])),
            ).rejects.toThrow(
              'Only one plugin can implement renderLandingPage.',
            );
          });
        });
    });

    describe('CSRF prevention', () => {
      const invalidRequestErrors: Error[] = [];

      async function makeServer(
        csrfPrevention?: ApolloServerOptions<BaseContext>['csrfPrevention'],
      ): Promise<string> {
        return (
          await createServer({
            typeDefs: 'type Query { x: ID }',
            resolvers: { Query: { x: () => 'foo' } },
            csrfPrevention,
            plugins: [
              {
                async invalidRequestWasReceived({ error }) {
                  invalidRequestErrors.push(error);
                },
              },
            ],
          })
        ).url;
      }
      const operation = { query: '{x}' };
      const response = { data: { x: 'foo' } };

      function succeeds(res: Response) {
        expect(res.status).toBe(200);
        expect(res.body).toEqual(response);
        expect(invalidRequestErrors).toHaveLength(0);
      }

      // When Apollo Server itself blocks a request, it returns status code 400
      // with a particular message. With some web frameworks, a request without
      // a parsable Content-Type will make it to our middleware and get blocked
      // by us; with other frameworks (eg Fastify) the framework itself will
      // block it earlier in some cases. This function is thus relaxed for the
      // one particular case where Fastify returns a 415 earlier; we can relax
      // it further if other integrations need it.
      function blocked(res: Response, statusCodes = [400]) {
        expect(statusCodes).toContain(res.status);
        if (res.status === 400) {
          expect(res.text).toMatch(/This operation has been blocked/);
          expect(invalidRequestErrors).toHaveLength(1);
          expect(invalidRequestErrors.pop()?.message).toMatch(
            /This operation has been blocked/,
          );
        }
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
        blocked(
          await request(url).post('/').send(JSON.stringify(operation)),
          [400, 415],
        );

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
