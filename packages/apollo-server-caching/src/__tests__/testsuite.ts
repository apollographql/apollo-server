import { advanceTimeBy, mockDate, unmockDate } from '__mocks__/date';

export function testKeyValueCache(keyValueCache: any) {
  describe('KeyValueCache Test Suite', () => {
    beforeAll(() => {
      mockDate();
      jest.useFakeTimers();
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
      expect(await keyValueCache.get('missing')).toBeUndefined();
    });

    it('can do a basic set and delete', async () => {
      await keyValueCache.set('hello', 'world');
      expect(await keyValueCache.get('hello')).toBe('world');
      await keyValueCache.delete('hello');
      expect(await keyValueCache.get('hello')).toBeUndefined();
    });

    it('is able to expire keys based on ttl', async () => {
      await keyValueCache.set('short', 's', { ttl: 1 });
      await keyValueCache.set('long', 'l', { ttl: 5 });
      expect(await keyValueCache.get('short')).toBe('s');
      expect(await keyValueCache.get('long')).toBe('l');
      advanceTimeBy(1500);
      jest.advanceTimersByTime(1500);
      expect(await keyValueCache.get('short')).toBeUndefined();
      expect(await keyValueCache.get('long')).toBe('l');
      advanceTimeBy(4000);
      jest.advanceTimersByTime(4000);
      expect(await keyValueCache.get('short')).toBeUndefined();
      expect(await keyValueCache.get('long')).toBeUndefined();
    });
  });
}
