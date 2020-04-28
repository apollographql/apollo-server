import {
  TestableKeyValueCache,
  KeyValueCacheSetOptions,
} from './KeyValueCache';

/**
 * The SerialMultiCache class's purpose is to support a number of cache implementations
 * with fallback behavior. The order of the provided `caches` argument is important - it
 * determines the order in which the multicache will look, with the zero index being first
 * and so on. A good application of this multicache might be, for example, an
 * `InMemoryCache` followed by a `RedisCache`. Expected behavior of the multicache:
 *   1. `get()` will look to the first cache, then second, etc. until it finds a result.
 *       Upon a cache hit, all previous caches that missed will be populated with the
 *       result.
 *   2. `set()` will populate all caches with the provided value.
 *   3. `delete()` will clear the entry from all caches.
 *   4. `flush()` will call `flush()` on each cache if the function is implemented.
 *   5. `close()` will call `close()` on each cache if the function is implemented.
 */
export class SerialMultiCache<T = string> implements TestableKeyValueCache<T> {
  constructor(private caches: TestableKeyValueCache<T>[]) {}

  async get(key: string) {
    let foundIndex = 0;
    let result: T | undefined;
    for (const cache of this.caches) {
      result = await cache.get(key);
      // cache hit, we don't need to look any further in our array of caches
      if (typeof result !== 'undefined') break;
      foundIndex++;
    }

    // Populate the cache misses with the result
    if (result) {
      for (let i = 0; i < foundIndex; i++) {
        this.caches[i].set(key, result);
      }
    }

    return result;
  }

  async set(key: string, value: T, options?: KeyValueCacheSetOptions) {
    for (const cache of this.caches) {
      cache.set(key, value, options);
    }
  }

  async delete(key: string) {
    for (const cache of this.caches) {
      cache.delete(key);
    }
  }

  async flush() {
    for (const cache of this.caches) {
      cache.flush?.();
    }
  }

  async close() {
    for (const cache of this.caches) {
      cache.close?.();
    }
  }
}
