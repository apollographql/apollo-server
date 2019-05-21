import nock from 'nock';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { envOverrideOperationManifest, getStoreKey } from '../common';
import { resolve as urlResolve } from 'url';
import { createHash } from 'crypto';
import { AgentOptions } from '../agent';

const fakeBaseUrl = 'https://myfakehost/';

const defaultStore = () => new InMemoryLRUCache();

const genericSchemaHash = 'abc123';
const genericServiceID = 'test-service';
const genericApiKeyHash = 'someapikeyhash123';
const pollSeconds = 60;

const defaultAgentOptions: AgentOptions = {
  schemaHash: genericSchemaHash,
  engine: { serviceID: genericServiceID, apiKeyHash: genericApiKeyHash },
  store: defaultStore(),
  pollSeconds,
};

interface ManifestRecord {
  signature: string;
  document: string;
}

// These get a bit verbose within the tests below, so we use this as a
// sample store to pick and grab from.
const sampleManifestRecords: Record<string, ManifestRecord> = {
  a: {
    signature:
      'ba4573fca2e1491fd54b9f398490531ad6327b00610f2c1216dc8c9c4cfd2993',
    document:
      'mutation toggleMovieLike($id:ID!){toggleLike(id:$id){__typename id isLiked}}',
  },
  b: {
    signature:
      '32a21510374c3c9ad25e06424085c45ccde29bdbdedf8fa806c2bc6a2ffcdf56',
    document: '{nooks:books{author}}',
  },
  c: {
    signature:
      'c60ac6dfe19ba70dd9d6a29a275fae56296dcbb636eeaab55c3d9b7287c40a47',
    document: '{nooks:books{__typename author}}',
  },
};

describe('Agent', () => {
  describe('Basic', () => {
    const Agent = require('../agent').default;
    it('instantiates with proper options', () => {
      expect(new Agent({ ...defaultAgentOptions })).toBeInstanceOf(Agent);
    });

    it('instantiates with debug enabled', () => {
      expect(new Agent({ ...defaultAgentOptions, debug: true })).toBeInstanceOf(
        Agent,
      );
    });

    it('fails to instantiate when `schemaHash` is not passed', () => {
      const { schemaHash, ...remainingOptions } = defaultAgentOptions;
      expect(() => {
        // @ts-ignore: Intentionally not passing the parameter we need.
        new Agent(remainingOptions);
      }).toThrow(/`schemaHash` must be/);
    });
  });

  describe('fetches', () => {
    let originalEnvApolloOpManifestBaseUrl: string | undefined;
    let Agent: typeof import('../agent').default;
    let getLegacyOperationManifestUrl: typeof import('../common').getLegacyOperationManifestUrl;

    beforeAll(() => {
      // Override the tests URL with the one we want to mock/nock/test.
      originalEnvApolloOpManifestBaseUrl =
        process.env[envOverrideOperationManifest];
      process.env[envOverrideOperationManifest] = fakeBaseUrl;

      // Reset the modules so they're ready to be imported.
      jest.resetModules();

      // Store these on the local scope after we've reset the modules.
      Agent = require('../agent').default;
      getLegacyOperationManifestUrl = require('../common')
        .getLegacyOperationManifestUrl;
    });

    afterAll(() => {
      // Put the environment overrides back how they were.
      if (originalEnvApolloOpManifestBaseUrl) {
        process.env[
          envOverrideOperationManifest
        ] = originalEnvApolloOpManifestBaseUrl;

        originalEnvApolloOpManifestBaseUrl = undefined;
      } else {
        delete process.env[envOverrideOperationManifest];
      }

      // Reset modules again.
      jest.resetModules();
    });

    it('correctly prepared the test environment', () => {
      expect(getLegacyOperationManifestUrl('abc123', 'def456')).toStrictEqual(
        urlResolve(fakeBaseUrl, '/abc123/def456.v2.json'),
      );
    });

    describe('manifest checking and store populating', () => {
      const forCleanup: {
        store?: InMemoryLRUCache;
        agent?: import('../agent').default;
      }[] = [];

      function createAgent({ ...args } = {}) {
        const options = { ...defaultAgentOptions, ...args };

        // We never actually let the Agent construct its own default store
        // since we need to pluck the store out to instrument it with spies.
        const store = options.store;
        const agent = new Agent(options);

        // Save all agents and stores we've created so we can properly
        // stop them and clean them up.
        forCleanup.push({ agent, store });
        return agent;
      }

      afterEach(() => {
        if (!nock.isDone()) {
          throw new Error('Not all nock interceptors were used!');
        }

        let toCleanup;
        // Loop through the `forCleanup` constant and empty it out by popping
        // individual elements off the end and running the appropriate cleanup.
        while ((toCleanup = forCleanup.pop())) {
          if (toCleanup.agent) {
            toCleanup.agent.stop();
          }
        }
      });

      // Each nock is good for exactly one request!
      function nockGoodManifestABC() {
        return nockSuccessfulManifestForServiceAndSchema(
          genericServiceID,
          genericSchemaHash,
          [
            sampleManifestRecords.a,
            sampleManifestRecords.b,
            sampleManifestRecords.c,
          ],
        );
      }

      function nockGoodManifestAB() {
        return nockSuccessfulManifestForServiceAndSchema(
          genericServiceID,
          genericSchemaHash,
          [sampleManifestRecords.a, sampleManifestRecords.b],
        );
      }

      function nockGoodManifestA() {
        return nockSuccessfulManifestForServiceAndSchema(
          genericServiceID,
          genericSchemaHash,
          [sampleManifestRecords.a],
        );
      }

      function expectStoreSpyOperationEach(
        spy: jest.SpyInstance,
        letters: string[],
      ) {
        letters.forEach(letter => {
          const { signature, document } = sampleManifestRecords[letter];
          expect(spy).toHaveBeenCalledWith(getStoreKey(signature), document);
        });
      }

      async function expectStoreHasOperationEach(
        store: InMemoryLRUCache,
        letters: string[],
      ) {
        for (const letter of letters) {
          const { signature, document } = sampleManifestRecords[letter];
          await expect(
            store.get(getStoreKey(signature)),
          ).resolves.toStrictEqual(document);
        }
      }

      it('logs debug updates to the manifest on startup', async () => {
        nockGoodManifestABC();
        const relevantLogs: any = [];
        const logger = {
          debug: jest.fn().mockImplementation((...args: any[]) => {
            if (
              typeof args[0] === 'string' &&
              (args[0].match(/Checking for manifest changes/) ||
                args[0].match(/Incoming manifest ADDs/))
            ) {
              relevantLogs.push(args);
            }
          }),
        };
        await createAgent({ logger }).start();

        expect(relevantLogs[0][0]).toBe(
          `Checking for manifest changes at ${urlResolve(
            fakeBaseUrl,
            pathForServiceAndSchema(genericServiceID, genericSchemaHash),
          )}`,
        );

        // Console should indicate the records have been added in order.
        expect(relevantLogs[1][0]).toBe(
          `Incoming manifest ADDs: ${sampleManifestRecords.a.signature}`,
        );
        expect(relevantLogs[2][0]).toBe(
          `Incoming manifest ADDs: ${sampleManifestRecords.b.signature}`,
        );
        expect(relevantLogs[3][0]).toBe(
          `Incoming manifest ADDs: ${sampleManifestRecords.c.signature}`,
        );

        expect(relevantLogs.length).toBe(4);

        logger.debug.mockRestore();
      });

      it('populates the manifest store after starting', async () => {
        nockGoodManifestABC();
        const store = defaultStore();
        const storeSetSpy = jest.spyOn(store, 'set');
        await createAgent({ store }).start();

        // There are three operations in the manifest above.
        expect(storeSetSpy).toHaveBeenCalledTimes(3);
        expectStoreSpyOperationEach(storeSetSpy, ['a', 'b', 'c']);
        await expectStoreHasOperationEach(store, ['a', 'b', 'c']);

        storeSetSpy.mockRestore();
      });

      it('starts polling successfully', async () => {
        nockGoodManifestABC();
        const store = defaultStore();
        const storeSetSpy = jest.spyOn(store, 'set');
        const storeDeleteSpy = jest.spyOn(store, 'delete');
        const agent = createAgent({ store });
        jest.useFakeTimers();
        await agent.start();

        // Three additions, no deletions.
        expect(storeSetSpy).toBeCalledTimes(3);
        expect(storeDeleteSpy).toBeCalledTimes(0);

        // Only the initial start-up check should have happened by now.
        expect(agent._timesChecked).toBe(1);

        // If it's one millisecond short of our next poll interval, nothing
        // should have changed yet.
        jest.advanceTimersByTime(pollSeconds * 1000 - 1);

        // Still only one check.
        expect(agent._timesChecked).toBe(1);

        // Now, we'll expect another request to go out, so we'll nock it.
        nockUnchangedManifestForServiceAndSchema(
          genericServiceID,
          genericSchemaHash,
        );

        // If we move forward the last remaining millisecond, we should trigger
        // and end up with a successful sync.
        jest.advanceTimersByTime(1);

        // While that timer will fire, it will do work async, and we need to
        // wait on that work itself.
        await agent.requestPending();

        // Now the times checked should have gone up, and we should log that
        // we are looking for an update.  Of course, since we're unchanged
        // there should be no actual update.
        expect(agent._timesChecked).toBe(2);

        expect(storeSetSpy).toBeCalledTimes(3);
        expect(storeDeleteSpy).toBeCalledTimes(0);
      });

      it('continues polling even after initial failure', async () => {
        nockFailedManifestForServiceAndSchema(
          genericServiceID,
          genericSchemaHash,
        );
        const store = defaultStore();
        const storeSetSpy = jest.spyOn(store, 'set');
        const storeDeleteSpy = jest.spyOn(store, 'delete');
        const agent = createAgent({ store });
        jest.useFakeTimers();
        await agent.start();

        expect(storeSetSpy).toBeCalledTimes(0);
        expect(storeDeleteSpy).toBeCalledTimes(0);

        // Only the initial start-up check should have happened by now.
        expect(agent._timesChecked).toBe(1);

        // If it's one millisecond short of our next poll interval, nothing
        // should have changed yet.
        jest.advanceTimersByTime(pollSeconds * 1000 - 1);

        // Still only one check.
        expect(agent._timesChecked).toBe(1);

        // Now, we'll expect another GOOD request to fulfill, so we'll nock it.
        nockGoodManifestABC();

        // If we move forward the last remaining millisecond, we should trigger
        // and end up with a successful sync.
        jest.advanceTimersByTime(1);

        // While that timer will fire, it will do work async, and we need to
        // wait on that work itself.
        await agent.requestPending();

        // Now the times checked should have gone up.
        expect(agent._timesChecked).toBe(2);
        expect(storeSetSpy).toBeCalledTimes(0);
      });

      it('purges operations which are removed from the manifest', async () => {
        const store = defaultStore();
        const storeSetSpy = jest.spyOn(store, 'set');
        const storeDeleteSpy = jest.spyOn(store, 'delete');

        // Intentionally not calling start, since we're not testing intervals.
        const agent = createAgent({ store });
        expect(storeSetSpy).toBeCalledTimes(0);

        nockGoodManifestABC(); // Starting with ABC.
        await agent.checkForUpdate();
        expect(agent._timesChecked).toBe(1);
        expect(storeSetSpy).toBeCalledTimes(3);
        expect(storeDeleteSpy).toBeCalledTimes(0);
        await expectStoreHasOperationEach(store, ['a', 'b', 'c']);

        nockGoodManifestAB(); // Just AB in this manifest.
        await agent.checkForUpdate();
        expect(agent._timesChecked).toBe(2);
        expect(storeSetSpy).toBeCalledTimes(3); // no new sets.
        expect(storeDeleteSpy).toBeCalledTimes(1);
        await expect(
          // Ensure that 'C' is gone!
          store.get(getStoreKey(sampleManifestRecords.c.signature)),
        ).resolves.toBeUndefined();

        nockGoodManifestA(); // Just A in this manifest.
        await agent.checkForUpdate();
        expect(agent._timesChecked).toBe(3);
        expect(storeSetSpy).toBeCalledTimes(3); // no new sets.
        expect(storeDeleteSpy).toBeCalledTimes(2); // one more deletion
        await expect(
          // Ensure that 'B' is gone!
          store.get(getStoreKey(sampleManifestRecords.b.signature)),
        ).resolves.toBeUndefined();
      });
    });
  });
});

function nockBase() {
  return nock(fakeBaseUrl);
}

function nockManifestAtPath(path: string = '') {
  return nockBase().get(path);
}

function hashedServiceId(serviceID: string) {
  return createHash('sha512')
    .update(serviceID)
    .digest('hex');
}

function pathForServiceAndSchema(serviceID: string, schemaHash: string) {
  return `/${hashedServiceId(serviceID)}/${schemaHash}.v2.json`;
}

function nockManifestForServiceAndSchema(
  serviceID: string,
  schemaHash: string,
) {
  return nockManifestAtPath(pathForServiceAndSchema(serviceID, schemaHash));
}

function nockSuccessfulManifestForServiceAndSchema(
  serviceID: string,
  schemaHash: string,
  operations: ManifestRecord[],
) {
  return nockManifestForServiceAndSchema(serviceID, schemaHash).reply(200, {
    version: 2,
    operations,
  });
}

function nockFailedManifestForServiceAndSchema(
  serviceID: string,
  schemaHash: string,
) {
  return nockManifestForServiceAndSchema(serviceID, schemaHash).reply(500);
}

function nockUnchangedManifestForServiceAndSchema(
  serviceID: string,
  schemaHash: string,
) {
  return nockManifestForServiceAndSchema(serviceID, schemaHash).reply(304);
}
