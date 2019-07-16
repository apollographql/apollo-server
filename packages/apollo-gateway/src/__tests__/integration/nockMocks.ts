import nock from 'nock';

export const mockLocalhostSDLQuery = ({ url }: { url: string }) =>
  nock(url).post('/graphql', {
    query: 'query GetServiceDefinition { _service { sdl } }',
  });

export const mockFetchStorageSecret = ({
  apiKeyHash,
  serviceName,
}: {
  apiKeyHash: string;
  serviceName: string;
}) =>
  nock('https://storage.googleapis.com:443').get(
    `/engine-partial-schema-prod/${serviceName}/storage-secret/${apiKeyHash}.json`,
  );

// get composition config link, using received storage secret
export const mockGetCompositionConfigLink = (storageSecret: string) =>
  nock('https://storage.googleapis.com:443').get(
    `/engine-partial-schema-prod/${storageSecret}/current/v1/composition-config-link`,
  );

// get composition configs, using received composition config link
export const mockGetCompositionConfigs = ({
  storageSecret,
}: {
  storageSecret: string;
}) =>
  nock('https://storage.googleapis.com:443').get(
    `/engine-partial-schema-prod/${storageSecret}/current/v1/composition-configs/composition-config-path.json`,
  );

// get implementing service reference, using received composition-config
export const mockGetImplementingServices = ({
  storageSecret,
  implementingServicePath,
  federatedServiceName,
}: {
  storageSecret: string;
  implementingServicePath: string;
  federatedServiceName: string;
}) =>
  nock('https://storage.googleapis.com:443').get(
    `/engine-partial-schema-prod/${storageSecret}/current/v1/implementing-services/${federatedServiceName}/${implementingServicePath}.json`,
  );

// get raw-partial-schema, using received composition-config
export const mockGetRawPartialSchema = ({
  storageSecret,
  partialSchemaPath,
}: {
  storageSecret: string;
  partialSchemaPath: string;
}) =>
  nock('https://storage.googleapis.com:443').get(
    `/engine-partial-schema-prod/${storageSecret}/current/raw-partial-schemas/${partialSchemaPath}`,
  );
