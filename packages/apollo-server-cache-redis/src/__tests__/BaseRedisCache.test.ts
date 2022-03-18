import { BaseRedisCache, RedisClient } from '../index';
import { runKeyValueCacheTests } from 'apollo-server-caching';
import FakeTimers from '@sinonjs/fake-timers';

const getRedisClient = (store: { [key: string]: string }, timeouts: NodeJS.Timer[]) => {
  return {
    set: jest.fn(
      (key: string, value: string, ...args: Array<any>) => {
        if (!store[key] || !args.includes("NX")) {
          store[key] = value;
          if (args[0] === 'EX' && args[1]) {
            timeouts.push(setTimeout(() => delete store[key], args[1]* 1000));
          }
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
  }
}

describe('BaseRedisCache', () => {
  it('run apollo-server-caching test suite', async () => {
    const store: { [key: string]: string } = {};
    const timeouts: NodeJS.Timer[] = [];
    const testRedisClient: RedisClient = getRedisClient(store, timeouts);
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

  it('allows you to pass the NX option', async () => {
    const store: { [key: string]: string } = {};
    const timeouts: NodeJS.Timer[] = [];
    const testRedisClient: RedisClient = getRedisClient(store, timeouts);
    const cache = new BaseRedisCache({ client: testRedisClient });
    const clock = FakeTimers.install();
    try {
      await cache.set('hello', 'world', { redisOptions: ["NX"] });
      assertEqual(await cache.get('hello'), 'world');

      await cache.set('hello', 'world again', { redisOptions: ["NX"] });
      assertEqual(await cache.get('hello'), 'world');
    } finally {
      timeouts.forEach((t) => clearTimeout(t));
      clock.uninstall();
      await cache.close();
    }
  });
});

function assertEqual<T>(actual: T, expected: T) {
  if (actual === expected) {
    return;
  }
  throw Error(`Expected ${actual} to equal ${expected}`);
}
