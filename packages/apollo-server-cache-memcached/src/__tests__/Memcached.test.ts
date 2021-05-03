// use mock implementations for underlying databases
jest.mock('memcached', () => require('memcached-mock'));

import { MemcachedCache } from '../index';
import { runKeyValueCacheTests } from 'apollo-server-caching';
import FakeTimers from '@sinonjs/fake-timers';

describe('Memcached', () => {
  it('run apollo-server-caching test suite', async () => {
    const cache = new MemcachedCache('localhost');
    const clock = FakeTimers.install();
    try {
      await runKeyValueCacheTests(cache, (ms: number) => clock.tick(ms));
    } finally {
      clock.uninstall();
      await cache.close();
    }
  });
});
