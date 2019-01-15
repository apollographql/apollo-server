import LRU from 'lru-cache';
import { KeyValueCache } from './KeyValueCache';

function defaultLengthCalculation(item: any) {
  if (Array.isArray(item) || typeof item === 'string') {
    return item.length;
  }

  // Go with the lru-cache default "naive" size, in lieu anything better:
  //   https://github.com/isaacs/node-lru-cache/blob/a71be6cd/index.js#L17
  return 1;
}

export class InMemoryLRUCache<V = string> implements KeyValueCache<V> {
  private store: LRU.Cache<string, V>;

  // FIXME: Define reasonable default max size of the cache
  constructor({
    maxSize = Infinity,
    sizeCalculator = defaultLengthCalculation,
    onDispose,
  }: {
    maxSize?: number;
    sizeCalculator?: (value: V, key: string) => number;
    onDispose?: (key: string, value: V) => void;
  } = {}) {
    this.store = new LRU({
      max: maxSize,
      length: sizeCalculator,
      dispose: onDispose,
    });
  }

  async get(key: string) {
    return this.store.get(key);
  }
  async set(key: string, value: V, options?: { ttl?: number }) {
    const maxAge = options && options.ttl && options.ttl * 1000;
    this.store.set(key, value, maxAge);
  }
  async delete(key: string) {
    this.store.del(key);
  }
  async flush(): Promise<void> {
    this.store.reset();
  }
  async getTotalSize() {
    return this.store.length;
  }
}
