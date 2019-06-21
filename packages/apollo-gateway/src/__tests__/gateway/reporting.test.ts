import path from 'path';
import { gunzipSync } from 'zlib';
import nock from 'nock';
import { GraphQLSchemaModule } from 'apollo-graphql';
import gql from 'graphql-tag';
import { buildFederatedSchema } from '@apollo/federation';
import { ApolloServer } from 'apollo-server';
import { FullTracesReport } from 'apollo-engine-reporting-protobuf';
import { execute, toPromise } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';
import { ApolloGateway } from '../..';

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
    for (const serviceName of [
      'accounts',
      'product',
      'inventory',
      'reviews',
      'books',
    ]) {
      const { server, url } = await startFederatedServer([
        require(path.join(__dirname, '../__fixtures__/schemas', serviceName)),
      ]);
      backendServers.push(server);
      serviceList.push({ name: serviceName, url });
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
    const report = FullTracesReport.decode(reportBuffer);
    const statsReportKey = '# -\n{me{name}topProducts{name}}';
    expect(Object.keys(report.tracesPerQuery)).toStrictEqual([statsReportKey]);
    expect(report.tracesPerQuery[statsReportKey].trace.length).toBe(1);
    const trace = report.tracesPerQuery[statsReportKey].trace[0];

    // In the gateway, the root trace is just an empty node (unless there are errors).
    expect(trace.root.child).toStrictEqual([]);

    // The query plan has (among other things) a fetch against 'accounts' and a
    // fetch against 'product'.
    expect(trace.queryPlan).toBeTruthy();
    const queryPlan = trace.queryPlan!;
    expect(queryPlan.parallel).toBeTruthy();
    expect(queryPlan.parallel!.nodes[0].fetch.serviceName).toBe('accounts');
    expect(
      queryPlan.parallel!.nodes[0].fetch.trace.root.child[0].responseName,
    ).toBe('me');
    expect(queryPlan.parallel!.nodes[1].sequence).toBeTruthy();
    expect(
      queryPlan.parallel!.nodes[1].sequence.nodes[0].fetch.serviceName,
    ).toBe('product');
    expect(
      queryPlan.parallel!.nodes[1].sequence.nodes[0].fetch.trace.root.child[0]
        .responseName,
    ).toBe('topProducts');
  });
});
