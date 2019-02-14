export interface KeyValueCache<V = string> {
  get(key: string): Promise<V | undefined>;
  set(key: string, value: V, options?: { ttl?: number }): Promise<void>;
  delete(key: string): Promise<boolean | void>;
}
