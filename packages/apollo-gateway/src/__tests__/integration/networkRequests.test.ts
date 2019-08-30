import nock from 'nock';
import { ApolloGateway } from '../..';

import {
  mockGetRawPartialSchema,
  mockFetchStorageSecret,
  mockGetCompositionConfigLink,
  mockGetCompositionConfigs,
  mockGetImplementingServices,
  mockLocalhostSDLQuery,
} from './nockMocks';

beforeEach(() => {
  if (!nock.isActive()) nock.activate();
});

afterEach(() => {
  expect(nock.isDone()).toBeTruthy();
  nock.cleanAll();
  nock.restore();
  jest.useRealTimers();
});

it('Queries remote endpoints for their SDLs', async () => {
  const url = 'http://localhost:4001';
  const sdl = `
  extend type Query {
      me: User
      everyone: [User]
  }

  "My User."
  type User @key(fields: "id") {
    id: ID!
    name: String
    username: String
  }
  `;

  mockLocalhostSDLQuery({ url }).reply(200, {
    data: { _service: { sdl } },
  });

  const gateway = new ApolloGateway({
    serviceList: [{ name: 'accounts', url: `${url}/graphql` }],
  });
  await gateway.load();
  expect(gateway.schema!.getType('User')!.description).toBe('My User.');
});

// This test is maybe a bit terrible, but IDK a better way to mock all the requests
it('Extracts service definitions from remote storage', async () => {
  const serviceName = 'jacksons-service';
  const apiKeyHash = 'abc123';

  const storageSecret = 'secret';
  const implementingServicePath =
    'path-to-implementing-service-definition.json';
  const partialSchemaPath = 'path-to-accounts-partial-schema.json';
  const federatedServiceName = 'accounts';
  const federatedServiceURL = 'http://localhost:4001';
  const federatedServiceSchema = `
        extend type Query {
        me: User
        everyone: [User]
      }

      "This is my User"
      type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }`;

  mockFetchStorageSecret({ apiKeyHash, serviceName }).reply(
    200,
    `"${storageSecret}"`,
  );

  mockGetCompositionConfigLink(storageSecret).reply(200, {
    configPath: `${storageSecret}/current/v1/composition-configs/composition-config-path.json`,
  });

  mockGetCompositionConfigs({
    storageSecret,
  }).reply(200, {
    implementingServiceLocations: [
      {
        name: federatedServiceName,
        path: `${storageSecret}/current/v1/implementing-services/${federatedServiceName}/${implementingServicePath}.json`,
      },
    ],
  });

  mockGetImplementingServices({
    storageSecret,
    implementingServicePath,
    federatedServiceName,
  }).reply(200, {
    name: federatedServiceName,
    partialSchemaPath: `${storageSecret}/current/raw-partial-schemas/${partialSchemaPath}`,
    url: federatedServiceURL,
  });

  mockGetRawPartialSchema({
    storageSecret,
    partialSchemaPath,
  }).reply(200, federatedServiceSchema);

  const gateway = new ApolloGateway({});

  await gateway.load({ engine: { apiKeyHash, graphId: serviceName } });
  expect(gateway.schema!.getType('User')!.description).toBe('This is my User');
});

it('Rollsback to a previous schema when triggered', async () => {
  const serviceName = 'jacksons-service';
  const apiKeyHash = 'abc123';

  const storageSecret = 'secret';
  const implementingServicePath1 =
    'path-to-implementing-service-definition1.json';
  const implementingServicePath2 =
    'path-to-implementing-service-definition2.json';
  const partialSchemaPath1 = 'path-to-accounts-partial-schema1.json';
  const partialSchemaPath2 = 'path-to-accounts-partial-schema2.json';
  const federatedServiceName = 'accounts';
  const federatedServiceURL1 = 'http://localhost:4001';
  const federatedServiceSchema1 = `
        extend type Query {
        me: User
        everyone: [User]
      }

      "This is my User"
      type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }`;

  const federatedServiceURL2 = 'http://localhost:4002';
  const federatedServiceSchema2 = `
        extend type Query {
        me: User
        everyone: [User]
      }

      "This is my User 2"
      type User @key(fields: "id") {
        id: ID!
        name: String
        username: String
      }`;

  // Init
  mockFetchStorageSecret({ apiKeyHash, serviceName }).reply(
    200,
    `"${storageSecret}"`,
  );

  mockGetCompositionConfigLink(storageSecret).reply(200, {
    configPath: `${storageSecret}/current/v1/composition-configs/composition-config-path.json`,
  });

  mockGetCompositionConfigs({
    storageSecret,
  }).reply(200, {
    implementingServiceLocations: [
      {
        name: federatedServiceName,
        path: `${storageSecret}/current/v1/implementing-services/${federatedServiceName}/${implementingServicePath1}.json`,
      },
    ],
  });

  mockGetImplementingServices({
    storageSecret,
    implementingServicePath: implementingServicePath1,
    federatedServiceName,
  }).reply(200, {
    name: federatedServiceName,
    partialSchemaPath: `${storageSecret}/current/raw-partial-schemas/${partialSchemaPath1}`,
    url: federatedServiceURL1,
  });

  mockGetRawPartialSchema({
    storageSecret,
    partialSchemaPath: partialSchemaPath1,
  }).reply(200, federatedServiceSchema1);

  // Update 1
  mockFetchStorageSecret({ apiKeyHash, serviceName }).reply(
    200,
    `"${storageSecret}"`,
  );

  mockGetCompositionConfigLink(storageSecret).reply(200, {
    configPath: `${storageSecret}/current/v1/composition-configs/composition-config-path.json`,
  });

  mockGetCompositionConfigs({
    storageSecret,
  }).reply(200, {
    implementingServiceLocations: [
      {
        name: federatedServiceName,
        path: `${storageSecret}/current/v1/implementing-services/${federatedServiceName}/${implementingServicePath2}.json`,
      },
    ],
  });

  mockGetImplementingServices({
    storageSecret,
    implementingServicePath: implementingServicePath2,
    federatedServiceName,
  }).reply(200, {
    name: federatedServiceName,
    partialSchemaPath: `${storageSecret}/current/raw-partial-schemas/${partialSchemaPath2}`,
    url: federatedServiceURL2,
  });

  mockGetRawPartialSchema({
    storageSecret,
    partialSchemaPath: partialSchemaPath2,
  }).reply(200, federatedServiceSchema2);

  // Rollback
  mockFetchStorageSecret({ apiKeyHash, serviceName }).reply(
    200,
    `"${storageSecret}"`,
  );

  mockGetCompositionConfigLink(storageSecret).reply(200, {
    configPath: `${storageSecret}/current/v1/composition-configs/composition-config-path.json`,
  });

  mockGetCompositionConfigs({
    storageSecret,
  }).reply(200, {
    implementingServiceLocations: [
      {
        name: federatedServiceName,
        path: `${storageSecret}/current/v1/implementing-services/${federatedServiceName}/${implementingServicePath1}.json`,
      },
    ],
  });

  mockGetImplementingServices({
    storageSecret,
    implementingServicePath: implementingServicePath1,
    federatedServiceName,
  }).reply(304);

  mockGetRawPartialSchema({
    storageSecret,
    partialSchemaPath: partialSchemaPath1,
  }).reply(304);

  jest.useFakeTimers();

  const onChange = jest.fn();
  const gateway = new ApolloGateway();
  await gateway.load({ engine: { apiKeyHash, graphId: serviceName } });
  gateway.onSchemaChange(onChange);
  jest.runOnlyPendingTimers();

  jest.useRealTimers();
  await new Promise(resolve => setTimeout(resolve, 100));
  jest.useFakeTimers();

  expect(onChange.mock.calls.length).toBe(1);

  jest.runOnlyPendingTimers();

  jest.useRealTimers();
  await new Promise(resolve => setTimeout(resolve, 100));
  jest.useFakeTimers();

  expect(onChange.mock.calls.length).toBe(2);
});
