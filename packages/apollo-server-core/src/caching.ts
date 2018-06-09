export interface PersistedQueryCache {
  set(key: string, data: string): Promise<any>;
  get(key: string): Promise<string | null>;
}

export interface KeyValueCache extends PersistedQueryCache {
  set(
    key: string,
    data: string,
    options?: {
      ttl?: number;
      tags?: string[];
    },
  ): Promise<void>;
  get(key: string): Promise<string> | Promise<null | undefined>;
  invalidateTags(tags: string[]): Promise<void>;
}
