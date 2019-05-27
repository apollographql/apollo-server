import { KeyValueCache } from './KeyValueCache';

// PrefixingKeyValueCache wraps another cache and adds a prefix to all keys used
// by all operations.  This allows multiple features to share the same
// underlying cache without conflicts.
//
// Note that PrefixingKeyValueCache explicitly does not implement
// TestableKeyValueCache, and notably does not implement the flush()
// method. Most implementations of TestableKeyValueCache.flush() send a simple
// command that wipes the entire backend cache system, which wouldn't support
// "only wipe the part of the cache with this prefix", so trying to provide a
// flush() method here could be confusingly dangerous.
export class PrefixingKeyValueCache<V = string> implements KeyValueCache<V> {
  constructor(private wrapped: KeyValueCache<V>, private prefix: string) {}

  get(key: string) {
    return this.wrapped.get(this.prefix + key);
  }
  set(key: string, value: V, options?: { ttl?: number }) {
    return this.wrapped.set(this.prefix + key, value, options);
  }
  delete(key: string) {
    return this.wrapped.delete(this.prefix + key);
  }
}
