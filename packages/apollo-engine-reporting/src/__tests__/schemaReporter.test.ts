import nock from 'nock';
import { reportServerInfoGql, SchemaReporter } from '../schemaReporter';

function mockReporterRequest(url: any, variables?: any) {
  if (variables)
    return nock(url).post(
      '/',
      JSON.stringify({
        query: reportServerInfoGql,
        operationName: 'ReportServerInfo',
        variables,
      }),
    );
  return nock(url).post('/');
}

beforeEach(() => {
  if (!nock.isActive()) nock.activate();
});

afterEach(() => {
  expect(nock.isDone()).toBeTruthy();
  nock.cleanAll();
  nock.restore();
});

const serverInfo = {
  bootId: 'string',
  executableSchemaId: 'string',
  graphVariant: 'string',
};

const url = 'http://localhost:4000';

describe('Schema reporter', () => {
  it('return correct values if no errors', async () => {
    const schemaReporter = new SchemaReporter(
      serverInfo,
      'schemaSdl',
      'apiKey',
      url,
    );
    mockReporterRequest(url).reply(200, {
      data: {
        me: {
          __typename: 'ServiceMutation',
          reportServerInfo: {
            __typename: 'ReportServerInfoResponse',
            inSeconds: 30,
            withExecutableSchema: false,
          },
        },
      },
    });

    let {
      inSeconds,
      withExecutableSchema,
    } = await schemaReporter.reportServerInfo(false);
    expect(inSeconds).toBe(30);
    expect(withExecutableSchema).toBe(false);

    mockReporterRequest(url).reply(200, {
      data: {
        me: {
          __typename: 'ServiceMutation',
          reportServerInfo: {
            __typename: 'ReportServerInfoResponse',
            inSeconds: 60,
            withExecutableSchema: true,
          },
        },
      },
    });
    ({
      inSeconds,
      withExecutableSchema,
    } = await schemaReporter.reportServerInfo(false));
    expect(inSeconds).toBe(60);
    expect(withExecutableSchema).toBe(true);
  });

  it('throws on 500 response', async () => {
    const schemaReporter = new SchemaReporter(
      serverInfo,
      'schemaSdl',
      'apiKey',
      url,
    );
    mockReporterRequest(url).reply(500, {
      data: {
        me: {
          reportServerInfo: {
            __typename: 'ReportServerInfoResponse',
            inSeconds: 30,
            withExecutableSchema: false,
          },
        },
      },
    });

    await expect(
      schemaReporter.reportServerInfo(false),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"An unexpected HTTP status code (500) was encountered during schema reporting."`,
    );
  });

  it('throws on 200 malformed response', async () => {
    const schemaReporter = new SchemaReporter(
      serverInfo,
      'schemaSdl',
      'apiKey',
      url,
    );
    mockReporterRequest(url).reply(200, {
      data: {
        me: {
          reportServerInfo: {
            __typename: 'ReportServerInfoResponse',
          },
        },
      },
    });

    await expect(
      schemaReporter.reportServerInfo(false),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unexpected response shape from Apollo Graph Manager when reporting server information for schema reporting. If this continues, please reach out to support@apollographql.com. Received response: {\\"me\\":{\\"reportServerInfo\\":{\\"__typename\\":\\"ReportServerInfoResponse\\"}}}"`,
    );

    mockReporterRequest(url).reply(200, {
      data: {
        me: {
          __typename: 'UserMutation',
        },
      },
    });
    await expect(
      schemaReporter.reportServerInfo(false),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"This server was configured with an API key for a user. Only a service's API key may be used for schema reporting. Please visit the settings for this graph at https://engine.apollographql.com/ to obtain an API key for a service."`,
    );
  });

  it('sends schema if withExecutableSchema is true.', async () => {
    const schemaReporter = new SchemaReporter(
      serverInfo,
      'schemaSdl',
      'apiKey',
      url,
    );

    const variables = {
      info: serverInfo,
      executableSchema: 'schemaSdl'
    };
    mockReporterRequest(url, variables).reply(200, {
      data: {
        me: {
          __typename: 'ServiceMutation',
          reportServerInfo: {
            __typename: 'ReportServerInfoResponse',
            inSeconds: 30,
            withExecutableSchema: false,
          },
        },
      },
    });

    await schemaReporter.reportServerInfo(true);
  });
});
