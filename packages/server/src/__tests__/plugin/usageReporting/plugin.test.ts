import { addMocksToSchema } from '@graphql-tools/mock';
import { makeExecutableSchema } from '@graphql-tools/schema';
import loglevel from 'loglevel';
import { makeHTTPRequestHeaders } from '../../../plugin/usageReporting/plugin';
import {
  Trace,
  Report,
  ITrace,
  ITracesAndStats,
  ContextualizedStats,
} from '@apollo/usage-reporting-protobuf';
import { pluginsEnabledForSchemaResolvers } from '../../../utils/schemaInstrumentation';
import nock from 'nock';
import sumBy from 'lodash.sumby';
import { mockRandom, resetMockRandom } from 'jest-mock-random';
import { gunzipSync } from 'zlib';
import {
  ApolloServer,
  GraphQLRequestContextDidResolveOperation,
  GraphQLRequestMetrics,
  HeaderMap,
} from '../../..';
import {
  ApolloServerPluginUsageReportingOptions,
  ApolloServerPluginUsageReporting,
} from '../../../plugin/usageReporting';
import {
  ApolloServerPluginCacheControlDisabled,
  ApolloServerPluginUsageReportingDisabled,
} from '../../../plugin/disabled';
import { describe, it, expect, afterEach } from '@jest/globals';

const quietLogger = loglevel.getLogger('quiet');
quietLogger.setLevel(loglevel.levels.WARN);

describe('end-to-end', () => {
  async function runTest({
    pluginOptions = {},
    query,
    operationName,
    schemaShouldBeInstrumented = true,
  }: {
    pluginOptions?: ApolloServerPluginUsageReportingOptions<any>;
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

    nockScope
      .post('/api/ingress/traces')
      .reply(200, (_: any, requestBody: string) => {
        reportResolver(requestBody);
        return 'ok';
      });

    const schema = addMocksToSchema({
      schema: makeExecutableSchema({ typeDefs }),
    });

    const server = new ApolloServer({
      schema,
      apollo: {
        key: 'some-key',
        graphRef: 'graph@current',
      },
      plugins: [
        ApolloServerPluginCacheControlDisabled(),
        ApolloServerPluginUsageReporting({
          ...pluginOptions,
          sendReportsImmediately: true,
          logger: quietLogger,
        }),
        {
          async requestDidStart() {
            return {
              async willSendResponse({ response, metrics }) {
                if (!('singleResult' in response.body)) {
                  throw Error('expected single result');
                }
                if (!response.body.singleResult.extensions) {
                  response.body.singleResult.extensions = {};
                }
                response.body.singleResult.extensions.__metrics__ = metrics;
              },
            };
          },
        },
      ],
    });

    await server.start();

    const response = await server.executeOperation({
      query: query ?? defaultQuery,
      // If operation name is specified use it. If it is specified as null convert it to
      // undefined because graphqlRequest expects string | undefined
      operationName:
        operationName === undefined ? 'q' : operationName || undefined,
      extensions: {
        clientName: 'testing suite',
      },
    });

    // In addition to the fact that we generally want to stop things that we
    // start, this will flush the report. You might think sendReportsImmediately
    // would mean you wouldn't need to do that, but if the report only contains
    // operationCount it's helpful.
    await server.stop();

    const report = await reportPromise.then((reportBody: string) => {
      // nock returns binary bodies as hex strings
      const gzipReportBuffer = Buffer.from(reportBody, 'hex');
      const reportBuffer = gunzipSync(gzipReportBuffer);
      return Report.decode(reportBuffer);
    });

    nockScope.done();

    expect(pluginsEnabledForSchemaResolvers(schema)).toBe(
      schemaShouldBeInstrumented,
    );

    if (!('singleResult' in response.body)) {
      throw Error('expected single result');
    }

    return {
      report,
      metrics: response.body.singleResult.extensions!
        .__metrics__ as GraphQLRequestMetrics,
    };
  }

  it('basic tracing', async () => {
    const { report } = await runTest({});

    expect(Object.keys(report.tracesPerQuery)).toHaveLength(1);
    expect(Object.keys(report.tracesPerQuery)[0]).toMatch(/^# q\n/);
    const traces = Object.values(report.tracesPerQuery)[0]!.trace;
    expect(traces).toHaveLength(1);
    expect(
      (traces![0] as ITrace).root!.child!.some(
        ({ responseName }) => responseName === 'aBoolean',
      ),
    ).toBeTruthy();
  });

  it('sendTraces: false', async () => {
    const { report } = await runTest({ pluginOptions: { sendTraces: false } });

    expect(Object.keys(report.tracesPerQuery)).toHaveLength(1);
    expect(Object.keys(report.tracesPerQuery)[0]).toMatch(/^# q\n/);
    const tracesAndStats = Object.values(report.tracesPerQuery)[0]!;
    expect(tracesAndStats.trace).toHaveLength(0);
    expect(tracesAndStats.statsWithContext).toHaveLength(1);
    const contextualizedStats = (
      tracesAndStats.statsWithContext as ContextualizedStats[]
    )[0]!;
    expect(contextualizedStats.queryLatencyStats?.requestCount).toBe(1);
    expect(
      contextualizedStats.perTypeStat['User'].perFieldStat?.['name']
        .observedExecutionCount,
    ).toBe(1);
  });

  [
    {
      testName: 'fails parse for non-parsable gql',
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
      const queryEntries = Object.entries(report.tracesPerQuery);
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
      // Since we only ever run a single operation, the cache in
      // defaultSendOperationsAsTrace should always be empty and we should
      // always send this as a trace, not stats. This is even the case if it's a
      // pre-execution error, because the error itself is an interesting thing
      // to send in a trace even if the tree part of the trace is trivial.
      expect(operationsSentAsTrace).toBe(1);
      expect(operationsSentAsStats).toBe(0);
    }),
  );

  describe('includeRequest', () => {
    it('include based on operation name', async () => {
      const { report, metrics } = await runTest({
        pluginOptions: {
          includeRequest: async (request: any) => {
            await new Promise<void>((res) => setTimeout(() => res(), 1));
            return request.request.operationName === 'q';
          },
        },
        schemaShouldBeInstrumented: true,
      });
      expect(Object.keys(report.tracesPerQuery)).toHaveLength(1);
      expect(metrics.captureTraces).toBe(true);
    });
    it('exclude based on operation name', async () => {
      const { metrics, report } = await runTest({
        pluginOptions: {
          includeRequest: async (request: any) => {
            await new Promise<void>((res) => setTimeout(() => res(), 1));
            return request.request.operationName === 'not_q';
          },
        },
        schemaShouldBeInstrumented: false,
      });
      expect(metrics.captureTraces).toBeFalsy();
      expect(report.operationCount).toBe(1);
      expect(Object.keys(report.tracesPerQuery)).toHaveLength(0);
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
      const { report, metrics } = await runTest({
        pluginOptions: {
          fieldLevelInstrumentation: async (
            requestContext: GraphQLRequestContextDidResolveOperation<any>,
          ) => {
            await new Promise<void>((res) => setTimeout(() => res(), 1));
            return requestContext.request.operationName === 'q';
          },
        },
      });
      expect(metrics.captureTraces).toBe(true);
      expect(Object.keys(report.tracesPerQuery)).toHaveLength(1);
      expect(
        containsFieldExecutionData(Object.values(report.tracesPerQuery)[0]!),
      ).toBe(true);
    });

    it('exclude based on operation name', async () => {
      const { report, metrics } = await runTest({
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
      expect(metrics.captureTraces).toBe(false);
      expect(Object.keys(report.tracesPerQuery)).toHaveLength(1);
      expect(
        containsFieldExecutionData(Object.values(report.tracesPerQuery)[0]!),
      ).toBe(false);
    });

    describe('passing a number', () => {
      afterEach(() => resetMockRandom());

      const fieldLevelInstrumentation = 0.015;
      it('RNG returns a small number', async () => {
        mockRandom(fieldLevelInstrumentation * 0.99);
        const { report, metrics } = await runTest({
          pluginOptions: {
            fieldLevelInstrumentation,
            // Want to see this in stats so we can see the scaling.
            experimental_sendOperationAsTrace: () => false,
          },
          schemaShouldBeInstrumented: true,
        });
        expect(metrics.captureTraces).toBe(true);
        expect(Object.keys(report.tracesPerQuery)).toHaveLength(1);
        expect(
          containsFieldExecutionData(Object.values(report.tracesPerQuery)[0]!),
        ).toBe(true);
        const statsWithContext = (
          Object.values(report.tracesPerQuery)[0]!
            .statsWithContext as ContextualizedStats[]
        )[0];
        expect(
          statsWithContext.queryLatencyStats
            ?.requestsWithoutFieldInstrumentation,
        ).toBe(0);
        const fieldStat =
          statsWithContext.perTypeStat['Query'].perFieldStat!['aBoolean'];
        expect(fieldStat.observedExecutionCount).toBe(1);
        expect(fieldStat.estimatedExecutionCount).toBe(
          Math.floor(1 / fieldLevelInstrumentation),
        );
        // There should be exactly one latency bucket used, and its size should
        // be scaled in the same way as estimatedExecutionCount. (The
        // representation of duration histograms uses 0 and negative numbers for
        // empty buckets; we're not going to stress about making sure the
        // correct bucket is the one that's full.)
        expect(
          (fieldStat.latencyCount as number[]).filter((n) => n > 0),
        ).toStrictEqual([Math.floor(1 / fieldLevelInstrumentation)]);
      });
      it('RNG returns a large number', async () => {
        mockRandom(fieldLevelInstrumentation * 1.01);
        const { report, metrics } = await runTest({
          pluginOptions: {
            fieldLevelInstrumentation,
          },
          schemaShouldBeInstrumented: false,
        });
        expect(metrics.captureTraces).toBe(false);
        expect(Object.keys(report.tracesPerQuery)).toHaveLength(1);
        expect(
          containsFieldExecutionData(Object.values(report.tracesPerQuery)[0]!),
        ).toBe(false);
      });
    });
  });
});

describe('sendHeaders makeHTTPRequestHeaders helper', () => {
  const headers = new HeaderMap([
    ['name', 'value'],
    ['authorization', 'blahblah'], // THIS SHOULD NEVER BE SENT
  ]);

  const headersOutput = { name: new Trace.HTTP.Values({ value: ['value'] }) };

  function makeTestHTTP(): Trace.HTTP {
    return new Trace.HTTP({
      method: Trace.HTTP.Method.UNKNOWN,
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
    const except: string[] = ['name', 'not-in-headers'];
    const http = makeTestHTTP();
    makeHTTPRequestHeaders(http, headers, { exceptNames: except });
    expect(http.requestHeaders).toEqual({});
  });

  it('test sendHeaders.onlyNames', () => {
    // headers that should never be sent (such as "authorization") should still be removed if in includeHeaders
    const include: string[] = ['name', 'authorization', 'not-in-headers'];
    const http = makeTestHTTP();
    makeHTTPRequestHeaders(http, headers, { onlyNames: include });
    expect(http.requestHeaders).toEqual(headersOutput);
  });

  it('authorization, cookie, and set-cookie headers should never be sent', () => {
    const http = makeTestHTTP();
    const headersWithCookies = new HeaderMap([
      ...headers,
      ['cookie', 'blahblah'],
      ['set-cookie', 'blahblah'],
    ]);
    // double check we didn't mess up the HeaderMap constructor :)
    expect(headersWithCookies.get('cookie')).toBe('blahblah');

    makeHTTPRequestHeaders(http, headersWithCookies, { all: true });
    expect(http.requestHeaders['authorization']).toBe(undefined);
    expect(http.requestHeaders['cookie']).toBe(undefined);
    expect(http.requestHeaders['set-cookie']).toBe(undefined);
  });
});

it('cannot combine enabling with disabling', async () => {
  const server = new ApolloServer({
    typeDefs: 'type Query { x: ID }',
    plugins: [
      ApolloServerPluginUsageReporting(),
      ApolloServerPluginUsageReportingDisabled(),
    ],
  });
  await expect(server.start()).rejects.toThrow(
    'You have tried to install both ApolloServerPluginUsageReporting ' +
      'and ApolloServerPluginUsageReportingDisabled in your server. Please ' +
      'choose whether or not you want to disable the feature and install the ' +
      'appropriate plugin for your use case.',
  );
});
