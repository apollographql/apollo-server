import { BaseRedisCache, RedisClient } from '../index';
import { runKeyValueCacheTests } from 'apollo-server-caching';
import FakeTimers from '@sinonjs/fake-timers';

describe('BaseRedisCache', () => {
  it('run apollo-server-caching test suite', async () => {
    const store: { [key: string]: string } = {};
    const timeouts: NodeJS.Timer[] = [];
    const testRedisClient: RedisClient = {
      set: jest.fn(
        (key: string, value: string, option?: string, ttl?: number) => {
          store[key] = value;
          if (option === 'EX' && ttl) {
            timeouts.push(setTimeout(() => delete store[key], ttl * 1000));
          }
          return Promise.resolve();
        },
      ),
      mget: jest.fn((...keys) =>
        Promise.resolve(keys.map((key: string) => store[key])),
      ),
      flushdb: jest.fn(() => Promise.resolve()),
      del: jest.fn((key: string) => {
        const keysDeleted = store.hasOwnProperty(key) ? 1 : 0;
        delete store[key];
        return Promise.resolve(keysDeleted);
      }),
      quit: jest.fn(() => Promise.resolve()),
    };
    const cache = new BaseRedisCache({ client: testRedisClient });
    const clock = FakeTimers.install();

    try {
      await runKeyValueCacheTests(cache, (ms: number) => clock.tick(ms));
    } finally {
      timeouts.forEach((t) => clearTimeout(t));
      clock.uninstall();
      await cache.close();
    }
  });
});
