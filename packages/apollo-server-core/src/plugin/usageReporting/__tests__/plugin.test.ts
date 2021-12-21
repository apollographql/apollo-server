import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';
import { Request } from 'node-fetch';
import loglevel from 'loglevel';
import {
  makeHTTPRequestHeaders,
  ApolloServerPluginUsageReporting,
} from '../plugin';
import { Headers } from 'apollo-server-env';
import {
  Trace,
  Report,
  ITrace,
  ITracesAndStats,
  ContextualizedStats,
} from 'apollo-reporting-protobuf';
import pluginTestHarness from '../../../utils/pluginTestHarness';
import { pluginsEnabledForSchemaResolvers } from '../../../utils/schemaInstrumentation';
import nock from 'nock';
import sumBy from 'lodash.sumby';
import { mockRandom, resetMockRandom } from 'jest-mock-random';
import { gunzipSync } from 'zlib';
import type { ApolloServerPluginUsageReportingOptions } from '../options';
import type { GraphQLRequestContextDidResolveOperation } from 'apollo-server-types';

const quietLogger = loglevel.getLogger('quiet');
quietLogger.setLevel(loglevel.levels.WARN);

describe('end-to-end', () => {
  async function runTest({
    pluginOptions = {},
    expectReport = true,
    query,
    operationName,
    schemaShouldBeInstrumented = true,
  }: {
    pluginOptions?: ApolloServerPluginUsageReportingOptions<any>;
    expectReport?: boolean;
    query?: string;
    operationName?: string | null;
    schemaShouldBeInstrumented?: boolean;
  }) {
    const typeDefs = `
      type User {
        id: Int
        name: String
        posts(limit: Int): [Post]
      }

      type Post {
        id: Int
        title: String
        views: Int
        author: User
      }

      type Query {
        aString: String
        aBoolean: Boolean
        anInt: Int
        author(id: Int): User
        topPosts(limit: Int): [Post]
      }
      `;

    const defaultQuery = `
      query q {
        author(id: 5) {
          name
          posts(limit: 2) {
            id
          }
        }
        aBoolean
      }
      `;

    let reportResolver: (report: string) => void;
    const reportPromise = new Promise<string>((resolve) => {
      reportResolver = resolve;
    });

    const nockScope = nock('https://usage-reporting.api.apollographql.com');
    if (expectReport) {
      nockScope
        .post('/api/ingress/traces')
        .reply(200, (_: any, requestBody: string) => {
          reportResolver(requestBody);
          return 'ok';
        });
    }
    const schema = addMocksToSchema({
      schema: makeExecutableSchema({ typeDefs }),
    });

    const pluginInstance = ApolloServerPluginUsageReporting({
      ...pluginOptions,
      sendReportsImmediately: true,
      logger: quietLogger,
    });

    const context = await pluginTestHarness({
      pluginInstance,
      schema,
      graphqlRequest: {
        query: query ?? defaultQuery,
        // If operation name is specified use it. If it is specified as null convert it to
        // undefined because graphqlRequest expects string | undefined
        operationName:
          operationName === undefined ? 'q' : operationName || undefined,
        extensions: {
          clientName: 'testing suite',
        },
        http: new Request('http://localhost:123/foo'),
      },
      executor: async ({ request: { query: source }, context }) => {
        return await graphql({
          schema,
          source,
          // context is needed for schema instrumentation to find plugins.
          contextValue: context,
        });
      },
    });

    const report = expectReport
      ? await reportPromise.then((reportBody: string) => {
          // nock returns binary bodies as hex strings
          const gzipReportBuffer = Buffer.from(reportBody, 'hex');
          const reportBuffer = gunzipSync(gzipReportBuffer);
          return Report.decode(reportBuffer);
        })
      : null;
    nockScope.done();

    expect(pluginsEnabledForSchemaResolvers(schema)).toBe(
      schemaShouldBeInstrumented,
    );

    return { report, context };
  }

  it('basic tracing', async () => {
    const { report } = await runTest({});

    expect(Object.keys(report!.tracesPerQuery)).toHaveLength(1);
    expect(Object.keys(report!.tracesPerQuery)[0]).toMatch(/^# q\n/);
    const traces = Object.values(report!.tracesPerQuery)[0]!.trace;
    expect(traces).toHaveLength(1);
    expect(
      (traces![0] as ITrace).root!.child!.some(
        ({ responseName }) => responseName === 'aBoolean',
      ),
    ).toBeTruthy();
  });

  [
    {
      testName: 'fails parse for non-parseable gql',
      op: { query: 'random text', schemaShouldBeInstrumented: false },
      statsReportKey: '## GraphQLParseFailure\n',
    },
    {
      testName: 'validation fails for invalid operation',
      op: {
        query: 'query q { nonExistentField }',
        schemaShouldBeInstrumented: false,
      },
      statsReportKey: '## GraphQLValidationFailure\n',
    },
    {
      testName: 'unknown operation error if not specified',
      op: {
        query: 'query notQ { aString }',
        schemaShouldBeInstrumented: false,
      },
      statsReportKey: '## GraphQLUnknownOperationName\n',
    },
    {
      testName: 'handles anonymous operation',
      op: {
        query: 'query { aString }',
        operationName: null,
      },
      statsReportKey: '# -\n{aString}',
    },
    {
      testName: 'handles named operation',
      op: {
        query: 'query bar { aString } query foo { aBoolean }',
        operationName: 'foo',
      },
      statsReportKey: '# foo\nquery foo{aBoolean}',
    },
  ].forEach(({ testName, op, statsReportKey }) =>
    it(testName, async () => {
      const { report } = await runTest(op);
      const queryEntries = Object.entries(report!.tracesPerQuery);
      expect(queryEntries).toHaveLength(1);
      expect(queryEntries[0][0]).toBe(statsReportKey);
      const tracesAndStats = queryEntries[0][1];
      const operationsSentAsTrace = tracesAndStats.trace?.length ?? 0;
      if (
        tracesAndStats.statsWithContext &&
        'toArray' in tracesAndStats.statsWithContext
      ) {
        throw Error(
          "we shouldn't get something that needs to be converted when we decode a report",
        );
      }
      const operationsSentAsStats = sumBy(
        tracesAndStats.statsWithContext,
        (contextualizedStats) =>
          contextualizedStats.queryLatencyStats?.requestCount ?? 0,
      );
      expect(operationsSentAsTrace + operationsSentAsStats).toBe(1);
    }),
  );

  describe('includeRequest', () => {
    it('include based on operation name', async () => {
      const { report, context } = await runTest({
        pluginOptions: {
          includeRequest: async (request: any) => {
            await new Promise<void>((res) => setTimeout(() => res(), 1));
            return request.request.operationName === 'q';
          },
        },
        schemaShouldBeInstrumented: true,
      });
      expect(Object.keys(report!.tracesPerQuery)).toHaveLength(1);
      expect(context.metrics.captureTraces).toBe(true);
    });
    it('exclude based on operation name', async () => {
      const { context } = await runTest({
        pluginOptions: {
          includeRequest: async (request: any) => {
            await new Promise<void>((res) => setTimeout(() => res(), 1));
            return request.request.operationName === 'not_q';
          },
        },
        expectReport: false,
        schemaShouldBeInstrumented: false,
      });
      expect(context.metrics.captureTraces).toBeFalsy();
    });
  });

  describe('fieldLevelInstrumentation', () => {
    function containsFieldExecutionData(
      tracesAndStats: ITracesAndStats,
    ): boolean {
      for (const trace of tracesAndStats.trace ?? []) {
        if (trace instanceof Uint8Array) {
          throw Error(
            "test shouldn't have a pre-encoded trace after decoding!",
          );
        }
        if (trace.root?.child?.length) {
          // We found an actual field inside a trace.
          return true;
        }
      }

      if (
        tracesAndStats.statsWithContext &&
        'toArray' in tracesAndStats.statsWithContext
      ) {
        throw Error(
          "we shouldn't get something that needs to be converted when we decode a report",
        );
      }
      for (const statsWithContext of tracesAndStats.statsWithContext ?? []) {
        if (Object.keys(statsWithContext.perTypeStat ?? {}).length > 0) {
          // We found a TypeStat, showing that we have field execution stats.
          return true;
        }
      }

      return false;
    }

    it('include based on operation name', async () => {
      const { report, context } = await runTest({
        pluginOptions: {
          fieldLevelInstrumentation: async (
            requestContext: GraphQLRequestContextDidResolveOperation<any>,
          ) => {
            await new Promise<void>((res) => setTimeout(() => res(), 1));
            return requestContext.request.operationName === 'q';
          },
        },
      });
      expect(context.metrics.captureTraces).toBe(true);
      expect(Object.keys(report!.tracesPerQuery)).toHaveLength(1);
      expect(
        containsFieldExecutionData(Object.values(report!.tracesPerQuery)[0]!),
      ).toBe(true);
    });

    it('exclude based on operation name', async () => {
      const { report, context } = await runTest({
        pluginOptions: {
          fieldLevelInstrumentation: async (
            requestContext: GraphQLRequestContextDidResolveOperation<any>,
          ) => {
            await new Promise<void>((res) => setTimeout(() => res(), 1));
            return requestContext.request.operationName === 'not_q';
          },
        },
        schemaShouldBeInstrumented: false,
      });
      // We do get a report about this operation; we just don't have field
      // execution data (as trace or as TypeStat).
      expect(context.metrics.captureTraces).toBe(false);
      expect(Object.keys(report!.tracesPerQuery)).toHaveLength(1);
      expect(
        containsFieldExecutionData(Object.values(report!.tracesPerQuery)[0]!),
      ).toBe(false);
    });

    describe('passing a number', () => {
      afterEach(() => resetMockRandom());

      const samplingFactor = 0.015;
      it('RNG returns a small number', async () => {
        mockRandom(samplingFactor * 0.99);
        const { report, context } = await runTest({
          pluginOptions: {
            fieldLevelInstrumentation: samplingFactor,
            // Want to see this in stats so we can see the scaling.
            experimental_sendOperationAsTrace: () => false,
          },
          schemaShouldBeInstrumented: true,
        });
        expect(context.metrics.captureTraces).toBe(true);
        expect(Object.keys(report!.tracesPerQuery)).toHaveLength(1);
        expect(
          containsFieldExecutionData(Object.values(report!.tracesPerQuery)[0]!),
        ).toBe(true);
        const fieldStat = (
          Object.values(report!.tracesPerQuery)[0]!
            .statsWithContext as ContextualizedStats[]
        )[0].perTypeStat['Query'].perFieldStat!['aBoolean'];
        expect(fieldStat.observedExecutionCount).toBe(1);
        expect(fieldStat.estimatedExecutionCount).toBe(
          Math.floor(1 / samplingFactor),
        );
      });
      it('RNG returns a large number', async () => {
        mockRandom(samplingFactor * 1.01);
        const { report, context } = await runTest({
          pluginOptions: {
            fieldLevelInstrumentation: samplingFactor,
          },
          schemaShouldBeInstrumented: false,
        });
        expect(context.metrics.captureTraces).toBe(false);
        expect(Object.keys(report!.tracesPerQuery)).toHaveLength(1);
        expect(
          containsFieldExecutionData(Object.values(report!.tracesPerQuery)[0]!),
        ).toBe(false);
      });
    });
  });
});

describe('sendHeaders makeHTTPRequestHeaders helper', () => {
  const headers = new Headers();
  headers.append('name', 'value');
  headers.append('authorization', 'blahblah'); // THIS SHOULD NEVER BE SENT

  const headersOutput = { name: new Trace.HTTP.Values({ value: ['value'] }) };

  function makeTestHTTP(): Trace.HTTP {
    return new Trace.HTTP({
      method: Trace.HTTP.Method.UNKNOWN,
      host: null,
      path: null,
    });
  }

  it('sendHeaders defaults to hiding all', () => {
    const http = makeTestHTTP();
    makeHTTPRequestHeaders(
      http,
      headers,
      // @ts-ignore: `null` is not a valid type; check output on invalid input.
      null,
    );
    expect(http.requestHeaders).toEqual({});
    makeHTTPRequestHeaders(http, headers, undefined);
    expect(http.requestHeaders).toEqual({});
    makeHTTPRequestHeaders(http, headers);
    expect(http.requestHeaders).toEqual({});
  });

  it('sendHeaders.all and sendHeaders.none', () => {
    const httpSafelist = makeTestHTTP();
    makeHTTPRequestHeaders(httpSafelist, headers, { all: true });
    expect(httpSafelist.requestHeaders).toEqual(headersOutput);

    const httpBlocklist = makeTestHTTP();
    makeHTTPRequestHeaders(httpBlocklist, headers, { none: true });
    expect(httpBlocklist.requestHeaders).toEqual({});
  });

  it('invalid inputs for sendHeaders.all and sendHeaders.none', () => {
    const httpSafelist = makeTestHTTP();
    makeHTTPRequestHeaders(
      httpSafelist,
      headers,
      // @ts-ignore Testing untyped usage; only `{ none: true }` is legal.
      { none: false },
    );
    expect(httpSafelist.requestHeaders).toEqual(headersOutput);

    const httpBlocklist = makeTestHTTP();
    makeHTTPRequestHeaders(
      httpBlocklist,
      headers,
      // @ts-ignore Testing untyped usage; only `{ all: true }` is legal.
      { all: false },
    );
    expect(httpBlocklist.requestHeaders).toEqual({});
  });

  it('test sendHeaders.exceptNames', () => {
    const except: String[] = ['name', 'notinheaders'];
    const http = makeTestHTTP();
    makeHTTPRequestHeaders(http, headers, { exceptNames: except });
    expect(http.requestHeaders).toEqual({});
  });

  it('test sendHeaders.onlyNames', () => {
    // headers that should never be sent (such as "authorization") should still be removed if in includeHeaders
    const include: String[] = ['name', 'authorization', 'notinheaders'];
    const http = makeTestHTTP();
    makeHTTPRequestHeaders(http, headers, { onlyNames: include });
    expect(http.requestHeaders).toEqual(headersOutput);
  });

  it('authorization, cookie, and set-cookie headers should never be sent', () => {
    headers.append('cookie', 'blahblah');
    headers.append('set-cookie', 'blahblah');
    const http = makeTestHTTP();
    makeHTTPRequestHeaders(http, headers, { all: true });
    expect(http.requestHeaders['authorization']).toBe(undefined);
    expect(http.requestHeaders['cookie']).toBe(undefined);
    expect(http.requestHeaders['set-cookie']).toBe(undefined);
  });
});
