import { UnboundedCache } from '../utils/UnboundedCache';

describe('UnboundedCache', () => {
  beforeAll(() => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('basic get, set, delete', async () => {
    const cache = new UnboundedCache();

    await cache.set('key', 'value');
    expect(await cache.get('key')).toBe('value');

    await cache.delete('key');
    expect(await cache.get('key')).toBeUndefined();
  });

  it('get with ttl', async () => {
    const cache = new UnboundedCache();

    // 1s, or 1000ms
    await cache.set('key', 'value', { ttl: 1 });

    // check that it's there at 999ms
    jest.advanceTimersByTime(999);
    expect(await cache.get('key')).toBe('value');

    // expire
    jest.advanceTimersByTime(1);
    expect(await cache.get('key')).toBeUndefined();
  });
});
