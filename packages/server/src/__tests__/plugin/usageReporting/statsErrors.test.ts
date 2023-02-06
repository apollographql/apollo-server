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

describe('Error stats + `fieldLevelInstrumentation` (or non-ftv1 subgraphs)', () => {
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
        const statsKey = Object.keys(report.tracesPerQuery)[0];
        const { queryLatencyStats, perTypeStat } = (
          report.tracesPerQuery[statsKey]
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
                "service:error-no-ftv1-subgraph": {
                  "children": {
                    "_entities": {
                      "children": {
                        "color": {
                          "children": {
                            "blueErrorNoFtv1": {
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
                    "errorNoFtv1": {
                      "children": {},
                      "errorsCount": 1,
                      "requestsWithErrorsCount": 1,
                    },
                    "productsWithErrorsNoFtv1": {
                      "children": {
                        "color": {
                          "children": {
                            "blueErrorNoFtv1": {
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
        expect(perTypeStat).toMatchInlineSnapshot(`{}`);

        return true;
      })
      .reply(200);

    await gatewayServer.executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        method: 'POST',
        headers: new HeaderMap([['content-type', 'application/json']]),
        body: {
          query: `{
            errorFtv1
            errorNoFtv1
            productsWithErrorsNoFtv1 {
              id
              type
              weight
              color {
                blueErrorNoFtv1
                green
                red
              }
            }
            productsWithFtv1Errors {
              id
              type
              weight
              color {
                blueErrorNoFtv1
                green
                red
              }
            }
            success
          }`,
        },
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
        const statsKey = Object.keys(report.tracesPerQuery)[0];
        const { queryLatencyStats, perTypeStat } = (
          report.tracesPerQuery[statsKey]
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
                "service:error-no-ftv1-subgraph": {
                  "children": {
                    "_entities": {
                      "children": {
                        "color": {
                          "children": {
                            "blueErrorNoFtv1": {
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
                    "errorNoFtv1": {
                      "children": {},
                      "errorsCount": 1,
                      "requestsWithErrorsCount": 1,
                    },
                    "productsWithErrorsNoFtv1": {
                      "children": {
                        "color": {
                          "children": {
                            "blueErrorNoFtv1": {
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
            "Product": {
              "perFieldStat": {
                "id": {
                  "errorsCount": 0,
                  "estimatedExecutionCount": 1,
                  "latencyCount": [
                    "*redacted for snapshot*",
                  ],
                  "observedExecutionCount": 1,
                  "requestsWithErrorsCount": 0,
                  "returnType": "String!",
                },
                "type": {
                  "errorsCount": 0,
                  "estimatedExecutionCount": 1,
                  "latencyCount": [
                    "*redacted for snapshot*",
                  ],
                  "observedExecutionCount": 1,
                  "requestsWithErrorsCount": 0,
                  "returnType": "String!",
                },
              },
            },
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
                "productsWithFtv1Errors": {
                  "errorsCount": 0,
                  "estimatedExecutionCount": 1,
                  "latencyCount": [
                    "*redacted for snapshot*",
                  ],
                  "observedExecutionCount": 1,
                  "requestsWithErrorsCount": 0,
                  "returnType": "[Product!]!",
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
        body: {
          query: `{
          errorFtv1
          errorNoFtv1
          productsWithErrorsNoFtv1 {
            id
            type
            weight
            color {
              blueErrorNoFtv1
              green
              red
            }
          }
          productsWithFtv1Errors {
            id
            type
            weight
            color {
              blueErrorNoFtv1
              green
              red
            }
          }
          success
        }`,
        },
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
          type Query {
            errorNoFtv1: String
            productsWithErrorsNoFtv1: [Product!]!
          }

          type Product @key(fields: "id") {
            id: String!
            weight: Float!
            color: Color!
          }

          type Color {
            red: Float!
            green: Float!
            blueErrorNoFtv1: Float!
          }
        `,
        resolvers: {
          Query: {
            errorNoFtv1: () => {
              throw new Error('errorNoFtv1');
            },
            productsWithErrorsNoFtv1: () => {
              return [{ id: '1' }];
            },
          },
          Product: {
            id: () => '1',
            weight: () => 2,
            color: () => {
              return {};
            },
            __resolveReference() {
              return { id: '1' };
            },
          },
          Color: {
            red: () => 255,
            green: () => 255,
            blueErrorNoFtv1: () => {
              throw new Error('Color.blue no ftv1 error');
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
          type Query {
            errorFtv1: String
            productsWithFtv1Errors: [Product!]!
          }

          type Product @key(fields: "id") {
            id: String!
            type: String!
          }
        `,
        resolvers: {
          Query: {
            errorFtv1: () => {
              throw new Error('errorFtv1');
            },
            productsWithFtv1Errors: () => [{ id: '1' }],
          },
          Product: {
            id: () => '1',
            type: () => 'consumable',
            __resolveReference() {
              return { id: '1' };
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
