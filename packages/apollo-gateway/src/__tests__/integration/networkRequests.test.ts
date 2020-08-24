import nock from 'nock';
import { fetch } from 'apollo-server-env';
import { Logger } from 'apollo-server-types';
import { ApolloGateway, GCS_RETRY_COUNT, getDefaultGcsFetcher } from '../..';
import {
  mockSDLQuerySuccess,
  mockServiceHealthCheckSuccess,
  mockServiceHealthCheck,
  mockStorageSecretSuccess,
  mockStorageSecret,
  mockCompositionConfigLinkSuccess,
  mockCompositionConfigLink,
  mockCompositionConfigsSuccess,
  mockCompositionConfigs,
  mockImplementingServicesSuccess,
  mockImplementingServices,
  mockRawPartialSchemaSuccess,
  mockRawPartialSchema,
  apiKeyHash,
  graphId,
} from './nockMocks';

import loadServicesFromStorage = require("../../loadServicesFromStorage");

// This is a nice DX hack for GraphQL code highlighting and formatting within the file.
// Anything wrapped within the gql tag within this file is just a string, not an AST.
const gql = String.raw;

export interface MockService {
  gcsDefinitionPath: string;
  partialSchemaPath: string;
  url: string;
  sdl: string;
}

const service: MockService = {
  gcsDefinitionPath: 'service-definition.json',
  partialSchemaPath: 'accounts-partial-schema.json',
  url: 'http://localhost:4001',
  sdl: gql`
    extend type Query {
      me: User
      everyone: [User]
    }

    "This is my User"
    type User @key(fields: "id") {
      id: ID!
      name: String
      username: String
    }
  `,
};

const updatedService: MockService = {
  gcsDefinitionPath: 'updated-service-definition.json',
  partialSchemaPath: 'updated-accounts-partial-schema.json',
  url: 'http://localhost:4002',
  sdl: gql`
    extend type Query {
      me: User
      everyone: [User]
    }

    "This is my updated User"
    type User @key(fields: "id") {
      id: ID!
      name: String
      username: String
    }
  `,
};

let fetcher: typeof fetch;
let logger: Logger;

beforeEach(() => {
  if (!nock.isActive()) nock.activate();

  fetcher = getDefaultGcsFetcher().defaults({
    retry: {
      retries: GCS_RETRY_COUNT,
      minTimeout: 0,
      maxTimeout: 0,
    },
  });

  const warn = jest.fn();
  const debug = jest.fn();
  const error = jest.fn();
  const info = jest.fn();

  logger = {
    warn,
    debug,
    error,
    info,
  };
});

afterEach(() => {
  expect(nock.isDone()).toBeTruthy();
  nock.cleanAll();
  nock.restore();
});

it('Queries remote endpoints for their SDLs', async () => {
  mockSDLQuerySuccess(service);

  const gateway = new ApolloGateway({
    serviceList: [{ name: 'accounts', url: service.url }],
    logger
  });
  await gateway.load();
  expect(gateway.schema!.getType('User')!.description).toBe('This is my User');
});

it('Extracts service definitions from remote storage', async () => {
  mockStorageSecretSuccess();
  mockCompositionConfigLinkSuccess();
  mockCompositionConfigsSuccess([service]);
  mockImplementingServicesSuccess(service);
  mockRawPartialSchemaSuccess(service);

  const gateway = new ApolloGateway({ logger });

  await gateway.load({ engine: { apiKeyHash, graphId } });
  expect(gateway.schema!.getType('User')!.description).toBe('This is my User');
});

it.each([
  ['warned', 'present'],
  ['not warned', 'absent'],
])('conflicting configurations are %s about when %s', async (_word, mode) => {
  const isConflict = mode === 'present';
  let blockerResolve: () => void;
  const blocker = new Promise(resolve => (blockerResolve = resolve));
  const original = loadServicesFromStorage.getServiceDefinitionsFromStorage;
  const spyGetServiceDefinitionsFromStorage = jest
    .spyOn(loadServicesFromStorage, 'getServiceDefinitionsFromStorage')
    .mockImplementationOnce(async (...args) => {
      try {
        return await original(...args);
      } catch (e) {
        throw e;
      } finally {
        setImmediate(blockerResolve);
      }
    });

  mockStorageSecretSuccess();
  if (isConflict) {
    mockCompositionConfigLinkSuccess();
    mockCompositionConfigsSuccess([service]);
    mockImplementingServicesSuccess(service);
    mockRawPartialSchemaSuccess(service);
  } else {
    mockCompositionConfigLink().reply(403);
  }

  mockSDLQuerySuccess(service);

  const gateway = new ApolloGateway({
    serviceList: [
      { name: 'accounts', url: service.url },
    ],
    logger
  });

  await gateway.load({ engine: { apiKeyHash, graphId } });
  await blocker; // Wait for the definitions to be "fetched".

  (isConflict
    ? expect(logger.warn)
    : expect(logger.warn).not
  ).toHaveBeenCalledWith(expect.stringMatching(
    /A local gateway service list is overriding an Apollo Graph Manager managed configuration/));
  spyGetServiceDefinitionsFromStorage.mockRestore();
});

// This test has been flaky for a long time, and fails consistently after changes
// introduced by https://github.com/apollographql/apollo-server/pull/4277.
// I've decided to skip this test for now with hopes that we can one day
// determine the root cause and test this behavior in a reliable manner.
it.skip('Rollsback to a previous schema when triggered', async () => {
  // Init
  mockStorageSecretSuccess();
  mockCompositionConfigLinkSuccess();
  mockCompositionConfigsSuccess([service]);
  mockImplementingServicesSuccess(service);
  mockRawPartialSchemaSuccess(service);

  // Update 1
  mockStorageSecretSuccess();
  mockCompositionConfigLinkSuccess();
  mockCompositionConfigsSuccess([updatedService]);
  mockImplementingServicesSuccess(updatedService);
  mockRawPartialSchemaSuccess(updatedService);

  // Rollback
  mockStorageSecretSuccess();
  mockCompositionConfigLinkSuccess();
  mockCompositionConfigsSuccess([service]);
  mockImplementingServices(service).reply(304);
  mockRawPartialSchema(service).reply(304);

  let firstResolve: () => void;
  let secondResolve: () => void;
  let thirdResolve: () => void
  const firstSchemaChangeBlocker = new Promise(res => (firstResolve = res));
  const secondSchemaChangeBlocker = new Promise(res => (secondResolve = res));
  const thirdSchemaChangeBlocker = new Promise(res => (thirdResolve = res));

  const onChange = jest
    .fn()
    .mockImplementationOnce(() => firstResolve())
    .mockImplementationOnce(() => secondResolve())
    .mockImplementationOnce(() => thirdResolve());

  const gateway = new ApolloGateway({ logger });
  // @ts-ignore for testing purposes, a short pollInterval is ideal so we'll override here
  gateway.experimental_pollInterval = 100;

  gateway.onSchemaChange(onChange);
  await gateway.load({ engine: { apiKeyHash, graphId } });

  await firstSchemaChangeBlocker;
  expect(onChange).toHaveBeenCalledTimes(1);

  await secondSchemaChangeBlocker;
  expect(onChange).toHaveBeenCalledTimes(2);

  await thirdSchemaChangeBlocker;
  expect(onChange).toHaveBeenCalledTimes(3);
});

function failNTimes(n: number, fn: () => nock.Interceptor) {
  for (let i = 0; i < n; i++) {
    fn().reply(500);
  }
}

it(`Retries GCS (up to ${GCS_RETRY_COUNT} times) on failure for each request and succeeds`, async () => {
  failNTimes(GCS_RETRY_COUNT, mockStorageSecret);
  mockStorageSecretSuccess();

  failNTimes(GCS_RETRY_COUNT, mockCompositionConfigLink);
  mockCompositionConfigLinkSuccess();

  failNTimes(GCS_RETRY_COUNT, mockCompositionConfigs);
  mockCompositionConfigsSuccess([service]);

  failNTimes(GCS_RETRY_COUNT, () => mockImplementingServices(service));
  mockImplementingServicesSuccess(service);

  failNTimes(GCS_RETRY_COUNT, () => mockRawPartialSchema(service));
  mockRawPartialSchemaSuccess(service);

  const gateway = new ApolloGateway({ fetcher, logger });

  await gateway.load({ engine: { apiKeyHash, graphId } });
  expect(gateway.schema!.getType('User')!.description).toBe('This is my User');
});

// This test is reliably failing in its current form.  It's mostly testing that
// `make-fetch-happen` is doing its retries properly and we have proof that,
// generally speaking, retries are working, so we'll disable this until we can
// re-visit it.
it.skip(`Fails after the ${GCS_RETRY_COUNT + 1}th attempt to reach GCS`, async () => {
  failNTimes(GCS_RETRY_COUNT + 1, mockStorageSecret);

  const gateway = new ApolloGateway({ fetcher, logger });
  await expect(
    gateway.load({ engine: { apiKeyHash, graphId } }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Could not communicate with Apollo Graph Manager storage: "`,
  );
});

it(`Errors when the secret isn't hosted on GCS`, async () => {
  mockStorageSecret().reply(
    403,
    `<Error><Code>AccessDenied</Code>
    Anonymous caller does not have storage.objects.get`,
    { 'content-type': 'application/xml' },
  );

  const gateway = new ApolloGateway({ fetcher, logger });
  await expect(
    gateway.load({ engine: { apiKeyHash, graphId } }),
  ).rejects.toThrowErrorMatchingInlineSnapshot(
    `"Unable to authenticate with Apollo Graph Manager storage while fetching https://storage-secrets.api.apollographql.com/federated-service/storage-secret/dd55a79d467976346d229a7b12b673ce.json.  Ensure that the API key is configured properly and that a federated service has been pushed.  For details, see https://go.apollo.dev/g/resolve-access-denied."`,
  );
});

describe('Downstream service health checks', () => {
  describe('Unmanaged mode', () => {
    it(`Performs health checks to downstream services on load`, async () => {
      mockSDLQuerySuccess(service);
      mockServiceHealthCheckSuccess(service);

      const gateway = new ApolloGateway({
        logger,
        serviceList: [{ name: 'accounts', url: service.url }],
        serviceHealthCheck: true,
      });

      await gateway.load();
      expect(gateway.schema!.getType('User')!.description).toBe('This is my User');
    });

    it(`Rejects on initial load when health check fails`, async () => {
      mockSDLQuerySuccess(service);
      mockServiceHealthCheck(service).reply(500);

      const gateway = new ApolloGateway({
        serviceList: [{ name: 'accounts', url: service.url }],
        serviceHealthCheck: true,
        logger,
      });

      await expect(gateway.load()).rejects.toThrowErrorMatchingInlineSnapshot(
        `"500: Internal Server Error"`,
      );
    });
  });

  describe('Managed mode', () => {
    it('Performs health checks to downstream services on load', async () => {
      mockStorageSecretSuccess();
      mockCompositionConfigLinkSuccess();
      mockCompositionConfigsSuccess([service]);
      mockImplementingServicesSuccess(service);
      mockRawPartialSchemaSuccess(service);

      mockServiceHealthCheckSuccess(service);

      const gateway = new ApolloGateway({ serviceHealthCheck: true, logger });

      await gateway.load({ engine: { apiKeyHash, graphId } });
      expect(gateway.schema!.getType('User')!.description).toBe('This is my User');
    });

    it('Rejects on initial load when health check fails', async () => {
      mockStorageSecretSuccess();
      mockCompositionConfigLinkSuccess();
      mockCompositionConfigsSuccess([service]);
      mockImplementingServicesSuccess(service);
      mockRawPartialSchemaSuccess(service);

      mockServiceHealthCheck(service).reply(500);

      const gateway = new ApolloGateway({ serviceHealthCheck: true, logger });

      await expect(
        gateway.load({ engine: { apiKeyHash, graphId } }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(`"500: Internal Server Error"`);
    });

    // This test has been flaky for a long time, and fails consistently after changes
    // introduced by https://github.com/apollographql/apollo-server/pull/4277.
    // I've decided to skip this test for now with hopes that we can one day
    // determine the root cause and test this behavior in a reliable manner.
    it.skip('Rolls over to new schema when health check succeeds', async () => {
      mockStorageSecretSuccess();
      mockCompositionConfigLinkSuccess();
      mockCompositionConfigsSuccess([service]);
      mockImplementingServicesSuccess(service);
      mockRawPartialSchemaSuccess(service);
      mockServiceHealthCheckSuccess(service);

      // Update
      mockStorageSecretSuccess();
      mockCompositionConfigLinkSuccess();
      mockCompositionConfigsSuccess([updatedService]);
      mockImplementingServicesSuccess(updatedService);
      mockRawPartialSchemaSuccess(updatedService);
      mockServiceHealthCheckSuccess(updatedService);

      let resolve1: () => void;
      let resolve2: () => void;
      const schemaChangeBlocker1 = new Promise(res => (resolve1 = res));
      const schemaChangeBlocker2 = new Promise(res => (resolve2 = res));
      const onChange = jest
        .fn()
        .mockImplementationOnce(() => resolve1())
        .mockImplementationOnce(() => resolve2());

      const gateway = new ApolloGateway({
        serviceHealthCheck: true,
        logger,
      });
      // @ts-ignore for testing purposes, a short pollInterval is ideal so we'll override here
      gateway.experimental_pollInterval = 100;

      gateway.onSchemaChange(onChange);
      await gateway.load({ engine: { apiKeyHash, graphId } });

      await schemaChangeBlocker1;
      expect(gateway.schema!.getType('User')!.description).toBe('This is my User');
      expect(onChange).toHaveBeenCalledTimes(1);

      await schemaChangeBlocker2;
      expect(gateway.schema!.getType('User')!.description).toBe('This is my updated User');
      expect(onChange).toHaveBeenCalledTimes(2);
    });

    it('Preserves original schema when health check fails', async () => {
      mockStorageSecretSuccess();
      mockCompositionConfigLinkSuccess();
      mockCompositionConfigsSuccess([service]);
      mockImplementingServicesSuccess(service);
      mockRawPartialSchemaSuccess(service);
      mockServiceHealthCheckSuccess(service);

      // Update
      mockStorageSecretSuccess();
      mockCompositionConfigLinkSuccess();
      mockCompositionConfigsSuccess([updatedService]);
      mockImplementingServicesSuccess(updatedService);
      mockRawPartialSchemaSuccess(updatedService);
      mockServiceHealthCheck(updatedService).reply(500);

      let resolve: () => void;
      const schemaChangeBlocker = new Promise(res => (resolve = res));

      const gateway = new ApolloGateway({ serviceHealthCheck: true, logger });
      // @ts-ignore for testing purposes, a short pollInterval is ideal so we'll override here
      gateway.experimental_pollInterval = 100;

      // @ts-ignore for testing purposes, we'll call the original `updateComposition`
      // function from our mock. The first call should mimic original behavior,
      // but the second call needs to handle the PromiseRejection. Typically for tests
      // like these we would leverage the `gateway.onSchemaChange` callback to drive
      // the test, but in this case, that callback isn't triggered when the update
      // fails (as expected) so we get creative with the second mock as seen below.
      const original = gateway.updateComposition;
      const mockUpdateComposition = jest
        .fn()
        .mockImplementationOnce(async () => {
          await original.apply(gateway);
        })
        .mockImplementationOnce(async () => {
          // mock the first poll and handle the error which would otherwise be caught
          // and logged from within the `pollServices` class method
          await expect(original.apply(gateway))
            .rejects
            .toThrowErrorMatchingInlineSnapshot(
              `"500: Internal Server Error"`,
            );
          // finally resolve the promise which drives this test
          resolve();
        });

      // @ts-ignore for testing purposes, replace the `updateComposition`
      // function on the gateway with our mock
      gateway.updateComposition = mockUpdateComposition;

      // load the gateway as usual
      await gateway.load({ engine: { apiKeyHash, graphId } });

      expect(gateway.schema!.getType('User')!.description).toBe('This is my User');

      await schemaChangeBlocker;

      // At this point, the mock update should have been called but the schema
      // should not have updated to the new one.
      expect(mockUpdateComposition.mock.calls.length).toBe(2);
      expect(gateway.schema!.getType('User')!.description).toBe('This is my User');
    });
  });
});
