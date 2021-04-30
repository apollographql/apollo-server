import { Trace } from 'apollo-reporting-protobuf';
import { dateToProtoTimestamp } from '../../traceTreeBuilder';
import { OurContextualizedStats, SizeEstimator } from '../stats';
import { DurationHistogram } from '../durationHistogram';

const statsContext = {
  clientReferenceId: 'reference',
  clientVersion: 'version',
};

const baseDate = new Date();
const duration = 30 * 1000;
const baseTrace = new Trace({
  startTime: dateToProtoTimestamp(baseDate),
  endTime: dateToProtoTimestamp(new Date(baseDate.getTime() + duration)),
  durationNs: duration,
  root: null,
  signature: 'signature',
  details: null,
});
// TODO: add a federated trace
describe('Check query latency stats when', () => {
  it('adding a single trace', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(baseTrace, new SizeEstimator());
    expect(contextualizedStats.queryLatencyStats.requestCount).toBe(1);
    expect(contextualizedStats.queryLatencyStats.latencyCount).toStrictEqual(
      new DurationHistogram().incrementDuration(duration),
    );
    expect(contextualizedStats.queryLatencyStats.requestsWithErrorsCount).toBe(
      0,
    );
    expect(contextualizedStats).toMatchSnapshot();
  });
  it('adding a fully cached trace', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(
      new Trace({
        ...baseTrace,
        fullQueryCacheHit: true,
      }),
      new SizeEstimator(),
    );
    expect(contextualizedStats.queryLatencyStats.requestCount).toBe(1);
    expect(contextualizedStats.queryLatencyStats.cacheHits).toBe(1);
    expect(
      contextualizedStats.queryLatencyStats.cacheLatencyCount,
    ).toStrictEqual(new DurationHistogram().incrementDuration(duration));
    expect(contextualizedStats).toMatchSnapshot();
  });
  it('adding a public cached trace', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(
      new Trace({
        ...baseTrace,
        fullQueryCacheHit: false,
        cachePolicy: {
          scope: Trace.CachePolicy.Scope.PRIVATE,
          maxAgeNs: 1000,
        },
      }),
      new SizeEstimator(),
    );
    expect(contextualizedStats.queryLatencyStats.requestCount).toBe(1);
    expect(
      contextualizedStats.queryLatencyStats.privateCacheTtlCount,
    ).toStrictEqual(new DurationHistogram().incrementDuration(1000));
    expect(contextualizedStats).toMatchSnapshot();
  });
  it('adding a private cached trace', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(
      new Trace({
        ...baseTrace,
        fullQueryCacheHit: false,
        cachePolicy: {
          scope: Trace.CachePolicy.Scope.PUBLIC,
          maxAgeNs: 1000,
        },
      }),
      new SizeEstimator(),
    );
    expect(contextualizedStats.queryLatencyStats.requestCount).toBe(1);
    expect(
      contextualizedStats.queryLatencyStats.publicCacheTtlCount,
    ).toStrictEqual(new DurationHistogram().incrementDuration(1000));
    expect(contextualizedStats).toMatchSnapshot();
  });
  it('adding a persisted hit trace', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(
      new Trace({
        ...baseTrace,
        persistedQueryHit: true,
      }),
      new SizeEstimator(),
    );
    expect(contextualizedStats.queryLatencyStats.requestCount).toBe(1);
    expect(contextualizedStats.queryLatencyStats.persistedQueryHits).toBe(1);
    expect(contextualizedStats).toMatchSnapshot();
  });
  it('adding a persisted miss trace', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(
      new Trace({
        ...baseTrace,
        persistedQueryRegister: true,
      }),
      new SizeEstimator(),
    );
    expect(contextualizedStats.queryLatencyStats.requestCount).toBe(1);
    expect(contextualizedStats.queryLatencyStats.persistedQueryMisses).toBe(1);
    expect(contextualizedStats).toMatchSnapshot();
  });
  it('adding a forbidden trace', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(
      new Trace({
        ...baseTrace,
        forbiddenOperation: true,
      }),
      new SizeEstimator(),
    );
    expect(contextualizedStats.queryLatencyStats.requestCount).toBe(1);
    expect(contextualizedStats.queryLatencyStats.forbiddenOperationCount).toBe(
      1,
    );
    expect(contextualizedStats).toMatchSnapshot();
  });
  it('adding a registered trace', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(
      new Trace({
        ...baseTrace,
        registeredOperation: true,
      }),
      new SizeEstimator(),
    );
    expect(contextualizedStats.queryLatencyStats.requestCount).toBe(1);
    expect(contextualizedStats.queryLatencyStats.registeredOperationCount).toBe(
      1,
    );
    expect(contextualizedStats).toMatchSnapshot();
  });
  it('adding an errored trace ', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(
      new Trace({
        ...baseTrace,
        registeredOperation: true,
        root: {
          child: [
            {
              responseName: 'user',
              parentType: 'Query',
              type: 'User!',
              error: [
                {
                  message: 'error 1',
                },
              ],
            },
          ],
        },
      }),
      new SizeEstimator(),
    );
    expect(contextualizedStats.queryLatencyStats.requestCount).toBe(1);
    expect(
      contextualizedStats.queryLatencyStats.rootErrorStats.children['user']
        .requestsWithErrorsCount,
    ).toBe(1);
    expect(
      contextualizedStats.queryLatencyStats.rootErrorStats.children['user']
        .errorsCount,
    ).toBe(1);
    expect(contextualizedStats).toMatchSnapshot();
  });
  it('merging errored traces', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(
      new Trace({
        ...baseTrace,
        registeredOperation: true,
        root: {
          child: [
            {
              responseName: 'user',
              parentType: 'Query',
              type: 'User!',
              error: [
                {
                  message: 'error 1',
                },
              ],
            },
          ],
        },
      }),
      new SizeEstimator(),
    );
    contextualizedStats.addTrace(
      new Trace({
        ...baseTrace,
        registeredOperation: true,
        root: {
          child: [
            {
              responseName: 'account',
              parentType: 'Query',
              type: 'Account!',
              child: [
                {
                  responseName: 'name',
                  parentType: 'Account',
                  type: 'String!',
                  error: [
                    {
                      message: 'has error',
                    },
                  ],
                },
              ],
            },
          ],
        },
      }),
      new SizeEstimator(),
    );
    for (let _ in [1, 2]) {
      contextualizedStats.addTrace(
        new Trace({
          ...baseTrace,
          registeredOperation: true,
          root: {
            child: [
              {
                responseName: 'user',
                parentType: 'Query',
                type: 'User!',
                child: [
                  {
                    responseName: 'email',
                    parentType: 'User',
                    type: 'String!',
                    error: [
                      {
                        message: 'has error',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }),
        new SizeEstimator(),
      );
    }

    expect(contextualizedStats.queryLatencyStats.requestCount).toBe(4);
    expect(
      contextualizedStats.queryLatencyStats.rootErrorStats.children['user']
        .requestsWithErrorsCount,
    ).toBe(1);
    expect(
      contextualizedStats.queryLatencyStats.rootErrorStats.children['user']
        .errorsCount,
    ).toBe(1);
    expect(
      contextualizedStats.queryLatencyStats.rootErrorStats.children['user']
        .children['email'].requestsWithErrorsCount,
    ).toBe(2);
    expect(
      contextualizedStats.queryLatencyStats.rootErrorStats.children['user']
        .children['email'].errorsCount,
    ).toBe(2);
    expect(
      contextualizedStats.queryLatencyStats.rootErrorStats.children['account']
        .requestsWithErrorsCount,
    ).toBeFalsy();
    expect(
      contextualizedStats.queryLatencyStats.rootErrorStats.children['account']
        .errorsCount,
    ).toBeFalsy();
    expect(
      contextualizedStats.queryLatencyStats.rootErrorStats.children['account']
        .children['name'].requestsWithErrorsCount,
    ).toBe(1);
    expect(
      contextualizedStats.queryLatencyStats.rootErrorStats.children['account']
        .children['name'].errorsCount,
    ).toBe(1);
    expect(contextualizedStats).toMatchSnapshot();
  });
  it('merging non-errored traces', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    const sizeEstimator = new SizeEstimator();
    contextualizedStats.addTrace(baseTrace, sizeEstimator);
    contextualizedStats.addTrace(baseTrace, sizeEstimator);
    contextualizedStats.addTrace(
      new Trace({
        ...baseTrace,
        fullQueryCacheHit: false,
        cachePolicy: {
          scope: Trace.CachePolicy.Scope.PRIVATE,
          maxAgeNs: 1000,
        },
      }),
      sizeEstimator,
    );
    contextualizedStats.addTrace(
      new Trace({
        ...baseTrace,
        fullQueryCacheHit: false,
        cachePolicy: {
          scope: Trace.CachePolicy.Scope.PRIVATE,
          maxAgeNs: 1000,
        },
      }),
      sizeEstimator,
    );
    for (let _ in [1, 2]) {
      contextualizedStats.addTrace(
        new Trace({
          ...baseTrace,
          fullQueryCacheHit: true,
        }),
        sizeEstimator,
      );
    }
    expect(contextualizedStats.queryLatencyStats.requestCount).toBe(6);
    expect(contextualizedStats.queryLatencyStats.latencyCount).toStrictEqual(
      new DurationHistogram()
        .incrementDuration(duration)
        .incrementDuration(duration)
        .incrementDuration(duration)
        .incrementDuration(duration),
    );
    expect(contextualizedStats.queryLatencyStats.requestsWithErrorsCount).toBe(
      0,
    );
    expect(
      contextualizedStats.queryLatencyStats.privateCacheTtlCount,
    ).toStrictEqual(
      new DurationHistogram().incrementDuration(1000).incrementDuration(1000),
    );
    expect(contextualizedStats.queryLatencyStats.cacheHits).toBe(2);
    expect(
      contextualizedStats.queryLatencyStats.cacheLatencyCount,
    ).toStrictEqual(
      new DurationHistogram()
        .incrementDuration(duration)
        .incrementDuration(duration),
    );
    expect(contextualizedStats).toMatchSnapshot();
  });
});

describe('Check type stats', () => {
  const trace = new Trace({
    ...baseTrace,
    registeredOperation: true,
    root: {
      child: [
        {
          originalFieldName: 'user',
          responseName: 'user',
          parentType: 'Query',
          type: 'User!',
          startTime: 0,
          endTime: 100 * 1000,
          child: [
            {
              originalFieldName: 'email',
              responseName: 'email',
              parentType: 'User',
              type: 'String!',
              startTime: 1000,
              endTime: 1005,
            },
            {
              originalFieldName: 'friends',
              responseName: 'friends',
              parentType: 'User',
              type: '[String!]!',
              startTime: 1000,
              endTime: 1005,
            },
          ],
        },
      ],
    },
  });

  const federatedTrace = new Trace({
    ...baseTrace,
    registeredOperation: true,
    queryPlan: new Trace.QueryPlanNode({
      fetch: new Trace.QueryPlanNode.FetchNode({
        serviceName: 'A',
        trace: trace,
        sentTime: dateToProtoTimestamp(baseDate),
        receivedTime: dateToProtoTimestamp(
          new Date(baseDate.getTime() + duration),
        ),
      }),
    }),
  });

  const errorTrace = new Trace({
    ...baseTrace,
    registeredOperation: true,
    root: {
      child: [
        {
          originalFieldName: 'user',
          responseName: 'user',
          parentType: 'Query',
          type: 'User!',
          startTime: 0,
          endTime: 100 * 1000,
          child: [
            {
              originalFieldName: 'email',
              responseName: 'email',
              parentType: 'User',
              type: 'String!',
              startTime: 1000,
              endTime: 1005,
              error: [{ message: 'error message' }, { message: 'error2' }],
            },
            {
              originalFieldName: 'friends',
              responseName: 'friends',
              parentType: 'User',
              type: '[String!]!',
              startTime: 1000,
              endTime: 1005,
            },
          ],
        },
      ],
    },
  });

  it('add single non-federated trace', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(trace, new SizeEstimator());
    expect(contextualizedStats).toMatchSnapshot();
  });
  it('add multiple non-federated trace', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(trace, new SizeEstimator());
    contextualizedStats.addTrace(trace, new SizeEstimator());
    expect(contextualizedStats).toMatchSnapshot();
  });

  it('add multiple federated trace', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(federatedTrace, new SizeEstimator());
    contextualizedStats.addTrace(federatedTrace, new SizeEstimator());
    expect(contextualizedStats).toMatchSnapshot();
  });
  it('add multiple errored traces trace', () => {
    const contextualizedStats = new OurContextualizedStats(statsContext);
    contextualizedStats.addTrace(errorTrace, new SizeEstimator());
    contextualizedStats.addTrace(errorTrace, new SizeEstimator());
    expect(contextualizedStats).toMatchSnapshot();
  });
});
