import nock from 'nock';
import { ApolloGateway } from '../..';
import createSHA from '../../utilities/createSHA';

import {
  mockGetRawPartialSchema,
  mockFetchStorageSecret,
  mockGetCompositionConfigLink,
  mockGetCompositionConfigs,
  mockGetImplementingServices,
  mockLocalhostSDLQuery,
} from './nockMocks';

it('Queries remote endpoints for their SDLs', async () => {
  let url = 'localhost:4001';
  let sdl = `extend type Query {
      me: User
    everyone: [User]
  }

  type User @key(fields: "id") {
      id: ID!
    name: String
    username: String
  }
  `;

  mockLocalhostSDLQuery({ url, sdl });

  let gateway = new ApolloGateway({
    serviceList: [{ name: 'accounts', url: 'http://localhost:4001/' }],
  });
  await gateway.load();
  expect(nock.isDone()).toBeTruthy();
});

// This test is maybe a bit terrible, but IDK a better way to mock all the requests
it('Extracts service definitions from remote storage', async () => {
  let serviceName = 'jacksons-service';
  let apiKey = `service:${serviceName}:AABBCCDDEEFFGG`;
  let apiKeyHash = createSHA('sha512')
    .update(apiKey)
    .digest('hex');

  let storageSecret = 'secret';
  let implementingServicePath = 'path-to-implementing-service-definition.json';
  let partialSchemaPath = 'path-to-accounts-partial-schema.json';
  let federatedServiceName = 'accounts';
  let federatedServiceURL = 'http://localhost:4001';
  let federatedServiceSchema = `
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

  let gateway = new ApolloGateway({ apiKey });

  await gateway.load();
  expect(nock.isDone()).toBeTruthy();
  expect(gateway.schema!.getType('User')!.description).toBe('This is my User');
});
