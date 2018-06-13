import {} from 'jest';
import { servers, delay } from '../__mocks__/common';
import MemcachedKeyValueCache from '../connectors/memcached';
import RedisKeyValueCache from '../connectors/redis';
import each from 'jest-each';

// run test suite against each implementation of KeyValueCache
each([
  ['Memcached Connector', new MemcachedKeyValueCache(servers.memcachedHost)],
  ['Redis Connector', new RedisKeyValueCache({ host: servers.redisHost })],
]).describe('%s', (description, keyValueCache) => {
  beforeEach(() => {
    keyValueCache.flush();
  });

  afterAll(() => {
    keyValueCache.close();
  });

  it('can do a basic get and set', async () => {
    await keyValueCache.set('hello', 'world');
    expect(await keyValueCache.get('hello')).toBe('world');
    expect(await keyValueCache.get('missing')).not.toBeDefined();
  });

  it('is able to expire keys based on ttl', async () => {
    await keyValueCache.set('short', 's', { ttl: 1 });
    await keyValueCache.set('long', 'l', { ttl: 5 });
    await delay(1500);
    expect(await keyValueCache.get('short')).not.toBeDefined();
    expect(await keyValueCache.get('long')).toBe('l');
  });
});
