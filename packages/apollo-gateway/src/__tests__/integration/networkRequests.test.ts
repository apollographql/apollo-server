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

afterEach(() => {
  expect(nock.isDone()).toBeTruthy();
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

  mockLocalhostSDLQuery({ url, sdl });

  const gateway = new ApolloGateway({
    serviceList: [{ name: 'accounts', url: `${url}/graphql` }],
  });
  await gateway.load();
  expect(gateway.schema!.getType('User')!.description).toBe('My User.');
});

// This test is maybe a bit terrible, but IDK a better way to mock all the requests
it('Extracts service definitions from remote storage', async () => {
  const serviceName = 'jacksons-service';
  // hash of `service:${serviceName}:AABBCCDDEEFFGG`, but we don't want to depend on createSHA.
  const apiKeyHash = // createSHA('sha512').update(apiKey).digest('hex');
    'fa54332e7e8f1522edf721cea7ada93dc7c736f9343f4483989268a956b9101fabd18a53b62d837072abd87018b0b67e052ff732a98b3999e15d39d66d8e56dc';

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

  mockFetchStorageSecret({ apiKeyHash, storageSecret, serviceName });

  mockGetCompositionConfigLink(storageSecret);

  mockGetCompositionConfigs({
    storageSecret,
    implementingServicePath,
    federatedServiceName,
  });

  mockGetImplementingServices({
    storageSecret,
    implementingServicePath,
    partialSchemaPath,
    federatedServiceName,
    federatedServiceURL,
  });

  mockGetRawPartialSchema({
    storageSecret,
    partialSchemaPath,
    federatedServiceSchema,
  });

  const gateway = new ApolloGateway({});

  await gateway.load({ apiKeyHash, graphId: serviceName });
  expect(gateway.schema!.getType('User')!.description).toBe('This is my User');
});
