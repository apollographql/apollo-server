import type {
  KeyValueCache,
  KeyValueCacheSetOptions,
} from 'apollo-server-caching';

export class MapKeyValueCache<V> implements KeyValueCache<V> {
  store = new Map<string, V>();
  async get(key: string) {
    return this.store.get(key);
  }
  async set(key: string, value: V, _?: KeyValueCacheSetOptions) {
    this.store.set(key, value);
  }
  async delete(key: string) {
    this.store.delete(key);
  }
  get size() {
    return this.store.size;
  }
}
