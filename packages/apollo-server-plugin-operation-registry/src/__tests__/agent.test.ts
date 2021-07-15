import nock from 'nock';
import { InMemoryLRUCache } from 'apollo-server-caching';
import { resolve as urlResolve } from 'url';
import {
  defaultAgentOptions,
  genericServiceID,
  genericStorageSecret,
  nockStorageSecret,
  nockBase,
  nockGoodManifestsUnderStorageSecret,
  defaultStore,
  defaultTestAgentPollSeconds,
  nockStorageSecretOperationManifest,
  genericApiKeyHash,
} from './helpers.test-helpers';
import Agent, { AgentOptions } from '../agent';
import { Operation } from '../ApolloServerPluginOperationRegistry';
import {
  fakeTestBaseUrl,
  getStoreKey,
  getOperationManifestUrl,
  urlOperationManifestBase,
} from '../common';
import { Logger } from 'apollo-server-types';

// These get a bit verbose within the tests below, so we use this as a
// sample store to pick and grab from.
const sampleManifestRecords: Record<string, Operation> = {
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

const manifest = (...operations: Operation[]) => ({
  version: 2,
  operations,
});

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
  });

  describe('with manifest', () => {
    const forCleanup: {
      store?: InMemoryLRUCache;
      agent?: import('../agent').default;
    }[] = [];

    function createAgent({ ...args }: Partial<AgentOptions> = {}) {
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
        throw new Error(
          `Not all nock interceptors were used! Pending mocks: ${nock.pendingMocks()}`,
        );
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

    describe('manifest checking and store populating', () => {
      function expectStoreSpyOperationEach(
        spy: jest.SpyInstance,
        letters: string[],
      ) {
        letters.forEach((letter) => {
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
        nockStorageSecret(genericServiceID, genericApiKeyHash);
        nockGoodManifestsUnderStorageSecret(
          genericServiceID,
          genericStorageSecret,
          [
            sampleManifestRecords.a,
            sampleManifestRecords.b,
            sampleManifestRecords.c,
          ],
        );
        const relevantLogs: any = [];
        const logger: Logger = {
          debug: jest.fn().mockImplementation((...args: any[]) => {
            if (
              typeof args[0] === 'string' &&
              (args[0].match(/Checking for manifest changes/) ||
                args[0].match(/Incoming manifest ADDs/))
            ) {
              relevantLogs.push(args);
            }
          }),
          warn: jest.fn().mockImplementation((...args: any[]) => {
            if (
              typeof args[0] === 'string' &&
              (args[0].match(/Checking for manifest changes/) ||
                args[0].match(/Incoming manifest ADDs/))
            ) {
              relevantLogs.push(args);
            }
          }),
          info: () => {},
          error: () => {},
        };
        await createAgent({ logger }).start();

        expect(relevantLogs[0][0]).toBe(
          `Checking for manifest changes at ${urlResolve(
            fakeTestBaseUrl,
            getOperationManifestUrl(
              genericServiceID,
              genericStorageSecret,
              'current',
            ),
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
      });

      it('populates the manifest store after starting', async () => {
        nockStorageSecret(genericServiceID, genericApiKeyHash);
        nockGoodManifestsUnderStorageSecret(
          genericServiceID,
          genericStorageSecret,
          [
            sampleManifestRecords.a,
            sampleManifestRecords.b,
            sampleManifestRecords.c,
          ],
        );
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
        nockStorageSecret(genericServiceID, genericApiKeyHash);
        nockGoodManifestsUnderStorageSecret(
          genericServiceID,
          genericStorageSecret,
          [
            sampleManifestRecords.a,
            sampleManifestRecords.b,
            sampleManifestRecords.c,
          ],
        );
        const store = defaultStore();
        const storeSetSpy = jest.spyOn(store, 'set');
        const storeDeleteSpy = jest.spyOn(store, 'delete');
        const agent = createAgent({ store });
        jest.useFakeTimers('legacy');
        await agent.start();

        // Three additions, no deletions.
        expect(storeSetSpy).toBeCalledTimes(3);
        expect(storeDeleteSpy).toBeCalledTimes(0);

        // Only the initial start-up check should have happened by now.
        expect(agent._timesChecked).toBe(1);

        // If it's one millisecond short of our next poll interval, nothing
        // should have changed yet.
        jest.advanceTimersByTime(defaultTestAgentPollSeconds * 1000 - 1);

        // Still only one check.
        expect(agent._timesChecked).toBe(1);

        // Now, we'll expect another request to go out, so we'll nock it.
        nockStorageSecret(genericServiceID, genericApiKeyHash);
        nockStorageSecretOperationManifest(
          genericServiceID,
          genericStorageSecret,
          304,
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

      it('purges operations which are removed from the manifest', async () => {
        const store = defaultStore();
        const storeSetSpy = jest.spyOn(store, 'set');
        const storeDeleteSpy = jest.spyOn(store, 'delete');

        // Intentionally not calling start, since we're not testing intervals.
        const agent = createAgent({ store });
        expect(storeSetSpy).toBeCalledTimes(0);

        nockStorageSecret(genericServiceID, genericApiKeyHash);
        nockGoodManifestsUnderStorageSecret(
          genericServiceID,
          genericStorageSecret,
          [
            sampleManifestRecords.a,
            sampleManifestRecords.b,
            sampleManifestRecords.c,
          ],
        ); // Starting with ABC.
        await agent.checkForUpdate();
        expect(agent._timesChecked).toBe(1);
        expect(storeSetSpy).toBeCalledTimes(3);
        expect(storeDeleteSpy).toBeCalledTimes(0);
        await expectStoreHasOperationEach(store, ['a', 'b', 'c']);

        nockStorageSecret(genericServiceID, genericApiKeyHash);
        nockGoodManifestsUnderStorageSecret(
          genericServiceID,
          genericStorageSecret,
          [sampleManifestRecords.a, sampleManifestRecords.b],
        ); // Just AB in this manifest.
        await agent.checkForUpdate();
        expect(agent._timesChecked).toBe(2);
        expect(storeSetSpy).toBeCalledTimes(3); // no new sets.
        expect(storeDeleteSpy).toBeCalledTimes(1);
        await expect(
          // Ensure that 'C' is gone!
          store.get(getStoreKey(sampleManifestRecords.c.signature)),
        ).resolves.toBeUndefined();

        nockStorageSecret(genericServiceID, genericApiKeyHash);
        nockGoodManifestsUnderStorageSecret(
          genericServiceID,
          genericStorageSecret,
          [sampleManifestRecords.a],
        ); // Just A in this manifest.
        await agent.checkForUpdate();
        expect(agent._timesChecked).toBe(3);
        expect(storeSetSpy).toBeCalledTimes(3); // no new sets.
        expect(storeDeleteSpy).toBeCalledTimes(2); // one more deletion
        await expect(
          // Ensure that 'B' is gone!
          store.get(getStoreKey(sampleManifestRecords.b.signature)),
        ).resolves.toBeUndefined();
      });

      describe('When given a graphVariant', () => {
        const graphVariant = 'different';
        const getOperationManifestRelativeUrl = (
          ...args: Parameters<typeof getOperationManifestUrl>
        ) =>
          getOperationManifestUrl(...args).replace(
            new RegExp(`^${urlOperationManifestBase}`),
            '',
          );

        it('fetches manifests for the corresponding variant', async () => {
          nockStorageSecret(genericServiceID, genericApiKeyHash);
          const agent = createAgent({
            apollo: {
              ...defaultAgentOptions.apollo,
              graphRef: `${genericServiceID}@${graphVariant}`,
            },
          });
          const nockedManifest = nockBase()
            .get(
              getOperationManifestRelativeUrl(
                genericServiceID,
                genericStorageSecret,
                graphVariant,
              ),
            )
            .reply(200, manifest(sampleManifestRecords.a));
          await agent.checkForUpdate();
          expect(nockedManifest.isDone()).toBe(true);
        });
      });
    });
  });
});
