import {} from 'jest'; // makes my editor happy

// use mock implementations for underlying databases
jest.mock('memcached', () => require('memcached-mock'));
jest.mock('redis', () => require('redis-mock'));
jest.useFakeTimers(); // mocks out setTimeout that is used in redis-mock

import MemcachedKeyValueCache from '../connectors/memcached';
import RedisKeyValueCache from '../connectors/redis';
import { advanceTimeBy, mockDate, unmockDate } from '../__mocks__/date';

// run test suite against each implementation of KeyValueCache
describe.each([
  ['Memcached Connector', new MemcachedKeyValueCache('mockhostname')],
  ['Redis Connector', new RedisKeyValueCache({ host: 'mockhostname' })],
])('%s', (description, keyValueCache) => {
  beforeAll(() => {
    mockDate();
  });

  beforeEach(() => {
    keyValueCache.flush();
  });

  afterAll(() => {
    unmockDate();
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
    advanceTimeBy(1500);
    jest.advanceTimersByTime(1500);
    expect(await keyValueCache.get('short')).not.toBeDefined();
    expect(await keyValueCache.get('long')).toBe('l');
  });
});
