/** Options for {@link KeyValueCache.set} */
export interface KeyValueCacheSetOptions {
  /**
   * Specified in **seconds**, the time-to-live (TTL) value limits the lifespan
   * of the data being stored in the cache.
   */
  ttl?: number | null
};

export interface KeyValueCache<V = string> {
  get(key: string): Promise<V | undefined>;
  set(key: string, value: V, options?: KeyValueCacheSetOptions): Promise<void>;
  delete(key: string): Promise<boolean | void>;
}

export interface TestableKeyValueCache<V = string> extends KeyValueCache<V> {
  // Drops all data from the cache. This should only be used by test suites ---
  // production code should never drop all data from an end user cache (and
  // notably, PrefixingKeyValueCache intentionally doesn't implement this).
  flush?(): Promise<void>;
  // Close connections associated with this cache.
  close?(): Promise<void>;
}
