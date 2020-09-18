import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
import { graphql } from 'graphql';
import { Request } from 'node-fetch';
import {
  makeHTTPRequestHeaders,
  ApolloServerPluginUsageReporting,
} from '../plugin';
import { Headers } from 'apollo-server-env';
import { Trace, Report } from 'apollo-reporting-protobuf';
import pluginTestHarness from 'apollo-server-core/dist/utils/pluginTestHarness';
import nock from 'nock';
import { gunzipSync } from 'zlib';
import { ApolloServerPluginUsageReportingOptions } from '../options';

describe('end-to-end', () => {
  async function runTest({
    pluginOptions = {},
    expectReport = true,
  }: {
    pluginOptions?: ApolloServerPluginUsageReportingOptions<any>;
    expectReport?: boolean;
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

    const query = `
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
    const schema = makeExecutableSchema({ typeDefs });
    addMockFunctionsToSchema({ schema });

    const pluginInstance = ApolloServerPluginUsageReporting({
      ...pluginOptions,
      sendReportsImmediately: true,
    });

    const context = await pluginTestHarness({
      pluginInstance,
      schema,
      graphqlRequest: {
        query,
        operationName: 'q',
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
    return { report, context };
  }

  it('basic tracing', async () => {
    const { report } = await runTest({});

    expect(Object.keys(report!.tracesPerQuery)).toHaveLength(1);
    expect(Object.keys(report!.tracesPerQuery)[0]).toMatch(/^# q\n/);
    const traces = Object.values(report!.tracesPerQuery)[0].trace;
    expect(traces).toHaveLength(1);
    expect(
      traces![0].root!.child!.some(
        ({ responseName }) => responseName === 'aBoolean',
      ),
    ).toBeTruthy();
  });

  describe('includeRequest', () => {
    it('include based on operation name', async () => {
      const { report, context } = await runTest({
        pluginOptions: {
          includeRequest: async (request: any) => {
            await new Promise((res) => setTimeout(() => res(), 1));
            return request.request.operationName === 'q';
          },
        },
      });
      expect(Object.keys(report!.tracesPerQuery)).toHaveLength(1);
      expect(context.metrics.captureTraces).toBeTruthy();
    });
    it('exclude based on operation name', async () => {
      const { context } = await runTest({
        pluginOptions: {
          includeRequest: async (request: any) => {
            await new Promise((res) => setTimeout(() => res(), 1));
            return request.request.operationName === 'not_q';
          },
        },
        expectReport: false,
      });
      expect(context.metrics.captureTraces).toBeFalsy();
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
