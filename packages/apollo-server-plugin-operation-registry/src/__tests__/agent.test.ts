import nock from 'nock';
import { InMemoryLRUCache, KeyValueCache } from 'apollo-server-caching';
import { envOverrideOperationManifest, getCacheKey } from '../common';
import { resolve as urlResolve } from 'url';
import { createHash } from 'crypto';
import { AgentOptions } from '../agent';

const fakeBaseUrl = 'https://myfakehost/';

const defaultCache = () => new InMemoryLRUCache();

const genericSchemaHash = 'abc123';
const genericServiceID = 'test-service';
const pollSeconds = 60;

// Utility function for building the required options to pass to the Agent
// constructor.  These can be overridden when necessary, but default to the
// generic options above.
const getRequiredAgentOptions = (
  {
    cache = defaultCache(),
    schemaHash = genericSchemaHash,
    serviceID = genericServiceID,
    debug = false,
  }: {
    cache?: KeyValueCache;
    schemaHash?: string;
    serviceID?: string;
    debug?: boolean;
  } = {
    cache: defaultCache(),
    schemaHash: genericSchemaHash,
    serviceID: genericServiceID,
    debug: false,
  },
): AgentOptions => ({
  schemaHash,
  engine: { serviceID },
  cache,
  pollSeconds,
  debug,
});

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
      expect(new Agent({ ...getRequiredAgentOptions() })).toBeInstanceOf(Agent);
    });

    it('instantiates with debug enabled', () => {
      expect(
        new Agent({ ...getRequiredAgentOptions(), debug: true }),
      ).toBeInstanceOf(Agent);
    });

    it('fails to instantiate when `schemaHash` is not passed', () => {
      const { schemaHash, ...remainingOptions } = getRequiredAgentOptions();
      expect(() => {
        // @ts-ignore: Intentionally not passing the parameter we need.
        new Agent(remainingOptions);
      }).toThrow(/`schemaHash` must be/);
    });
  });

  describe('fetches', () => {
    let originalEnvApolloOpManifestBaseUrl: string | undefined;
    let Agent: typeof import('../agent').default;
    let getOperationManifestUrl: typeof import('../common').getOperationManifestUrl;

    beforeAll(() => {
      // Override the tests URL with the one we want to mock/nock/test.
      originalEnvApolloOpManifestBaseUrl =
        process.env[envOverrideOperationManifest];
      process.env[envOverrideOperationManifest] = fakeBaseUrl;

      // Reset the modules so they're ready to be imported.
      jest.resetModules();

      // Store these on the local scope after we've reset the modules.
      Agent = require('../agent').default;
      getOperationManifestUrl = require('../common').getOperationManifestUrl;
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
      expect(getOperationManifestUrl('abc123', 'def456')).toStrictEqual(
        urlResolve(fakeBaseUrl, '/abc123/def456'),
      );
    });

    describe('manifest checking and cache populating', () => {
      const forCleanup: {
        cache?: KeyValueCache;
        agent?: import('../agent').default;
      }[] = [];

      function createAgent({ ...args } = {}) {
        const options = getRequiredAgentOptions({ ...args });

        // We never actually let the Agent construct its own default cache
        // since we need to pluck the cache out to instrument it with spies.
        const cache = options.cache;
        const agent = new Agent(options);

        // Save all agents and caches we've created so we can properly
        // stop them and clean them up.
        forCleanup.push({ agent, cache });
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

      function expectCacheSpyOperationEach(
        spy: jest.SpyInstance,
        letters: string[],
      ) {
        letters.forEach(letter => {
          const { signature, document } = sampleManifestRecords[letter];
          expect(spy).toHaveBeenCalledWith(getCacheKey(signature), document);
        });
      }

      async function expectCacheHasOperationEach(
        cache: KeyValueCache,
        letters: string[],
      ) {
        for (const letter of letters) {
          const { signature, document } = sampleManifestRecords[letter];
          await expect(
            cache.get(getCacheKey(signature)),
          ).resolves.toStrictEqual(document);
        }
      }

      it('logs debug updates to the manifest on startup', async () => {
        nockGoodManifestABC();
        const consoleDebugMock = (console.debug = jest.fn());
        await createAgent({ debug: true }).start();

        expect(consoleDebugMock.mock.calls[0][0]).toBe(
          `Checking for manifest changes at ${urlResolve(
            fakeBaseUrl,
            pathForServiceAndSchema(genericServiceID, genericSchemaHash),
          )}`,
        );

        // Console should indicate the records have been added in order.
        expect(consoleDebugMock.mock.calls[1][0]).toBe(
          `Incoming manifest ADDs: ${sampleManifestRecords.a.signature}`,
        );
        expect(consoleDebugMock.mock.calls[2][0]).toBe(
          `Incoming manifest ADDs: ${sampleManifestRecords.b.signature}`,
        );
        expect(consoleDebugMock.mock.calls[3][0]).toBe(
          `Incoming manifest ADDs: ${sampleManifestRecords.c.signature}`,
        );

        expect(consoleDebugMock.mock.calls.length).toBe(4);

        consoleDebugMock.mockRestore();
      });

      it('populates the manifest store after starting', async () => {
        nockGoodManifestABC();
        const cache = defaultCache();
        const cacheSetSpy = jest.spyOn(cache, 'set');
        await createAgent({ cache }).start();

        // There are three operations in the manifest above.
        expect(cacheSetSpy).toHaveBeenCalledTimes(3);
        expectCacheSpyOperationEach(cacheSetSpy, ['a', 'b', 'c']);
        await expectCacheHasOperationEach(cache, ['a', 'b', 'c']);

        cacheSetSpy.mockRestore();
      });

      it('starts polling successfully', async () => {
        nockGoodManifestABC();
        const cache = defaultCache();
        const cacheSetSpy = jest.spyOn(cache, 'set');
        const cacheDeleteSpy = jest.spyOn(cache, 'delete');
        const agent = createAgent({ cache });
        jest.useFakeTimers();
        await agent.start();

        // Three additions, no deletions.
        expect(cacheSetSpy).toBeCalledTimes(3);
        expect(cacheDeleteSpy).toBeCalledTimes(0);

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

        expect(cacheSetSpy).toBeCalledTimes(3);
        expect(cacheDeleteSpy).toBeCalledTimes(0);
      });

      it('continues polling even after initial failure', async () => {
        nockFailedManifestForServiceAndSchema(
          genericServiceID,
          genericSchemaHash,
        );
        const cache = defaultCache();
        const cacheSetSpy = jest.spyOn(cache, 'set');
        const cacheDeleteSpy = jest.spyOn(cache, 'delete');
        const agent = createAgent({ cache });
        jest.useFakeTimers();
        await agent.start();

        expect(cacheSetSpy).toBeCalledTimes(0);
        expect(cacheDeleteSpy).toBeCalledTimes(0);

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
        expect(cacheSetSpy).toBeCalledTimes(0);
      });

      it('purges operations which are removed from the manifest', async () => {
        const cache = defaultCache();
        const cacheSetSpy = jest.spyOn(cache, 'set');
        const cacheDeleteSpy = jest.spyOn(cache, 'delete');

        // Intentionally not calling start, since we're not testing intervals.
        const agent = createAgent({ cache });
        expect(cacheSetSpy).toBeCalledTimes(0);

        nockGoodManifestABC(); // Starting with ABC.
        await agent.checkForUpdate();
        expect(agent._timesChecked).toBe(1);
        expect(cacheSetSpy).toBeCalledTimes(3);
        expect(cacheDeleteSpy).toBeCalledTimes(0);
        await expectCacheHasOperationEach(cache, ['a', 'b', 'c']);

        nockGoodManifestAB(); // Just AB in this manifest.
        await agent.checkForUpdate();
        expect(agent._timesChecked).toBe(2);
        expect(cacheSetSpy).toBeCalledTimes(3); // no new sets.
        expect(cacheDeleteSpy).toBeCalledTimes(1);
        await expect(
          // Ensure that 'C' is gone!
          cache.get(getCacheKey(sampleManifestRecords.c.signature)),
        ).resolves.toBeUndefined();

        nockGoodManifestA(); // Just A in this manifest.
        await agent.checkForUpdate();
        expect(agent._timesChecked).toBe(3);
        expect(cacheSetSpy).toBeCalledTimes(3); // no new sets.
        expect(cacheDeleteSpy).toBeCalledTimes(2); // one more deletion
        await expect(
          // Ensure that 'B' is gone!
          cache.get(getCacheKey(sampleManifestRecords.b.signature)),
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
  return `/${hashedServiceId(serviceID)}/${schemaHash}`;
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
    version: 1,
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
