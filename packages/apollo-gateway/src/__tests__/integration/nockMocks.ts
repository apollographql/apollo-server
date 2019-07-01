import nock from 'nock';

export const mockLocalhostSDLQuery = ({
  url,
  sdl,
}: {
  url: string;
  sdl: string;
}) =>
  nock(url)
    .post('/graphql', {
      query: 'query GetServiceDefinition { _service { sdl } }',
    })
    .reply(200, { data: { _service: { sdl } } });

export const mockFetchStorageSecret = ({
  apiKeyHash,
  storageSecret,
  serviceName,
}: {
  apiKeyHash: string;
  storageSecret: string;
  serviceName: string;
}) =>
  nock('https://storage.googleapis.com:443')
    .get(
      `/engine-partial-schema-prod/${serviceName}/storage-secret/${apiKeyHash}.json`,
    )
    .reply(200, `"${storageSecret}"`);

// get composition config link, using received storage secret
export const mockGetCompositionConfigLink = (storageSecret: string) =>
  nock('https://storage.googleapis.com:443')
    .get(
      `/engine-partial-schema-prod/${storageSecret}/current/v1/composition-config-link`,
    )
    .reply(200, {
      configPath: `${storageSecret}/current/v1/composition-configs/composition-config-path.json`,
    });

// get composition configs, using received composition config link
export const mockGetCompositionConfigs = ({
  storageSecret,
  implementingServicePath,
  federatedServiceName,
}: {
  storageSecret: string;
  implementingServicePath: string;
  federatedServiceName: string;
}) =>
  nock('https://storage.googleapis.com:443')
    .get(
      `/engine-partial-schema-prod/${storageSecret}/current/v1/composition-configs/composition-config-path.json`,
    )
    .reply(200, {
      implementingServiceLocations: [
        {
          name: federatedServiceName,
          path: `${storageSecret}/current/v1/implementing-services/${federatedServiceName}/${implementingServicePath}.json`,
        },
      ],
    });

// get implementing service reference, using received composition-config
export const mockGetImplementingServices = ({
  storageSecret,
  implementingServicePath,
  partialSchemaPath,
  federatedServiceName,
  federatedServiceURL,
}: {
  storageSecret: string;
  implementingServicePath: string;
  partialSchemaPath: string;
  federatedServiceName: string;
  federatedServiceURL: string;
}) =>
  nock('https://storage.googleapis.com:443')
    .get(
      `/engine-partial-schema-prod/${storageSecret}/current/v1/implementing-services/${federatedServiceName}/${implementingServicePath}.json`,
    )
    .reply(200, {
      name: federatedServiceName,
      partialSchemaPath: `${storageSecret}/current/raw-partial-schemas/${partialSchemaPath}`,
      url: federatedServiceURL,
    });

// get raw-partial-schema, using received composition-config
export const mockGetRawPartialSchema = ({
  storageSecret,
  partialSchemaPath,
  federatedServiceSchema,
}: {
  storageSecret: string;
  partialSchemaPath: string;
  federatedServiceSchema: string;
}) =>
  nock('https://storage.googleapis.com:443')
    .get(
      `/engine-partial-schema-prod/${storageSecret}/current/raw-partial-schemas/${partialSchemaPath}`,
    )
    .reply(200, federatedServiceSchema);
