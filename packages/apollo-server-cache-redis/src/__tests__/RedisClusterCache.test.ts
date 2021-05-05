jest.mock('ioredis', () => require('./mockIoredis'));

import { RedisClusterCache } from '../index';
import { runKeyValueCacheTests } from 'apollo-server-caching';
import FakeTimers from '@sinonjs/fake-timers';

describe('Redis', () => {
  it('run apollo-server-caching test suite', async () => {
    const cache = new RedisClusterCache([{ host: 'localhost' }]);
    const clock = FakeTimers.install();
    try {
      await runKeyValueCacheTests(cache, (ms: number) => clock.tick(ms));
    } finally {
      clock.uninstall();
      await cache.close();
    }
  });
});
