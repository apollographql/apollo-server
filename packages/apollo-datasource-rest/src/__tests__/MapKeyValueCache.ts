import type { KeyValueCache } from '@apollo/utils.keyvaluecache';

export class MapKeyValueCache<V> implements KeyValueCache<V> {
  store = new Map<string, V>();
  async get(key: string) {
    return this.store.get(key);
  }
  async set(key: string, value: V) {
    this.store.set(key, value);
  }
  async delete(key: string) {
    this.store.delete(key);
  }
  get size() {
    return this.store.size;
  }
}
