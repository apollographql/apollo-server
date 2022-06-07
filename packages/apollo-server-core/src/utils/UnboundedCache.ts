import type { KeyValueCache } from '@apollo/utils.keyvaluecache';

export class UnboundedCache<T = string> implements KeyValueCache<T> {
  constructor(
    private cache: Map<
      string,
      { value: T; deadline: number | null }
    > = new Map(),
  ) {}

  async get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (entry.deadline && entry.deadline <= Date.now()) {
      await this.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async set(
    key: string,
    value: T,
    { ttl }: { ttl: number | null } = { ttl: null },
  ) {
    this.cache.set(key, {
      value,
      deadline: ttl ? Date.now() + ttl * 1000 : null,
    });
  }

  async delete(key: string) {
    this.cache.delete(key);
  }
}
