import LRUCache from 'lru-cache';
import Keyv, { Store } from 'keyv';

// LRUCache wrapper to implement the Keyv `Store` interface.
export class LRUStore<T> implements Store<T> {
  private cache: LRUCache<string, T>;

  constructor(lruCacheOpts: LRUCache.Options<string, T>) {
    this.cache = new LRUCache({
      // default size calculator for strings and serializable objects, else
      // naively return 1
      sizeCalculation,
      ...lruCacheOpts,
    });
  }

  set(key: string, value: T, ttl?: number) {
    return this.cache.set(key, value, { ttl });
  }

  get(key: string) {
    return this.cache.get(key);
  }

  delete(key: string) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  keys() {
    const keys = [];
    for (const key of this.cache.keys()) {
      keys.push(key);
    }
    return keys;
  }
}

// This class allows us to take an existing Keyv cache and "wrap" its incoming
// keys with a prefix. Currently, a Keyv can only be used with a single
// namespace but one might suppose an addition to the set/get API which allows
// for multiple namespaces within a single Keyv cache.
export class PrefixingKeyv<
  T,
  Opts extends Record<string, any> = Record<string, any>,
> extends Keyv<T, Opts> {
  constructor(private wrapped: Keyv<T>, private prefix: string) {
    super();
  }

  override get<TRaw extends boolean = false>(
    key: string,
    opts?: { raw?: TRaw },
  ) {
    return this.wrapped.get(this.prefix + key, opts);
  }

  override set(key: string, value: T, ttl?: number) {
    return this.wrapped.set(this.prefix + key, value, ttl);
  }

  override delete(key: string) {
    return this.wrapped.delete(this.prefix + key);
  }
}

export function sizeCalculation<T>(item: T) {
  if (typeof item === 'string') {
    return item.length;
  }
  if (typeof item === 'object') {
    // will throw if the object has circular references
    return Buffer.byteLength(JSON.stringify(item), 'utf8');
  }
  return 1;
}
