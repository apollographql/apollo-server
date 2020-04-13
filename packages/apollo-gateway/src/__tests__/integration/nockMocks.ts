import nock from 'nock';

function gcsNock(url: Parameters<typeof nock>[0]): nock.Scope {
  return nock(url, {
    reqheaders: {
      'user-agent': `apollo-gateway/${
        require('../../../package.json').version
      }`,
    },
  });
}

export const mockLocalhostSDLQuery = ({ url }: { url: string }) =>
  nock(url).post('/graphql', {
    query: 'query GetServiceDefinition { _service { sdl } }',
  });

export const graphId = 'federated-service';
export const apiKeyHash = 'dd55a79d467976346d229a7b12b673ce';
const storageSecret = 'my-storage-secret';
const accountsService = 'accounts';

export const mockStorageSecret = () =>
  gcsNock('https://storage.googleapis.com:443').get(
    `/engine-partial-schema-prod/${graphId}/storage-secret/${apiKeyHash}.json`,
  );

export const mockStorageSecretSuccess = () =>
  gcsNock('https://storage.googleapis.com:443')
    .get(
      `/engine-partial-schema-prod/${graphId}/storage-secret/${apiKeyHash}.json`,
    )
    .reply(200, `"${storageSecret}"`);

// get composition config link, using received storage secret
export const mockCompositionConfigLink = () =>
  gcsNock('https://storage.googleapis.com:443').get(
    `/engine-partial-schema-prod/${storageSecret}/current/v1/composition-config-link`,
  );

export const mockCompositionConfigLinkSuccess = () =>
  mockCompositionConfigLink().reply(200, {
    configPath: `${storageSecret}/current/v1/composition-configs/composition-config-path.json`,
  });

// get composition configs, using received composition config link
export const mockCompositionConfigs = () =>
  gcsNock('https://storage.googleapis.com:443').get(
    `/engine-partial-schema-prod/${storageSecret}/current/v1/composition-configs/composition-config-path.json`,
  );

export const mockCompositionConfigsSuccess = (
  implementingServicePaths: string[],
) =>
  mockCompositionConfigs().reply(200, {
    implementingServiceLocations: implementingServicePaths.map(servicePath => ({
      name: accountsService,
      path: `${storageSecret}/current/v1/implementing-services/${accountsService}/${servicePath}`,
    })),
  });

// get implementing service reference, using received composition-config
export const mockImplementingServices = ({
  implementingServicePath,
}: {
  implementingServicePath: string;
}) =>
  gcsNock('https://storage.googleapis.com:443').get(
    `/engine-partial-schema-prod/${storageSecret}/current/v1/implementing-services/${accountsService}/${implementingServicePath}`,
  );

export const mockImplementingServicesSuccess = ({
  implementingServicePath,
  partialSchemaPath,
  federatedServiceURL,
}: {
  implementingServicePath: string;
  partialSchemaPath: string;
  federatedServiceURL: string;
}) =>
  mockImplementingServices({
    implementingServicePath,
  }).reply(200, {
    name: accountsService,
    partialSchemaPath: `${storageSecret}/current/raw-partial-schemas/${partialSchemaPath}`,
    url: federatedServiceURL,
  });

// get raw-partial-schema, using received composition-config
export const mockRawPartialSchema = ({
  partialSchemaPath,
}: {
  partialSchemaPath: string;
}) =>
  gcsNock('https://storage.googleapis.com:443').get(
    `/engine-partial-schema-prod/${storageSecret}/current/raw-partial-schemas/${partialSchemaPath}`,
  );

export const mockRawPartialSchemaSuccess = ({
  partialSchemaPath,
  federatedServiceSchema,
}: {
  partialSchemaPath: string;
  federatedServiceSchema: string;
}) =>
  mockRawPartialSchema({ partialSchemaPath }).reply(
    200,
    federatedServiceSchema,
  );
