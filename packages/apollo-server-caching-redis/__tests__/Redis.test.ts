// use mock implementations for underlying databases
jest.mock('redis', () => require('redis-mock'));
jest.useFakeTimers(); // mocks out setTimeout that is used in redis-mock

import RedisKeyValueCache from '../src/index';
import { advanceTimeBy, mockDate, unmockDate } from '../__mocks__/date';

describe('Redis Connector', () => {
  let keyValueCache;

  beforeAll(() => {
    keyValueCache = new RedisKeyValueCache({ host: 'localhost' });
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
    expect(await keyValueCache.get('short')).toBe('s');
    expect(await keyValueCache.get('long')).toBe('l');
    advanceTimeBy(1500);
    jest.advanceTimersByTime(1500);
    expect(await keyValueCache.get('short')).not.toBeDefined();
    expect(await keyValueCache.get('long')).toBe('l');
    advanceTimeBy(4000);
    jest.advanceTimersByTime(4000);
    expect(await keyValueCache.get('short')).not.toBeDefined();
    expect(await keyValueCache.get('long')).not.toBeDefined();
  });
});
