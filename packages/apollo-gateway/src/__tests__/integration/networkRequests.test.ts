import nock from 'nock';
import { createGateway } from '../..';

import {
  mockGetRawPartialSchema,
  mockFetchStorageSecret,
  mockGetCompositionConfigLink,
  mockGetCompositionConfigs,
  mockGetImplementingServices,
  mockLocalhostSDLQuery,
} from './nockMocks';

it('Queries remote endpoints for their SDLs', async () => {
  mockLocalhostSDLQuery();

  await createGateway({
    serviceList: [{ name: 'accounts', url: 'http://localhost:4001/graphql' }],
  });

  expect(nock.isDone()).toBeTruthy();
});

// This test is maybe a bit terrible, but IDK a better way to mock all the requests
it('Extracts service definitions from remote storage', async () => {
  mockFetchStorageSecret();
  mockGetCompositionConfigLink();
  mockGetCompositionConfigs();
  mockGetImplementingServices();
  mockGetRawPartialSchema();

  await createGateway({
    apiKey: 'service:mdg-private-6077:EgWp3sa01FhGuMJSKIfMVQ',
  });

  expect(nock.isDone()).toBeTruthy();
});
