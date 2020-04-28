import { SerialMultiCache } from '../SerialMultiCache';
import { KeyValueCache } from '../KeyValueCache';

function getMockCache(
  cache: Record<string, number> = {},
): KeyValueCache<number> {
  const get = jest.fn(async (key: string) => cache[key]);
  const set = jest.fn(async (key: string, value: number) => {
    cache[key] = value;
  });
  const del = jest.fn(async (key: string) => delete cache[key]);

  return { get, set, delete: del };
}

let multiCache: SerialMultiCache<number>;
let tier0: KeyValueCache<number>;
let tier1: KeyValueCache<number>;
let tier2: KeyValueCache<number>;

beforeEach(() => {
  tier0 = getMockCache({ zero: 0 });
  tier1 = getMockCache({ one: 1 });
  tier2 = getMockCache({ two: 2 });

  multiCache = new SerialMultiCache([tier0, tier1, tier2]);
});

describe('SerialMultiCache', () => {
  describe('get', () => {
    it("returns cached value on first cache hit, doesn't look further (hit tier0)", async () => {
      const result = await multiCache.get('zero');

      expect(result).toEqual(0);
      expect(tier0.get).toHaveBeenCalled();
      expect(tier1.get).not.toHaveBeenCalled();
    });

    it("returns cached value on first cache hit, doesn't look further (hit tier1)", async () => {
      const result = await multiCache.get('one');

      // expect a call up the chain until a hit
      expect(tier0.get).toHaveBeenCalled();
      expect(tier1.get).toHaveBeenCalled();
      expect(tier2.get).not.toHaveBeenCalled();

      expect(result).toEqual(1);

      // expect lower tiers to have been populated with the result
      expect(tier0.set).toHaveBeenCalledWith('one', 1);
      expect(await tier0.get('one')).toEqual(1);
    });

    it('returns cached value from tier2 cache and populates tier0 and tier1', async () => {
      const result = await multiCache.get('two');

      // expect a call up the chain until a hit
      expect(tier0.get).toHaveBeenCalled();
      expect(tier1.get).toHaveBeenCalled();
      expect(tier2.get).toHaveBeenCalled();

      expect(result).toEqual(2);

      // expect lower tiers to have been populated with the result
      expect(tier0.set).toHaveBeenCalledWith('two', 2);
      expect(tier1.set).toHaveBeenCalledWith('two', 2);
      expect(await tier0.get('two')).toEqual(2);
      expect(await tier1.get('two')).toEqual(2);
    });
  });

  it('sets a cached value on all tiers', async () => {
    multiCache.set('three', 3);

    expect(await tier0.get('three')).toEqual(3);
    expect(await tier1.get('three')).toEqual(3);
    expect(await tier2.get('three')).toEqual(3);
  });

  it('deletes a cached value from all tiers', async () => {
    // populate all caches with the 'two' entry
    const result = await multiCache.get('two');
    expect(result).toEqual(2);

    multiCache.delete('two');

    expect(await multiCache.get('two')).toBeUndefined();
  });
});
