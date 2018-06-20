import * as LRU from 'lru-cache';
import { KeyValueCache } from './KeyValueCache';

export class InMemoryLRUCache implements KeyValueCache {
  private store: LRU.Cache<string, string>;

  // FIXME: Define reasonable default max size of the cache
  constructor({ maxSize = Infinity }: { maxSize?: number } = {}) {
    this.store = LRU({
      max: maxSize,
      length: item => item.length,
    });
  }

  async get(key: string) {
    return this.store.get(key);
  }
  async set(key: string, value: string) {
    this.store.set(key, value);
  }
}
