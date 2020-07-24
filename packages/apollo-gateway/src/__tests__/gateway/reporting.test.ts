import { gunzipSync } from 'zlib';
import nock from 'nock';
import { GraphQLSchemaModule } from 'apollo-graphql';
import gql from 'graphql-tag';
import { buildFederatedSchema } from '@apollo/federation';
import { ApolloServer } from 'apollo-server';
import { execute, toPromise } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';
import { ApolloGateway } from '../..';
import { Plugin, Config, Refs } from 'pretty-format';
import { Report } from 'apollo-engine-reporting-protobuf';
import { fixtures } from 'apollo-federation-integration-testsuite';

// Normalize specific fields that change often (eg timestamps) to static values,
// to make snapshot testing viable.  (If these helpers are more generally
// useful, they could be moved to a different file.)

const alreadyProcessed = '__already_processed__';

function replaceFieldValuesSerializer(
  replacements: Record<string, any>,
): Plugin {
  const fieldNames = Object.keys(replacements);
  return {
    test(value: any) {
      return (
        value &&
        typeof value === 'object' &&
        !value[alreadyProcessed] &&
        fieldNames.some(n => n in value)
      );
    },

    serialize(
      value: Record<string, any>,
      config: Config,
      indentation: string,
      depth: number,
      refs: Refs,
      printer: any,
    ): string {
      // Clone object so pretty-format doesn't consider it as a circular
      // reference. Put a special (non-enumerable) property on it so that *we*
      // don't reprocess it ourselves.
      const newValue = { ...value };
      Object.defineProperty(newValue, alreadyProcessed, { value: true });
      fieldNames.forEach(fn => {
        if (fn in value) {
          const replacement = replacements[fn];
          if (typeof replacement === 'function') {
            newValue[fn] = replacement(value[fn]);
          } else {
            newValue[fn] = replacement;
          }
        }
      });
      return printer(newValue, config, indentation, depth, refs, printer);
    },
  };
}

expect.addSnapshotSerializer(
  replaceFieldValuesSerializer({
    header: '<HEADER>',
    // We do want to differentiate between zero and non-zero in these numbers.
    durationNs: (v: number) => (v ? 12345 : 0),
    sentTimeOffset: (v: number) => (v ? 23456 : 0),
    // endTime and startTime are annoyingly used both for top-level Timestamps
    // and for node-level nanosecond offsets. The Timestamps will get normalized
    // by the nanos/seconds below.
    startTime: (v: any) => (typeof v === 'string' ? '34567' : v),
    endTime: (v: any) => (typeof v === 'string' ? '45678' : v),
    nanos: 123000000,
    seconds: '1562203363',
  }),
);

async function startFederatedServer(modules: GraphQLSchemaModule[]) {
  const schema = buildFederatedSchema(modules);
  const server = new ApolloServer({ schema });
  const { url } = await server.listen({ port: 0 });
  return { url, server };
}

describe('reporting', () => {
  let backendServers: ApolloServer[];
  let gatewayServer: ApolloServer;
  let gatewayUrl: string;
  let reportPromise: Promise<any>;
  let nockScope: nock.Scope;

  beforeEach(async () => {
    let reportResolver: (report: any) => void;
    reportPromise = new Promise<any>(resolve => {
      reportResolver = resolve;
    });

    nockScope = nock('https://engine-report.apollodata.com')
      .post('/api/ingress/traces')
      .reply(200, (_: any, requestBody: string) => {
        reportResolver(requestBody);
        return 'ok';
      });

    backendServers = [];
    const serviceList = [];
    for (const fixture of fixtures) {
      const { server, url } = await startFederatedServer([fixture]);
      backendServers.push(server);
      serviceList.push({ name: fixture.name, url });
    }

    const gateway = new ApolloGateway({ serviceList });
    const { schema, executor } = await gateway.load();
    gatewayServer = new ApolloServer({
      schema,
      executor,
      engine: {
        apiKey: 'service:foo:bar',
        sendReportsImmediately: true,
      },
    });
    ({ url: gatewayUrl } = await gatewayServer.listen({ port: 0 }));
  });

  afterEach(async () => {
    for (const server of backendServers) {
      await server.stop();
    }
    if (gatewayServer) {
      await gatewayServer.stop();
    }
    nockScope.done();
  });

  it(`queries three services`, async () => {
    const query = gql`
      query {
        me {
          name
        }
        topProducts {
          name
        }
      }
    `;

    const result = await toPromise(
      execute(createHttpLink({ uri: gatewayUrl, fetch: fetch as any }), {
        query,
      }),
    );
    expect(result).toMatchInlineSnapshot(`
                                                                  Object {
                                                                    "data": Object {
                                                                      "me": Object {
                                                                        "name": "Ada Lovelace",
                                                                      },
                                                                      "topProducts": Array [
                                                                        Object {
                                                                          "name": "Table",
                                                                        },
                                                                        Object {
                                                                          "name": "Couch",
                                                                        },
                                                                        Object {
                                                                          "name": "Chair",
                                                                        },
                                                                        Object {
                                                                          "name": "Structure and Interpretation of Computer Programs (1996)",
                                                                        },
                                                                        Object {
                                                                          "name": "Object Oriented Software Construction (1997)",
                                                                        },
                                                                      ],
                                                                    },
                                                                  }
                                        `);
    const reportBody = await reportPromise;
    // nock returns binary bodies as hex strings
    const gzipReportBuffer = Buffer.from(reportBody, 'hex');
    const reportBuffer = gunzipSync(gzipReportBuffer);
    const report = Report.decode(reportBuffer);

    // Some handwritten tests to capture salient properties.
    const statsReportKey = '# -\n{me{name}topProducts{name}}';
    expect(Object.keys(report.tracesPerQuery)).toStrictEqual([statsReportKey]);
    expect(report.tracesPerQuery[statsReportKey]!.trace!.length).toBe(1);
    const trace = report.tracesPerQuery[statsReportKey]!.trace![0]!;
    // In the gateway, the root trace is just an empty node (unless there are errors).
    expect(trace.root!.child).toStrictEqual([]);
    // The query plan has (among other things) a fetch against 'accounts' and a
    // fetch against 'product'.
    expect(trace.queryPlan).toBeTruthy();
    const queryPlan = trace.queryPlan!;
    expect(queryPlan.parallel).toBeTruthy();
    expect(queryPlan.parallel!.nodes![0]!.fetch!.serviceName).toBe('accounts');
    expect(
      queryPlan.parallel!.nodes![0]!.fetch!.trace!.root!.child![0]!
        .responseName,
    ).toBe('me');
    expect(queryPlan.parallel!.nodes![1]!.sequence).toBeTruthy();
    expect(
      queryPlan.parallel!.nodes![1]!.sequence!.nodes![0]!.fetch!.serviceName,
    ).toBe('product');
    expect(
      queryPlan.parallel!.nodes![1]!.sequence!.nodes![0]!.fetch!.trace!.root!
        .child![0].responseName,
    ).toBe('topProducts');

    expect(report).toMatchInlineSnapshot(`
      Object {
        "endTime": null,
        "header": "<HEADER>",
        "tracesPerQuery": Object {
          "# -
      {me{name}topProducts{name}}": Object {
            "trace": Array [
              Object {
                "clientName": "",
                "clientReferenceId": "",
                "clientVersion": "",
                "details": Object {},
                "durationNs": 12345,
                "endTime": Object {
                  "nanos": 123000000,
                  "seconds": "1562203363",
                },
                "forbiddenOperation": false,
                "fullQueryCacheHit": false,
                "http": Object {
                  "method": "POST",
                },
                "queryPlan": Object {
                  "parallel": Object {
                    "nodes": Array [
                      Object {
                        "fetch": Object {
                          "receivedTime": Object {
                            "nanos": 123000000,
                            "seconds": "1562203363",
                          },
                          "sentTime": Object {
                            "nanos": 123000000,
                            "seconds": "1562203363",
                          },
                          "sentTimeOffset": 23456,
                          "serviceName": "accounts",
                          "trace": Object {
                            "durationNs": 12345,
                            "endTime": Object {
                              "nanos": 123000000,
                              "seconds": "1562203363",
                            },
                            "root": Object {
                              "child": Array [
                                Object {
                                  "child": Array [
                                    Object {
                                      "endTime": "45678",
                                      "parentType": "User",
                                      "responseName": "name",
                                      "startTime": "34567",
                                      "type": "String",
                                    },
                                  ],
                                  "endTime": "45678",
                                  "parentType": "Query",
                                  "responseName": "me",
                                  "startTime": "34567",
                                  "type": "User",
                                },
                              ],
                            },
                            "startTime": Object {
                              "nanos": 123000000,
                              "seconds": "1562203363",
                            },
                          },
                          "traceParsingFailed": false,
                        },
                      },
                      Object {
                        "sequence": Object {
                          "nodes": Array [
                            Object {
                              "fetch": Object {
                                "receivedTime": Object {
                                  "nanos": 123000000,
                                  "seconds": "1562203363",
                                },
                                "sentTime": Object {
                                  "nanos": 123000000,
                                  "seconds": "1562203363",
                                },
                                "sentTimeOffset": 23456,
                                "serviceName": "product",
                                "trace": Object {
                                  "durationNs": 12345,
                                  "endTime": Object {
                                    "nanos": 123000000,
                                    "seconds": "1562203363",
                                  },
                                  "root": Object {
                                    "child": Array [
                                      Object {
                                        "child": Array [
                                          Object {
                                            "child": Array [
                                              Object {
                                                "endTime": "45678",
                                                "parentType": "Furniture",
                                                "responseName": "name",
                                                "startTime": "34567",
                                                "type": "String",
                                              },
                                            ],
                                            "index": 0,
                                          },
                                          Object {
                                            "child": Array [
                                              Object {
                                                "endTime": "45678",
                                                "parentType": "Furniture",
                                                "responseName": "name",
                                                "startTime": "34567",
                                                "type": "String",
                                              },
                                            ],
                                            "index": 1,
                                          },
                                          Object {
                                            "child": Array [
                                              Object {
                                                "endTime": "45678",
                                                "parentType": "Furniture",
                                                "responseName": "name",
                                                "startTime": "34567",
                                                "type": "String",
                                              },
                                            ],
                                            "index": 2,
                                          },
                                          Object {
                                            "child": Array [
                                              Object {
                                                "endTime": "45678",
                                                "parentType": "Book",
                                                "responseName": "isbn",
                                                "startTime": "34567",
                                                "type": "String!",
                                              },
                                            ],
                                            "index": 3,
                                          },
                                          Object {
                                            "child": Array [
                                              Object {
                                                "endTime": "45678",
                                                "parentType": "Book",
                                                "responseName": "isbn",
                                                "startTime": "34567",
                                                "type": "String!",
                                              },
                                            ],
                                            "index": 4,
                                          },
                                        ],
                                        "endTime": "45678",
                                        "parentType": "Query",
                                        "responseName": "topProducts",
                                        "startTime": "34567",
                                        "type": "[Product]",
                                      },
                                    ],
                                  },
                                  "startTime": Object {
                                    "nanos": 123000000,
                                    "seconds": "1562203363",
                                  },
                                },
                                "traceParsingFailed": false,
                              },
                            },
                            Object {
                              "flatten": Object {
                                "node": Object {
                                  "fetch": Object {
                                    "receivedTime": Object {
                                      "nanos": 123000000,
                                      "seconds": "1562203363",
                                    },
                                    "sentTime": Object {
                                      "nanos": 123000000,
                                      "seconds": "1562203363",
                                    },
                                    "sentTimeOffset": 23456,
                                    "serviceName": "books",
                                    "trace": Object {
                                      "durationNs": 12345,
                                      "endTime": Object {
                                        "nanos": 123000000,
                                        "seconds": "1562203363",
                                      },
                                      "root": Object {
                                        "child": Array [
                                          Object {
                                            "child": Array [
                                              Object {
                                                "child": Array [
                                                  Object {
                                                    "endTime": "45678",
                                                    "parentType": "Book",
                                                    "responseName": "isbn",
                                                    "startTime": "34567",
                                                    "type": "String!",
                                                  },
                                                  Object {
                                                    "endTime": "45678",
                                                    "parentType": "Book",
                                                    "responseName": "title",
                                                    "startTime": "34567",
                                                    "type": "String",
                                                  },
                                                  Object {
                                                    "endTime": "45678",
                                                    "parentType": "Book",
                                                    "responseName": "year",
                                                    "startTime": "34567",
                                                    "type": "Int",
                                                  },
                                                ],
                                                "index": 0,
                                              },
                                              Object {
                                                "child": Array [
                                                  Object {
                                                    "endTime": "45678",
                                                    "parentType": "Book",
                                                    "responseName": "isbn",
                                                    "startTime": "34567",
                                                    "type": "String!",
                                                  },
                                                  Object {
                                                    "endTime": "45678",
                                                    "parentType": "Book",
                                                    "responseName": "title",
                                                    "startTime": "34567",
                                                    "type": "String",
                                                  },
                                                  Object {
                                                    "endTime": "45678",
                                                    "parentType": "Book",
                                                    "responseName": "year",
                                                    "startTime": "34567",
                                                    "type": "Int",
                                                  },
                                                ],
                                                "index": 1,
                                              },
                                            ],
                                            "endTime": "45678",
                                            "parentType": "Query",
                                            "responseName": "_entities",
                                            "startTime": "34567",
                                            "type": "[_Entity]!",
                                          },
                                        ],
                                      },
                                      "startTime": Object {
                                        "nanos": 123000000,
                                        "seconds": "1562203363",
                                      },
                                    },
                                    "traceParsingFailed": false,
                                  },
                                },
                                "responsePath": Array [
                                  Object {
                                    "fieldName": "topProducts",
                                  },
                                  Object {
                                    "fieldName": "@",
                                  },
                                ],
                              },
                            },
                            Object {
                              "flatten": Object {
                                "node": Object {
                                  "fetch": Object {
                                    "receivedTime": Object {
                                      "nanos": 123000000,
                                      "seconds": "1562203363",
                                    },
                                    "sentTime": Object {
                                      "nanos": 123000000,
                                      "seconds": "1562203363",
                                    },
                                    "sentTimeOffset": 23456,
                                    "serviceName": "product",
                                    "trace": Object {
                                      "durationNs": 12345,
                                      "endTime": Object {
                                        "nanos": 123000000,
                                        "seconds": "1562203363",
                                      },
                                      "root": Object {
                                        "child": Array [
                                          Object {
                                            "child": Array [
                                              Object {
                                                "child": Array [
                                                  Object {
                                                    "endTime": "45678",
                                                    "parentType": "Book",
                                                    "responseName": "name",
                                                    "startTime": "34567",
                                                    "type": "String",
                                                  },
                                                ],
                                                "index": 0,
                                              },
                                              Object {
                                                "child": Array [
                                                  Object {
                                                    "endTime": "45678",
                                                    "parentType": "Book",
                                                    "responseName": "name",
                                                    "startTime": "34567",
                                                    "type": "String",
                                                  },
                                                ],
                                                "index": 1,
                                              },
                                            ],
                                            "endTime": "45678",
                                            "parentType": "Query",
                                            "responseName": "_entities",
                                            "startTime": "34567",
                                            "type": "[_Entity]!",
                                          },
                                        ],
                                      },
                                      "startTime": Object {
                                        "nanos": 123000000,
                                        "seconds": "1562203363",
                                      },
                                    },
                                    "traceParsingFailed": false,
                                  },
                                },
                                "responsePath": Array [
                                  Object {
                                    "fieldName": "topProducts",
                                  },
                                  Object {
                                    "fieldName": "@",
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                "registeredOperation": false,
                "root": Object {},
                "startTime": Object {
                  "nanos": 123000000,
                  "seconds": "1562203363",
                },
              },
            ],
          },
        },
      }
    `);
  });
});
