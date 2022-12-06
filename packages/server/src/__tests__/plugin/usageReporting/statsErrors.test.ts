import {
  ApolloGateway,
  IntrospectAndCompose,
  ServiceEndpointDefinition,
} from '@apollo/gateway';
import { buildSubgraphSchema } from '@apollo/subgraph';
import { IContextualizedStats, Report } from '@apollo/usage-reporting-protobuf';
import type { Logger } from '@apollo/utils.logger';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import gql from 'graphql-tag';
import nock from 'nock';
import { gunzipSync } from 'zlib';
import { ApolloServer } from '../../../ApolloServer';
import type { BaseContext } from '../../../externalTypes';
import { ApolloServerPluginUsageReportingDisabled } from '../../../plugin/disabled';
import {
  ApolloServerPluginUsageReporting,
  ApolloServerPluginUsageReportingOptions,
} from '../../../plugin/usageReporting';
import { startStandaloneServer } from '../../../standalone';
import { HeaderMap } from '../../../utils/HeaderMap';
import { mockLogger } from '../../mockLogger';
import { nockAfterEach, nockBeforeEach } from '../../nockAssertions';

const mockReportingEndpoint = 'https://my-reporting-endpoint.com';

describe('TODO', () => {
  beforeEach(nockBeforeEach);
  afterEach(nockAfterEach);

  it('fieldLevelInstrumentation disabled', async () => {
    const logger = mockLogger();

    const errorFtv1Subgraph = getErrorFtv1Subgraph(logger);
    const errorFtv1SubgraphUrl = await startServer(errorFtv1Subgraph);

    const errorNoFtv1Subgraph = getErrorNoFtv1Subgraph(logger);
    const errorNoFtv1SubgraphUrl = await startServer(errorNoFtv1Subgraph);

    const successSubgraph = getSuccessSubgraph(logger);
    const successSubgraphUrl = await startServer(successSubgraph);

    const gatewayServer = getGatewayServer(
      [
        { name: 'error-ftv1-subgraph', url: errorFtv1SubgraphUrl },
        { name: 'error-no-ftv1-subgraph', url: errorNoFtv1SubgraphUrl },
        { name: 'success-subgraph', url: successSubgraphUrl },
      ],
      logger,
      {
        fieldLevelInstrumentation: 0,
      },
    );
    await startServer(gatewayServer);

    nock(mockReportingEndpoint)
      .post('/api/ingress/traces', (body) => {
        const gzipReportBuffer = Buffer.from(body, 'hex');
        const report = Report.decode(gunzipSync(gzipReportBuffer));
        const { queryLatencyStats, perTypeStat } = (
          report.tracesPerQuery['# -\n{errorFtv1 errorNoFtv1 success}']
            ?.statsWithContext as IContextualizedStats[]
        )[0];
        expect(cleanLatencyCount(queryLatencyStats!)).toMatchInlineSnapshot(`
          {
            "cacheHits": 0,
            "cacheLatencyCount": [],
            "forbiddenOperationCount": 0,
            "latencyCount": [
              "*redacted for snapshot*",
            ],
            "persistedQueryHits": 0,
            "persistedQueryMisses": 0,
            "privateCacheTtlCount": [],
            "publicCacheTtlCount": [],
            "registeredOperationCount": 0,
            "requestCount": 1,
            "requestsWithErrorsCount": 1,
            "requestsWithoutFieldInstrumentation": 1,
            "rootErrorStats": {
              "children": {},
              "errorsCount": 0,
              "requestsWithErrorsCount": 0,
            },
          }
        `);
        expect(perTypeStat).toMatchInlineSnapshot(`{}`);

        return true;
      })
      .reply(200);

    await gatewayServer.executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        method: 'POST',
        headers: new HeaderMap([['content-type', 'application/json']]),
        body: { query: '{ errorFtv1 errorNoFtv1 success }' },
        search: '',
      },
      context: async () => ({}),
    });

    await gatewayServer.stop();
    await errorFtv1Subgraph.stop();
    await errorNoFtv1Subgraph.stop();
    await successSubgraph.stop();
  });

  it('fieldLevelInstrumentation enabled', async () => {
    const logger = mockLogger();

    const errorFtv1Subgraph = getErrorFtv1Subgraph(logger);
    const errorFtv1SubgraphUrl = await startServer(errorFtv1Subgraph);

    const errorNoFtv1Subgraph = getErrorNoFtv1Subgraph(logger);
    const errorNoFtv1SubgraphUrl = await startServer(errorNoFtv1Subgraph);

    const successSubgraph = getSuccessSubgraph(logger);
    const successSubgraphUrl = await startServer(successSubgraph);

    const gatewayServer = getGatewayServer(
      [
        { name: 'error-ftv1-subgraph', url: errorFtv1SubgraphUrl },
        { name: 'error-no-ftv1-subgraph', url: errorNoFtv1SubgraphUrl },
        { name: 'success-subgraph', url: successSubgraphUrl },
      ],
      logger,
      {
        fieldLevelInstrumentation: 1,
      },
    );
    await startServer(gatewayServer);

    nock(mockReportingEndpoint)
      .post('/api/ingress/traces', (body) => {
        const gzipReportBuffer = Buffer.from(body, 'hex');
        const report = Report.decode(gunzipSync(gzipReportBuffer));
        const { queryLatencyStats, perTypeStat } = (
          report.tracesPerQuery['# -\n{errorFtv1 errorNoFtv1 success}']
            ?.statsWithContext as IContextualizedStats[]
        )[0];

        expect(cleanLatencyCount(queryLatencyStats!)).toMatchInlineSnapshot(`
          {
            "cacheHits": 0,
            "cacheLatencyCount": [],
            "forbiddenOperationCount": 0,
            "latencyCount": [
              "*redacted for snapshot*",
            ],
            "persistedQueryHits": 0,
            "persistedQueryMisses": 0,
            "privateCacheTtlCount": [],
            "publicCacheTtlCount": [],
            "registeredOperationCount": 0,
            "requestCount": 1,
            "requestsWithErrorsCount": 1,
            "requestsWithoutFieldInstrumentation": 0,
            "rootErrorStats": {
              "children": {
                "service:error-ftv1-subgraph": {
                  "children": {
                    "errorFtv1": {
                      "children": {},
                      "errorsCount": 1,
                      "requestsWithErrorsCount": 1,
                    },
                  },
                  "errorsCount": 0,
                  "requestsWithErrorsCount": 0,
                },
              },
              "errorsCount": 0,
              "requestsWithErrorsCount": 0,
            },
          }
        `);
        expect(cleanLatencyCount(perTypeStat!)).toMatchInlineSnapshot(`
          {
            "Query": {
              "perFieldStat": {
                "errorFtv1": {
                  "errorsCount": 1,
                  "estimatedExecutionCount": 1,
                  "latencyCount": [
                    "*redacted for snapshot*",
                  ],
                  "observedExecutionCount": 1,
                  "requestsWithErrorsCount": 1,
                  "returnType": "String",
                },
                "success": {
                  "errorsCount": 0,
                  "estimatedExecutionCount": 1,
                  "latencyCount": [
                    "*redacted for snapshot*",
                  ],
                  "observedExecutionCount": 1,
                  "requestsWithErrorsCount": 0,
                  "returnType": "String",
                },
              },
            },
          }
        `);

        return true;
      })
      .reply(200);

    await gatewayServer.executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        method: 'POST',
        headers: new HeaderMap([['content-type', 'application/json']]),
        body: { query: '{ errorFtv1 errorNoFtv1 success }' },
        search: '',
      },
      context: async () => ({}),
    });

    await gatewayServer.stop();
    await errorFtv1Subgraph.stop();
    await errorNoFtv1Subgraph.stop();
    await successSubgraph.stop();
  });
});

function getErrorNoFtv1Subgraph(logger: Logger) {
  const subgraphServer = new ApolloServer<BaseContext>({
    schema: buildSubgraphSchema([
      {
        typeDefs: gql`
          #graphql
          type Query {
            errorNoFtv1: String
          }
        `,
        resolvers: {
          Query: {
            errorNoFtv1: () => {
              throw new Error('errorNoFtv1');
            },
          },
        },
      },
    ]),
    plugins: [
      ApolloServerPluginUsageReportingDisabled(),
      {
        // simulate a subgraph that ignores the header by just deleting it
        // from the request before the inline trace plugin sees it
        async requestDidStart({ request }) {
          request.http?.headers.delete('apollo-federation-include-trace');
        },
      },
    ],
    logger,
  });

  return subgraphServer;
}

function getErrorFtv1Subgraph(logger: Logger) {
  const subgraphServer = new ApolloServer<BaseContext>({
    schema: buildSubgraphSchema([
      {
        typeDefs: gql`
          #graphql
          type Query {
            errorFtv1: String
          }
        `,
        resolvers: {
          Query: {
            errorFtv1: () => {
              throw new Error('errorFtv1');
            },
          },
        },
      },
    ]),
    plugins: [ApolloServerPluginUsageReportingDisabled()],
    logger,
  });

  return subgraphServer;
}

function getSuccessSubgraph(logger: Logger) {
  const subgraphServer = new ApolloServer<BaseContext>({
    schema: buildSubgraphSchema([
      {
        typeDefs: gql`
          #graphql
          type Query {
            success: String
          }
        `,
        resolvers: {
          Query: {
            success: () => {
              return 'success!';
            },
          },
        },
      },
    ]),
    plugins: [ApolloServerPluginUsageReportingDisabled()],
    logger,
  });

  return subgraphServer;
}

function getGatewayServer(
  subgraphs: ServiceEndpointDefinition[],
  logger: Logger,
  usageReportingConfig?: ApolloServerPluginUsageReportingOptions<BaseContext>,
) {
  return new ApolloServer({
    gateway: new ApolloGateway({
      supergraphSdl: new IntrospectAndCompose({
        subgraphs,
      }),
      logger,
    }),
    apollo: { key: 'my-apollo-key', graphRef: 'my-graph@current' },
    logger,
    plugins: [
      ApolloServerPluginUsageReporting({
        endpointUrl: mockReportingEndpoint,
        experimental_sendOperationAsTrace: () => false,
        ...usageReportingConfig,
      }),
    ],
  });
}

async function startServer(server: ApolloServer) {
  const { url } = await startStandaloneServer(server, {
    listen: { port: 0 },
  });
  return url;
}

function cleanLatencyCount(objOrArray: Record<string, any> | any[]): any {
  if (Array.isArray(objOrArray)) {
    return objOrArray.map(cleanLatencyCount);
  }

  if (typeof objOrArray === 'object') {
    return Object.fromEntries(
      Object.entries(objOrArray).map(([key, value]) => {
        if (key === 'latencyCount') {
          return ['latencyCount', ['*redacted for snapshot*']];
        }
        return [key, cleanLatencyCount(value)];
      }),
    );
  }

  return objOrArray;
}
