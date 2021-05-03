import { InMemoryLRUCache } from '../InMemoryLRUCache';
import { runKeyValueCacheTests } from 'apollo-server-caching';
import FakeTimers from '@sinonjs/fake-timers';

describe('InMemoryLRUCache', () => {
  it('run apollo-server-caching test suite', async () => {
    const cache = new InMemoryLRUCache();
    const clock = FakeTimers.install();
    try {
      await runKeyValueCacheTests(cache, (ms: number) => clock.tick(ms));
    } finally {
      clock.uninstall();
    }
  });
});
