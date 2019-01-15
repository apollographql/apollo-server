import LRU from 'lru-cache';
import { KeyValueCache } from './KeyValueCache';

export class InMemoryLRUCache<V = string> implements KeyValueCache<V> {
  private store: LRU.Cache<string, V>;

  // FIXME: Define reasonable default max size of the cache
  constructor({ maxSize = Infinity }: { maxSize?: number } = {}) {
    this.store = new LRU({
      max: maxSize,
      length(item) {
        if (Array.isArray(item) || typeof item === 'string') {
          return item.length;
        }

        // If it's an object, we'll use JSON.stringify+Buffer.byteLength to
        // approximate the size of what it would take to store.  It's certainly
        // not 100% accurate, but it should be a fast implementation which
        // doesn't require bringing in other dependencies or logic which we need
        // to maintain.  In the future, we might consider something like:
        // npm.im/object-sizeof, but this should be sufficient for now.
        if (typeof item === 'object') {
          return Buffer.byteLength(JSON.stringify(item), 'utf8');
        }

        // Go with the lru-cache default "naive" size, in lieu anything better:
        //   https://github.com/isaacs/node-lru-cache/blob/a71be6cd/index.js#L17
        return 1;
      },
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
}
