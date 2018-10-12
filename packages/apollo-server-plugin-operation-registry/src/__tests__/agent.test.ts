import nock from 'nock';
import { InMemoryLRUCache, KeyValueCache } from 'apollo-server-caching';
import { envOverrideOperationManifest, getCacheKey } from '../common';
import { resolve as urlResolve } from 'url';
import { createHash } from 'crypto';

const fakeBaseUrl = 'https://myfakehost/';

const defaultCache = () => new InMemoryLRUCache();

const getRequiredAgentOptions = (
  {
    cache = defaultCache(),
  }: {
    cache?: KeyValueCache;
  } = { cache: defaultCache() },
) => ({
  schemaHash: 'abc123',
  engine: { serviceID: 'test-service' },
  cache,
});

const hashedServiceId = createHash('sha512')
  .update('test-service')
  .digest('hex');

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

  interface FetchTests {
    originalEnvApolloOpManifestBaseUrl?: string;
    Agent: typeof import('../agent').default;
    agent: import('../agent').default;
    cache: KeyValueCache;
    instantiateAndStartAgent: Function;
    getOperationManifestUrl: typeof import('../common').getOperationManifestUrl;
  }

  describe('fetches', function(this: FetchTests) {
    beforeAll(() => {
      // Override the tests URL with the one we want to mock/nock/test.
      this.originalEnvApolloOpManifestBaseUrl =
        process.env[envOverrideOperationManifest];
      process.env[envOverrideOperationManifest] = fakeBaseUrl;

      // Reset the modules so they're ready to be imported.
      jest.resetModules();

      // Import what we need and store it on the local scope.
      this.Agent = require('../agent').default;
      this.getOperationManifestUrl = require('../common').getOperationManifestUrl;
    });

    afterAll(() => {
      // Put the environment overrides back how they were.
      if (this.originalEnvApolloOpManifestBaseUrl) {
        process.env[
          envOverrideOperationManifest
        ] = this.originalEnvApolloOpManifestBaseUrl;
      } else {
        delete process.env[envOverrideOperationManifest];
      }

      // Reset modules again.
      jest.resetModules();
    });

    it('correctly prepared the test environment', () => {
      expect(this.getOperationManifestUrl('abc123', 'def456')).toStrictEqual(
        urlResolve(fakeBaseUrl, '/abc123/def456'),
      );
    });

    describe('manifest checking and cache populating', () => {
      const expectedPath = `/${hashedServiceId}/abc123`;
      beforeEach(() => {
        nock(fakeBaseUrl)
          .get(/.*/)
          .reply(200, {
            version: 1,
            operations: [
              {
                signature:
                  'ba4573fca2e1491fd54b9f398490531ad6327b00610f2c1216dc8c9c4cfd2993',
                document:
                  'mutation toggleMovieLike($id:ID!){toggleLike(id:$id){__typename id isLiked}}',
              },
              {
                signature:
                  '32a21510374c3c9ad25e06424085c45ccde29bdbdedf8fa806c2bc6a2ffcdf56',
                document: '{nooks:books{author}}',
              },
              {
                signature:
                  'c60ac6dfe19ba70dd9d6a29a275fae56296dcbb636eeaab55c3d9b7287c40a47',
                document: '{nooks:books{__typename author}}',
              },
            ],
          });

        this.cache = new InMemoryLRUCache();

        this.instantiateAndStartAgent = async () => {
          this.agent = new this.Agent({
            ...getRequiredAgentOptions({ cache: this.cache }),
            debug: true,
          });
          return await this.agent.start();
        };
      });

      afterEach(() => {
        if (this.agent) this.agent.stop();
      });

      it('fetches the manifest after starting', () => {
        const consoleSpy = jest
          .spyOn(global.console, 'debug')
          .mockImplementation(() => {});
        this.instantiateAndStartAgent();
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenNthCalledWith(
          1,
          `Checking for manifest changes at ${urlResolve(
            fakeBaseUrl,
            expectedPath,
          )}`,
        );
        consoleSpy.mockRestore();
      });

      it('populates the cache', async () => {
        const consoleSpy = jest
          .spyOn(global.console, 'debug')
          .mockImplementation(() => {});
        const cacheSpy = jest.spyOn(this.cache, 'set');
        await this.instantiateAndStartAgent();

        // There are three operations in the manifest above.
        expect(cacheSpy).toHaveBeenCalledTimes(3);

        // 1
        expect(
          this.cache.get(
            getCacheKey(
              'ba4573fca2e1491fd54b9f398490531ad6327b00610f2c1216dc8c9c4cfd2993',
            ),
          ),
        ).resolves.toStrictEqual(
          'mutation toggleMovieLike($id:ID!){toggleLike(id:$id){__typename id isLiked}}',
        );

        // 2
        expect(
          this.cache.get(
            getCacheKey(
              '32a21510374c3c9ad25e06424085c45ccde29bdbdedf8fa806c2bc6a2ffcdf56',
            ),
          ),
        ).resolves.toStrictEqual('{nooks:books{author}}');

        // 3
        expect(
          this.cache.get(
            getCacheKey(
              'c60ac6dfe19ba70dd9d6a29a275fae56296dcbb636eeaab55c3d9b7287c40a47',
            ),
          ),
        ).resolves.toStrictEqual('{nooks:books{__typename author}}');

        cacheSpy.mockRestore();
        consoleSpy.mockRestore();
      });
    });
  });
});
