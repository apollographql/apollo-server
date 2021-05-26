import nock from 'nock';
import { schemaReportGql, SchemaReporter } from '../schemaReporter';
import {
  SchemaReportMutation,
  ReportSchemaResponse,
  SchemaReportMutationVariables,
} from '../operations';

function mockReporterRequest(
  url: any,
  variables: any,
  status: number,
  reportSchema: SchemaReportMutation['reportSchema'],
) {
  const request = variables
    ? nock(url).post(
        '/',
        JSON.stringify({
          query: schemaReportGql,
          variables,
        }),
      )
    : nock(url).post('/');
  return request.reply(status, { data: { reportSchema } });
}

beforeEach(() => {
  if (!nock.isActive()) nock.activate();
});

afterEach(() => {
  expect(nock.isDone()).toBeTruthy();
  nock.cleanAll();
  nock.restore();
});

const schemaReport = {
  bootId: 'string',
  coreSchemaHash: 'string',
  graphRef: 'id@string',
};

const url = 'http://localhost:4000';

describe('Schema reporter', () => {
  const newSchemaReporter = () =>
    new SchemaReporter({
      schemaReport,
      coreSchema: 'coreSchema',
      apiKey: 'apiKey',
      endpointUrl: url,
      logger: console,
      initialReportingDelayInMs: 0,
      fallbackReportingDelayInMs: 0,
    });
  it('return correct values if no errors', async () => {
    const schemaReporter = newSchemaReporter();
    mockReporterRequest(url, undefined, 200, {
      __typename: 'ReportSchemaResponse',
      inSeconds: 30,
      withCoreSchema: false,
    });

    expect(await schemaReporter.reportSchema(false)).toEqual<
      ReportSchemaResponse
    >({
      __typename: 'ReportSchemaResponse',
      inSeconds: 30,
      withCoreSchema: false,
    });

    mockReporterRequest(url, undefined, 200, {
      __typename: 'ReportSchemaResponse',
      inSeconds: 60,
      withCoreSchema: true,
    });

    expect(await schemaReporter.reportSchema(false)).toEqual<
      ReportSchemaResponse
    >({
      __typename: 'ReportSchemaResponse',
      inSeconds: 60,
      withCoreSchema: true,
    });
  });

  it('throws on 500 response', async () => {
    const schemaReporter = newSchemaReporter();
    mockReporterRequest(url, undefined, 500, {
      __typename: 'ReportSchemaResponse',
      inSeconds: 30,
      withCoreSchema: false,
    });

    await expect(
      schemaReporter.reportSchema(false),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"An unexpected HTTP status code (500) was encountered during schema reporting."`,
    );
  });

  it('throws on 200 malformed response', async () => {
    const schemaReporter = newSchemaReporter();
    mockReporterRequest(url, undefined, 200, {
      __typename: 'ReportServerInfoResponse',
    } as any);

    await expect(
      schemaReporter.reportSchema(false),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"Unexpected response shape from Apollo when reporting schema. If this continues, please reach out to support@apollographql.com. Received response: {\\"reportSchema\\":{\\"__typename\\":\\"ReportServerInfoResponse\\"}}"`,
    );
  });

  it('sends schema if withCoreSchema is true.', async () => {
    const schemaReporter = newSchemaReporter();

    const variables: SchemaReportMutationVariables = {
      report: schemaReport,
      coreSchema: 'coreSchema',
    };
    mockReporterRequest(url, variables, 200, {
      __typename: 'ReportSchemaResponse',
      inSeconds: 30,
      withCoreSchema: false,
    });

    await schemaReporter.reportSchema(true);
  });
});
